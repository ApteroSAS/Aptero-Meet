
export default class DistributedSoundSystem {
  audioBotList = {};
  constructor(networkService){
    networkService.onMessage("distributed-system-bot-creation", ({ session_id, type, body, from }) => {
      console.log(body);
      this.audioBotList[body] = true;
    });
    document.body.addEventListener("clientConnected", async (evt) => {
      //TODO create a sound emitter
      let streamClientId = evt.detail.clientId;
      if(this.audioBotList[streamClientId]) {
        //FIND if this id is a bot id for our purpose
        //window.APP.hubChannel.presence.state
        const stream = await NAF.connection.adapter.getMediaStream(streamClientId, "audio").catch(e => {
          console.error(`Error getting media stream for ${streamClientId}`, e);
        });
        console.log(stream);
        const audio = document.createElement('audio');
        audio.srcObject = stream;
        audio.play();
        /*const audioListener = AFRAME.scenes[0].sceneEl.audioListener;
        let data = {
          distanceModel:"inverse",
          refDistance:1,
          maxDistance:10000,
          rolloffFactor:0.000001,
          positional:true,
        };
        data.distanceModel= window.getPreferences("distanceModel") || "inverse";//Aptero patch for deactived spatial sound
        data.refDistance= window.getPreferences("refDistance") || 1;//Aptero patch for deactived spatial sound
        data.maxDistance = window.getPreferences("maxDistance") || 10000;//Aptero patch for deactived spatial sound
        data.rolloffFactor = window.getPreferences("rolloffFactor") || 0.000001;//Aptero patch for deactived spatial sound
        const audio = data.positional ? new THREE.PositionalAudio(audioListener) : new THREE.Audio(audioListener);
        if (data.positional) {
          audio.setDistanceModel(data.distanceModel);
          audio.setMaxDistance(data.maxDistance);
          audio.setRefDistance(data.refDistance);
          audio.setRolloffFactor(data.rolloffFactor);
        }

        let destination = audio.context.createMediaStreamDestination();
        let mediaStreamSource = audio.context.createMediaStreamSource(stream);
        const destinationSource = audio.context.createMediaStreamSource(destination.stream);
        mediaStreamSource.connect(destination);
        audio.setNodeSource(destinationSource);*/
      }
    });
  }
}