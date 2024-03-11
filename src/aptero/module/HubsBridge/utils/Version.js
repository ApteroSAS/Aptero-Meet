export function setupVersionComp(elid = "version"){
  document.getElementById(elid).innerHTML = process.env.BUILD_VERSION;
}
