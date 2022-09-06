declare const window;

let instances: {
    roomSID: string,
    clones: {
        [id: string]: {
            url: string,
            people: number,
            peopleMax: number,
        }
    },
};

export async function redirectIfNeeded() {
    try {
        let data = await getData();
        console.log(data);
        const roomUrl = window.location.href;
        if (roomUrl !== data.url) {
            window.location.href = data.url;
        }
        instances = data.instances;
    } catch (e) {
        console.error(e);
    }
}

export async function getData() {
    const host = window.APP_PROPS.RETICULUM_SERVER;
    const roomUrl = window.location.href;
    let response = await fetch(window.location.protocol + "//" + host + "/service/loadbalancer/redirect?url=" + roomUrl);
    let data = await response.json();
    if (!data.url) {
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
    let data = await getData();
    instances = data.instances;
    return instances;
}

export function hasInstances(): boolean {
    if (!instances) return false;
    return Object.keys(instances.clones).length >= 1;
}