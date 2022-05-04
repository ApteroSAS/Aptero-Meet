import { useData } from "./useData";
import { createMicrosoftGraphClient } from "@microsoft/teamsfx";
import { GraphError } from "@microsoft/microsoft-graph-client";
import { getScopes } from "../service/scope";
import { getCredential } from "../service/TeamsLoginService";

export function useGraph(
  asyncFunc,
  options
) {
  const { scope } = { scope: getScopes(), ...options };
  const initial = useData(async () => {
    try {
      const graph = createMicrosoftGraphClient(getCredential(), scope);
      return await asyncFunc(graph);
    } catch (err) {
      if (err instanceof GraphError && err.code?.includes("UiRequiredError")) {
        // Silently fail for user didn't login error
      } else {
        throw err;
      }
    }
  });

  const { data, error, loading, reload } = useData(
    async () => {
      await getCredential().login(scope);
      const graph = createMicrosoftGraphClient(getCredential(), scope);
      return await asyncFunc(graph);
    },
    { auto: false }
  );

  return data || error || loading
    ? { data, error, loading, reload }
    : {
        data: initial.data,
        error: initial.error,
        loading: initial.loading,
        reload,
      };
}
