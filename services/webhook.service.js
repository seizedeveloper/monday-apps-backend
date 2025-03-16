import { Storage } from '@mondaycom/apps-sdk';


const deleteData = async (access_token) => {
    const storage = new Storage(access_token);


    const { success, error } = await storage.delete(url, { shared });

    if (success===true){
        const response = { message: "User data deleted successfully" };
    }
    else{
        const response = { message: error };
    }
    return response;

}

export default {deleteData};