declare const window;
const roomUrl = window.location.href;//initial room url

export interface Instances {
  roomSID: string,
  clones: {
    [id: string]: {
      url: string,
      name: string,
      people: number,
      peopleMax: number,
      main?: boolean,
      current: boolean,
    }
  },
}

let instances: Instances;

export async function redirectIfNeeded() {
  try {
    const url = new URL(roomUrl);
    let offline = url.searchParams.get("offline2");
    if (offline === "true") {
      return;
    }
    const host = window.APP_PROPS.RETICULUM_SERVER;
    let response = await fetch(window.location.protocol + "//" + host + "/service/loadbalancer/redirect?url=" + encodeURIComponent(roomUrl));
    let data: { url: string } = await response.json();
    if (!data.url) {
      console.error("invalid return data");
      return;
    }
    if (roomUrl !== data.url) {
      window.location.replace(data.url);
      console.log("redirect to :" + roomUrl);
    }
    //fetch meta data in a non blocking way
    getClones();
  } catch (e) {
    console.error(e);
  }
}

export async function getData(): Promise<Instances> {
  const host = window.APP_PROPS.RETICULUM_SERVER;
  let response = await fetch(window.location.protocol + "//" + host + "/service/loadbalancer/meta?url=" + encodeURIComponent(window.location.href));
  let data = await response.json();
  if (!data.clones) {
    throw new Error();
  }
  return data;
}

export interface ClonesI {
  [id: string]: {
    name: string,
    url: string,
    people: number,
    peopleMax: number,
    current: boolean,
  };
}

export async function getClones(): Promise<{
  roomSID: string,
  clones: ClonesI,
}> {
  instances = await getData();
  return instances;
}

export function hasInstances(): boolean {
  if (!instances) return false;
  return Object.keys(instances.clones).length > 1;
}