import { loadConfiguration, ResourceType, LogLevel, setLogLevel, setLogFunction } from "@microsoft/teamsfx";
import { useData } from "./useData";
import { useTeams } from "msteams-react-base-component";
import configs from "../../../../utils/configs";

let startLoginPageUrl = window.location.origin;
let functionEndpoint = window.location.origin + "/auth-start.html";//process.env.REACT_APP_FUNC_ENDPOINT;
let clientId = configs.APP_CONFIG.MICROSOFT_APP_ID; //process.env.REACT_APP_CLIENT_ID;

// TODO fix this when the SDK stops hiding global state!
let initialized = false;

export function useTeamsFx(authorityHost) {
  const [result] = useTeams({});
  const { error, loading } = useData(async () => {
    if (!initialized) {
      if (process.env.NODE_ENV === "development") {
        setLogLevel(LogLevel.Verbose);
        setLogFunction((leve, message) => { console.log(message); });
      }
      loadConfiguration({
        authentication: {
          authorityHost,
          initiateLoginEndpoint: startLoginPageUrl,
          //simpleAuthEndpoint: teamsfxEndpoint,//https://github.com/OfficeDev/TeamsFx/wiki/How-Authentication-Works-in-TeamsFx-Tab-Template
          clientId: clientId,
        },
        resources: [
          {
            type: ResourceType.API,
            name: "default",
            properties: {
              endpoint: functionEndpoint,
            },
          },
        ],
      });
      initialized = true;
    }
  });
  const isInTeams = true;
  return { error, loading, isInTeams, ...result };
}
