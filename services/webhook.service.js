import { Storage } from '@mondaycom/apps-sdk';

const deleteData = async (access_token, accountId) => {
    const storage = new Storage(access_token);
    const testKey = `user_data_${accountId}`;

    // Store data
    const storeResult = await storage.set(testKey, { test: "Hello World" }, { shared: true });
    console.log(storeResult.success ? "Data stored successfully!" : `Storage error: ${storeResult.error}`);

    // Wait for data to be properly stored (sometimes necessary)
    await new Promise((resolve) => setTimeout(resolve, 500));  

    // Try searching for the exact key
    const { value, version, success } = await storage.get(testKey, { shared: true });
    console.log(success ? `Retrieved Data: ${JSON.stringify(value)}` : "No data found");

    // Delete stored data
    const deleteResult = await storage.delete(testKey, { shared: true });
    console.log(deleteResult.success ? "User data deleted successfully!" : `Delete error: ${deleteResult.error}`);

    return deleteResult;
};

export default { deleteData };