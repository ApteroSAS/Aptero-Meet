import Hyperbeam from "@hyperbeam/web";

declare const THREE;

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
      const audio = new THREE.PositionalAudio(audioListener);
      audio.setMediaStreamSource(new MediaStream([track]));
      audio.setRefDistance(hbProperties.HBFalloffDistance ? hbProperties.HBFalloffDistance : 3);
      screenElement.setObject3D(screenElement.attrName, audio);
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
  return {
    hbRet,
    reconnectTimeout,
    connectionState,
  }

}