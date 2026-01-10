import { exec } from "child_process";
import crypto from "crypto";
import axios from "axios";
import { secretToken, MONDAY_SIGNING_SECRET, MONDAY_API_TOKEN } from "../utils/config.js";

const initializeMapps = () => {
  return new Promise((resolve, reject) => {
    const command = `mapps init -t ${secretToken}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error initializing mapps:", error);
        reject(error);
      }  if (stderr) {
        console.error("mapps init stderr:", stderr);
        reject(stderr);
      }
        console.log("mapps initialized successfully:", stdout);
        resolve(stdout);
      
    });
  });
};

const deleteData = async (appId, accountId) => {
  try {
    console.log("deleteData started with:", appId, accountId);
    await initializeMapps();

    return new Promise((resolve, reject) => {
      const command = `echo yes | mapps storage:remove-data -a ${appId} -c ${accountId}`;

      console.log("Executing command:", command);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing delete command:", error);
          return reject(error);
        }
        if (stderr) {
          console.error("Delete stderr:", stderr);
          return reject(stderr);
        }

        console.log("Delete stdout:", stdout);
        resolve(stdout);
      });
    });
  } catch (error) {
    console.error("Error during deleteData execution:", error);
    return Promise.reject(error);
  }
};

/**
 * Verify Monday.com webhook signature (HMAC SHA256)
 * @param {string} rawBody - Raw request body string
 * @param {string} signature - Signature from header
 */
const verifySignature = (rawBody, signature) => {
  if (!MONDAY_SIGNING_SECRET) return false;
  if (!rawBody || !signature) return false;

  const hmac = crypto.createHmac("sha256", MONDAY_SIGNING_SECRET);
  hmac.update(rawBody);
  const expected = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
};

/**
 * Fetch item data from Monday.com via GraphQL
 * @param {string|number} itemId
 */
const fetchItemData = async (itemId) => {
  if (!MONDAY_API_TOKEN) {
    throw new Error("MONDAY_API_TOKEN is not configured");
  }

  const query = `
    query ($itemId: [ID!]) {
      items(ids: $itemId) {
        id
        name
        board { id name }
        column_values { id title text type value }
        parent_item { id name }
        updates(limit: 1) {
          creator { name }
          created_at
        }
      }
    }
  `;

  const variables = { itemId: [itemId] };

  try {
    const response = await axios.post(
      "https://api.monday.com/v2",
      { query, variables },
      {
        headers: {
          Authorization: MONDAY_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const items = response.data?.data?.items;
    if (!items || items.length === 0) {
      throw new Error("Item not found");
    }

    const item = items[0];
    const columnValues = item.column_values || [];
    const statusCol = columnValues.find((c) => c.type === "status");
    const peopleCol = columnValues.find((c) => c.type === "people");
    const dateCol = columnValues.find((c) => c.type === "date");

    let userName = 'Unknown';
    let updateTime = new Date().toLocaleString();
    if (item.updates && item.updates.length > 0) {
      const latestUpdate = item.updates[0];
      userName = latestUpdate.creator?.name || 'Unknown';
      updateTime = new Date(latestUpdate.created_at).toLocaleString();
    }

    return {
      itemId: item.id,
      itemName: item.name || "Untitled Item",
      boardId: item.board?.id,
      boardName: item.board?.name,
      status: statusCol?.text || "",
      assignee: peopleCol?.text || "",
      dueDate: dateCol?.text || "",
      parentName: item.parent_item?.name || null,
      columnValues,
      userName,
      updateTime
    };
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limit - wait and retry once
      console.warn("Monday API rate limit hit, waiting 5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      return fetchItemData(itemId); // Retry once
    }
    throw error;
  }
};

/**
 * Resolves recipient email based on configuration and item data.
 * @param {object} recipientConfig - { type: 'people'|'email'|'static', columnId?: string, staticEmail?: string }
 * @param {object} itemData - Data fetched for the item
 * @returns {Promise<string[]>} Array of resolved email addresses
 */
const resolveRecipients = async (recipientConfig, itemData) => {
  const recipients = [];

  if (!itemData || !recipientConfig) {
    return recipients;
  }

  switch (recipientConfig.type) {
    case 'people':
      if (recipientConfig.columnId) {
        const peopleCol = itemData.columnValues.find(c => c.id === recipientConfig.columnId);
        if (peopleCol?.value) {
          try {
            const value = JSON.parse(peopleCol.value);
            const persons = value.personsAndTeams || [];
            for (const person of persons) {
              if (person.id) {
                // Fetch user email from Monday API
                const userQuery = `query { users(ids: [${person.id}]) { email } }`;
                const response = await axios.post(
                  "https://api.monday.com/v2",
                  { query: userQuery },
                  { headers: { Authorization: MONDAY_API_TOKEN, "Content-Type": "application/json" } }
                );
                const user = response.data?.data?.users?.[0];
                if (user?.email) {
                  recipients.push(user.email);
                }
              }
            }
          } catch (e) {
            console.error("Error parsing people column value:", e);
          }
        }
      }
      break;
    case 'email':
      if (recipientConfig.columnId) {
        const emailCol = itemData.columnValues.find(c => c.id === recipientConfig.columnId);
        if (emailCol?.text) {
          const emails = emailCol.text.split(',').map(e => e.trim()).filter(e => e.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
          recipients.push(...emails);
        }
      }
      break;
    case 'static':
      if (recipientConfig.staticEmail && recipientConfig.staticEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        recipients.push(recipientConfig.staticEmail);
      }
      break;
    default:
      break;
  }
  return recipients;
};

export default { 
  deleteData,
  verifySignature,
  fetchItemData,
  resolveRecipients
};
