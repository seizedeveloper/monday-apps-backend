import { exec } from "child_process";
import { secretToken } from "../utils/config.js";

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


export default { deleteData };
