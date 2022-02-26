let url = new URL(window.location.href);
let msmode = !!url.searchParams.get("msteams");

export function msTeams(){
  return msmode;
}
