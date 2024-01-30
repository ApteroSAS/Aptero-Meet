import {propertiesService} from "../properties/propertiesService";
import {msTeamsAPILight} from "../axolotis/modules/basic/ImportHelper";
const configs = propertiesService;

export function isTeamsLimitedOK(){
    return !msTeamsAPILight().msTeams() || !configs.feature("teams_limited")
}
