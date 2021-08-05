import protooClient from "protoo-client";
import { getAdapterConfig } from "./adapter-config";

export class ProtooHelper{
  async init(_serverUrl){
    /*this._serverUrl = _serverUrl;
    const urlWithParams = new URL(this._serverUrl);
    let protooTransport;
    if(getAdapterConfig().transport && getAdapterConfig().transport==="WebSocketTransport"){
      protooTransport = new protooClient.WebSocketTransport(urlWithParams.toString());
    }else {
      protooTransport = new protooClient.WebSocketIOTransport(urlWithParams.toString());
    }
    this._protoo = new protooClient.Peer(protooTransport);

    await new Promise(res => {
      this._protoo.on("open", async () => {
        this._closed = false;
        res();
      });
    });

    this._protoo.on("disconnected", () => {    });
    this._protoo.on("close", () => {    });*/
  }

  async joint(_clientId,_device,_joinToken){
    /*return this._protoo.request("join", {
      displayName: _clientId,
      device: _device,
      rtpCapabilities: undefined,
      sctpCapabilities: undefined,
      token: _joinToken
    });*/
  }

  async kick(clientId,permsToken,room){
    return this._protoo
      .request("kick", {
        room_id: room,
        user_id: clientId,
        token: permsToken
      })
  }

  async block(clientId){
    return this._protoo.request("block", { whom: clientId })
  }

  async unblock(clientId){
    return this._protoo.request("unblock", { whom: clientId })
  }
}
