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

export  async function getUserorganization(accessToken)
{
    //https://graph.microsoft.com/v1.0/organization
    const client =getAuthenticatedClient(accessToken);
    const organization= await client.api('/organization').get();
    return organization.value[0].displayName;
}
export async function getUserPhoto(accessToken) {
    const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/$value";

    const response = await axios(graphEndpoint, { headers: { Authorization: `Bearer ${accessToken}` }, responseType: 'arraybuffer' });
    const avatar = new Buffer(response.data, 'binary').toString('base64');
    return avatar;
 } 