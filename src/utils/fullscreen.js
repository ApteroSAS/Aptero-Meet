import screenfull from "screenfull";

let hasEnteredFullScreenThisSession = false;

function shouldShowFullScreen() {
  // Disable full screen on iOS, since Safari's fullscreen mode does not let you prevent native pinch-to-zoom gestures.
  // Disable full screen if in an iframe to prevent conflicts
  return ( ( window.location == window.parent.location ) &&
    (AFRAME.utils.device.isMobile() || AFRAME.utils.device.isMobileVR()) &&
    !AFRAME.utils.device.isIOS() &&
    screenfull.enabled
  );
}

async function retryScreenFull(){
  await screenfull.request();
  document.body.removeEventListener("click",retryScreenFull);
}

export function willRequireUserGesture() {
  return !screenfull.isFullscreen && shouldShowFullScreen();
}

export async function showFullScreenIfAvailable() {
  if (shouldShowFullScreen()) {
    hasEnteredFullScreenThisSession = true;
    console.log(screenfull);
    try{
      await screenfull.request();
    }catch(e) {
      // prevent crash when entering without user interaction
      console.log(e);
      document.body.addEventListener("click",retryScreenFull)
    }

  }
}

export async function showFullScreenIfWasFullScreen() {
  console.log(screenfull);
  if (hasEnteredFullScreenThisSession && !screenfull.isFullscreen) {
    await screenfull.request();
  }
}
