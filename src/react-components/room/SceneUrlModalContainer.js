import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { SceneUrlModal } from "./SceneUrlModal";
import configs from "../../utils/configs";
import {isValidSceneUrl, isValidRemoteImage, isValidImageFile, isValidImageFileName} from "../../utils/scene-url-utils";
import { useIntl } from "react-intl";
import {upload} from "../../utils/media-utils";
import {proxiedUrlFor} from "../../utils/media-url-utils";

export function SceneUrlModalContainer({ hubChannel, onClose }) {
  const intl = useIntl();

  const onValidateUrl = useCallback(
    async ( url ) => {
        const validScene = await isValidSceneUrl(url.trim());
        const validImage = await isValidRemoteImage(url.trim());//Aptero
        const validImageFile = await isValidImageFileName(url.trim());
        return validScene || validImage || validImageFile || intl.formatMessage("scene-url-modal.invalid-scene-url");
    },
    [intl]
  );

  const onSubmit = useCallback(
    async ({ file, url }) => {
        //Aptero Adding support for image files to be converted into usable remote images
        if (await isValidImageFile(file)){
            const json = await upload(file[0],file[0].type);
            const urlObj = new URL(proxiedUrlFor(json.origin));
            urlObj.searchParams.set("token", json.meta.access_token);
            url = urlObj.href;
            //return;
        }
        if(await isValidRemoteImage(url.trim())){
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
