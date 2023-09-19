import { showReportDialog } from "../../../../telemetry";

export function setupVersionComp(elid = "version"){
  document.getElementById(elid).innerHTML = process.env.BUILD_VERSION + " RC4";
  document.getElementById(elid).onclick = ()=>{
    showReportDialog();
  };
}
