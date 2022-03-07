import { Buffer } from "buffer";
import axios from "axios";

Buffer.from("anything", "base64");
let graph = require("@microsoft/microsoft-graph-client");

export class MicrosoftGraphService{

  setToken(accessToken){
    this.accessToken = accessToken;
    this.client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  async getUserDetails() {
    return await this.client.api("/me").get();
  }

  async getUserDetailsBetaV() {
    return await this.client.api("/me/profile")
      .version("beta")
      .get();
  }

  async getUserOrganization(account_type) {
    //https://graph.microsoft.com/v1.0/organization
    //check if the  user account is a work account (MSA For personal account and AAD for work account)
    if (account_type === "AAD") {
      const organization = await this.client.api("/organization").get();
      return organization.value[0].displayName;
    } else {
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
