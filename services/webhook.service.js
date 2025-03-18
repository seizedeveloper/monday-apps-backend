import { Storage } from '@mondaycom/apps-sdk';


const deleteData = async (access_token, accountId) => {  
    const storage = new Storage(access_token);

    const url = `user_data_${accountId}`;  // ✅ This key identifies the user's stored data

    const { success, error } = await storage.delete(url, { shared: true });

    return success 
        ? { message: "User data deleted successfully" } 
        : { message: error };
};

export default {deleteData};