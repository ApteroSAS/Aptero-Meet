let url = new URL(window.location.href);
let msmode = !!url.searchParams.get("msteams");

export function sendIframeMessage(type, data) {
  if (window.top) {
    window.top.postMessage(JSON.stringify({ type, data }), "*");
  }
}

export async function requestAuthToken(){
  sendIframeMessage("ms-teams-request-auth-token",{});
}

export function changeSelectedUser(email){
  sendIframeMessage("ms-teams-change-selected-user",{email});
}

export function msTeams(){
  return msmode;
}
