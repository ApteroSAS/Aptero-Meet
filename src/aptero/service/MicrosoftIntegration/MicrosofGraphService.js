import { func } from 'prop-types';
import {Buffer} from 'buffer';
import axios from "axios";
Buffer.from('anything','base64');
var graphe =require('@microsoft/microsoft-graph-client');
function getAuthenticatedClient(accessToken){
    
    const client=graphe.Client.init({
        authProvider: (done)=>{
            done(null,accessToken);
        }
    });
    return client;
}
export async function getUserDetails(accessToken)
{
    const client =getAuthenticatedClient(accessToken);
    
    const user=await client.api('/me').get();
   
    return user;
}
export async function getUserDetailsBetaV(accessToken)
{
    const client =getAuthenticatedClient(accessToken);
    const user_beta=await client.api('/me/profile')
    .version('beta')
    .get();
    return user_beta;
}

export  async function getUserorganization(accessToken,account_type)
{
    //https://graph.microsoft.com/v1.0/organization
    const client =getAuthenticatedClient(accessToken);
    //check if the  user account is a work account (MSA For personal account and AAD for work account)
    if(account_type==="AAD")
    {
        const organization= await client.api('/organization').get();
        return organization.value[0].displayName;
    }
    else{
        return null;
    }

}

export async function getUserPhoto(accessToken) {
    //const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/";
    const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/$value";
    try{
        // verifier si l'image exist
    const response = await axios(graphEndpoint, { headers: { Authorization: `Bearer ${accessToken}` }, responseType: 'arraybuffer' });
    const avatar = new Buffer(response.data, 'binary').toString('base64');
    return avatar;
    }
    catch(e)
    {
        console.log("profile photo not found");
    }
    return null;
 } 
