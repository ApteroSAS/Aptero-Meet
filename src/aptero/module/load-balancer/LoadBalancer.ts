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
    const host = window.APP_PROPS.RETICULUM_SERVER;
    console.log(roomUrl);
    let response = await fetch(window.location.protocol + "//" + host + "/service/loadbalancer/redirect?url=" + encodeURIComponent(roomUrl));
    let data: { url: string } = await response.json();
    if (!data.url) {
      throw new Error();
    }
    if (roomUrl !== data.url) {
      window.location.href = data.url;
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

export async function getClones(): Promise<{
  roomSID: string,
  clones: {
    [id: string]: {
      url: string,
      people: number,
      peopleMax: number,
    }
  },
}> {
  instances = await getData();
  return instances;
}

export function hasInstances(): boolean {
  if (!instances) return false;
  return Object.keys(instances.clones).length > 1;
}