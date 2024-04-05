import {msTeamsAPILight} from "../axolotis/modules/basic/ImportHelper";


const teams_limited = false;

export function isTeamsLimitedOK(){
    return !msTeamsAPILight().msTeams() || !teams_limited;
}
