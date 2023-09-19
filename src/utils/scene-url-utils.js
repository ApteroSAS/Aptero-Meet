import { isLocalHubsSceneUrl, proxiedUrlFor } from "../utils/media-url-utils";

export async function isValidGLB(url) {
  return fetch(url).then(async r => {
    const reader = r.body.getReader();
    let header = "";
    function readChunk({ done, value }) {
      header += String.fromCharCode.apply(null, value.slice(0, 4));
      if (!done && header.length < 4) {
        return reader.read().then(readChunk);
      } else {
        reader.cancel();
      }
    }
    await reader.read().then(readChunk);
    return header.startsWith("glTF");
  });
}

export async function isValidSceneUrl(url) {
  if (url.trim() === "") return false;
  if (!url.startsWith("http")) return false;
  if (await isLocalHubsSceneUrl(url)) {
    return true;
  } else {
    return isValidGLB(proxiedUrlFor(url));
  }
}

//Aptero
export async function isValidRemoteImage(url) {
  //try catch fausse url
  try {
    return await fetch(url,{method: 'HEAD'}).then(async r => {
      return r.headers.get('content-type').includes('image');
    })
  }
  catch(e){
    return false;
  }
}

export async function isValidImageFileName(url){
  //tester if vrai nom de fichier
  try {
    new URL(url);
    return false;
  } catch (e) {
    //we want this to fail
  }
  var allowedExtensions =
      /(\.jpg|\.jpeg|\.png|\.gif)$/i;
  if (!allowedExtensions.exec(url)) {
    alert('Invalid file type');
    return false;
  }
  return true;
}
export async function isValidImageFile(filelist){
  //tester if vrai nom de fichier
  const file = filelist[0]
  if(!file || !file.name || !await isValidImageFileName(file.name)){
    return false;
  }
  return file.type.includes("image");
}