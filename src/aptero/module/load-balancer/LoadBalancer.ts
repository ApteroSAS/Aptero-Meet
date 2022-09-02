declare const window;
export async function redirectIfNeeded(){
    try {
        const host = window.APP_PROPS.RETICULUM_SERVER;
        const roomUrl = window.location.href;
        await fetch(window.location.protocol + "//" + host + "/service/loadbalancer/redirect?url=" + roomUrl)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if(roomUrl !== data.url) {
                    window.location.href = data.url;
                }
            });
    }catch (e) {
        console.error(e);
    }
}