import { SOUND_PIN } from "../../systems/sound-effects-system";
import { choseAdapter } from "../adapter/adapter-config";
import { AdapterWarpper } from "../adapter/AdapterWrapper";
import { wait } from "../util/AsyncWaiter";
import configs from "../../utils/configs";

export async function changeAudioSubRoom(subroomid) {
  const oldParams = {
    roomId:APP.dialog._roomId,
    serverUrl: APP.dialog._serverUrl,
    serverParams: APP.dialog._serverParams,
    clientId: APP.dialog._clientId,
    forceTcp: APP.dialog._forceTcp,
    forceTurn: APP.dialog._forceTurn,
    iceTransportPolicy: APP.dialog._iceTransportPolicy
  }
  await APP.dialog.disconnect();

  const splitStr = subroomid.split(":");
  if(splitStr.length===2){
    const adapter = splitStr[0];
    if(configs.APP_CONFIG.adapterParams.adapter!==adapter) {
      await choseAdapter(adapter);
      APP.dialog = new AdapterWarpper();
    }
    await wait(()=>{return APP.dialog.lasyLoadingFinished});
    subroomid = splitStr[1];
  }

  let newRoomId;
  if(subroomid && subroomid === "default"){
    newRoomId = oldParams.roomId.split("-")[0];
  }else{
    newRoomId = oldParams.roomId+"-"+subroomid;
  }

  const data = await window.APP.hubChannel.fetchPermissions();
  const scene = AFRAME.scenes[0];
  await APP.dialog.connect({
      serverUrl: oldParams.serverUrl,
      roomId: newRoomId,
      joinToken: data.permsToken,
      serverParams: oldParams.serverParams,
      scene,
      clientId: oldParams.clientId,
      forceTcp: oldParams.forceTcp,
      forceTurn: oldParams.forceTurn,
      iceTransportPolicy: oldParams.iceTransportPolicy
    });

  scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_PIN);
  APP.messageDispatch.receive({
    type: "audio_sub_room_changed",
    subroom: subroomid,
    showLineBreak: true
  });
}

