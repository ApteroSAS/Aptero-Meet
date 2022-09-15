import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { SceneUrlModal } from "./SceneUrlModal";
import configs from "../../utils/configs";
import { isValidSceneUrl,isValidImage } from "../../utils/scene-url-utils";
import { useIntl } from "react-intl";

export function SceneUrlModalContainer({ hubChannel, onClose }) {
  const intl = useIntl();

  const onValidateUrl = useCallback(
    async url => {
        const validScene = await isValidSceneUrl(url.trim());
        const validImage = await isValidImage(url.trim());//Aptero
        return validScene || validImage || intl.formatMessage("scene-url-modal.invalid-scene-url");
    },
    [intl]
  );

  const onSubmit = useCallback(
    async ({ url }) => {
        //Aptero
        if(await isValidImage(url.trim())){
            //convert URL into an api call for a scene that contains the url as a 360 background
            url = configs.API_360_TO_SCENE + encodeURIComponent(url);
        }
      hubChannel.updateScene(url);
      onClose();
    },
    [hubChannel, onClose]
  );

  return (
    <SceneUrlModal
      enableSpoke={configs.feature("enable_spoke")}
      editorName={configs.translation("editor-name")}
      onValidateUrl={onValidateUrl}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}

SceneUrlModalContainer.propTypes = {
  hubChannel: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
