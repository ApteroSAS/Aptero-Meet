import { Buffer } from "buffer";
import axios from "axios";

Buffer.from("anything", "base64");

export class MicrosoftGraphService{

  init(client,token){
    this.accessToken = token;//TODO find this from client
    this.client = client;
  }

  async getUserDetails() {
    return await this.client.api("/me").get();
  }

  async getUserDetailsBetaV() {
    return await this.client.api("/me/profile")
      .version("beta")
      .get();
  }

  async getUserOrganization() {
    //https://graph.microsoft.com/v1.0/organization
    //check if the  user account is a work account (MSA For personal account and AAD for work account)
    try{
      const organization = await this.client.api("/organization").get();
      return organization.value[0].displayName;
    } catch(e) {
      return null;
    }

  }

  async getUserPhoto() {
    //const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/";
    const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/$value";
    try {
      // verifier si l'image exist
      const response = await axios(graphEndpoint, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
        responseType: "arraybuffer"
      });
      return new Buffer(response.data, "binary").toString("base64");
    } catch (e) {
      console.log("profile photo not found");
    }
    return null;
  }

}
