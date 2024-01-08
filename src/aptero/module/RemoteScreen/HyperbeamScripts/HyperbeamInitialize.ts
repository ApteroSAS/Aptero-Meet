import Hyperbeam from "@hyperbeam/web";

declare const THREE;
declare const window;

export async function HyperbeamInitialize(screenElement, embedURL, hbProperties, texture, context, canvas, animationInterval, reconnectTimeout) {
  let connectionState = ''
  const hbRet = await Hyperbeam(screenElement, embedURL, {
    /*
      This section represent the Options object of Hyperbeam, more info here:
      https://docs.hyperbeam.com/client-sdk/javascript/reference#method-parameters
    */
    onConnectionStateChange: ({state}) => {
      connectionState = state;
    },
    
    delegateKeyboard: false,

    // Handle audio from Hyperbeam
    audioTrackCb: (track) => {
      const audioListener = screenElement.sceneEl.audioListener;
      
      if (hbProperties.HBAdvancedAudio) {
        if (hbProperties.audioType == 'pannernode') {
          const audio = new THREE.PositionalAudio(audioListener);
          audio.setMediaStreamSource(new MediaStream([track]));

          // Advanced positional audio
          const pannerNode = audio.getOutput();

          pannerNode.distanceModel = hbProperties.distanceModel;
          pannerNode.rolloffFactor = hbProperties.rolloffFactor;
          pannerNode.refDistance = hbProperties.refDistance;
          pannerNode.maxDistance = hbProperties.maxDistance;
          pannerNode.coneInnerAngle = hbProperties.coneInnerAngle;
          pannerNode.coneOuterAngle = hbProperties.coneOuterAngle;
          pannerNode.coneOuterGain = hbProperties.coneOuterGain;
          screenElement.setObject3D(screenElement.attrName, audio);
        } else {
          // Stereo
          const audio = new THREE.Audio(audioListener);
          audio.setMediaStreamSource(new MediaStream([track]));
          //screenElement.setObject3D(screenElement.attrName, audio);
        }

      } else { // Simple/Legacy Audio
        const audio = new THREE.PositionalAudio(audioListener);
        audio.setMediaStreamSource(new MediaStream([track]));
        audio.setRefDistance(hbProperties.HBFalloffDistance ? hbProperties.HBFalloffDistance : 3);
        screenElement.setObject3D(screenElement.attrName, audio);
      }

      
    },
    // We use frameCb to get our texture updated with the video stream
    frameCb: (frame) => {
      // Draw the video frame
      if (texture.image !== null) {
        //Draw on top of the canvas
        context.drawImage(frame, 0, 0, canvas.width, canvas.height);
        clearInterval(animationInterval);
        texture.needsUpdate = true;
        reconnectTimeout = 0;
      }
    },
  });

  // I tried to use the gain property of the audio object, but it didn't work
  // So I used the volume property of Hyperbeam instead
  if (hbProperties.gain){
    hbRet.volume = hbProperties.gain;
  }
  
  return {
    hbRet,
    reconnectTimeout,
    connectionState,
  }

}