import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PromoteClientModal } from "./PromoteClientModal";
import { getAvatarThumbnailUrl, fetchAvatarGltfUrl } from "../../utils/avatar-utils";
import { UserProfileSidebar } from "./UserProfileSidebar.js";
import { SignInMessages } from "../auth/SignInModal";
import { getAvatarPreview } from "./../ui-root";
export function UserProfileSidebarContainer({
  user,
  imgTab,
  hubChannel,
  performConditionalSignIn,
  showBackButton,
  onBack,
  onClose,
  onCloseDialog,
  showNonHistoriedDialog,
  toggleChatSidebar
}) {
  const [avatarThumbnailUrl, setAvatarThumbnailUrl] = useState();
  const [avatarGlb, setAvatarGlb] = useState();
  const {
    id: userId,
    profile: { displayName, identityName, avatarId },
    roles
  } = user;
  const mayKick = hubChannel.canOrWillIfCreator("kick_users");
  const mayMute = user.micPresence && !user.micPresence.muted && hubChannel.canOrWillIfCreator("mute_users");
  const [isOwner, setIsOwner] = useState(!!roles.owner);
  const isCreator = !!roles.creator;
  const isSignedIn = !!roles.signed_in;
  const mayAddOwner = hubChannel.canOrWillIfCreator("update_roles") && !isOwner && !isCreator;
  const mayRemoveOwner = hubChannel.canOrWillIfCreator("update_roles") && isOwner && !isCreator;
  const [isHidden, setIsHidden] = useState(hubChannel.isHidden(user.id));
  useEffect(() => {
    if (avatarId) {
      getAvatarThumbnailUrl(avatarId).then(avatarThumbnailUrl => setAvatarThumbnailUrl(avatarThumbnailUrl));
    }
  }, []);

  const addOwner = useCallback(() => {
    performConditionalSignIn(
      () => hubChannel.can("update_roles"),
      async () => {
        showNonHistoriedDialog(PromoteClientModal, {
          displayName,
          onConfirm: async () => {
            setIsOwner(true);
            await hubChannel.addOwner(userId);
            onCloseDialog();
          }
        });
      },
      SignInMessages.addOwner
    );
  }, [performConditionalSignIn, hubChannel, showNonHistoriedDialog, userId, onCloseDialog, displayName]);

  const useFetch = () => {
    const [status, setStatus] = useState("idle");
    const [data, setData] = useState("");
    useEffect(() => {
      const fetchData = async () => {
        setStatus("fetching");
        const data = await getUrl(avatarId);
        setData(data);
        setStatus("fetched");
      };

      fetchData();
    }, []);

    return data;
  };

  const removeOwner = useCallback(() => {
    performConditionalSignIn(
      () => hubChannel.can("update_roles"),
      async () => {
        setIsOwner(false);
        await hubChannel.removeOwner(userId);
      },
      SignInMessages.removeOwner
    );
  }, [performConditionalSignIn, hubChannel, userId]);

  const toggleHidden = useCallback(() => {
    if (isHidden) {
      hubChannel.unhide(userId);
    } else {
      hubChannel.hide(userId);
    }

    setIsHidden(!isHidden);
  }, [isHidden, userId, hubChannel]);

  const mute = useCallback(() => {
    performConditionalSignIn(
      () => hubChannel.can("mute_users"),
      async () => await hubChannel.mute(userId),
      SignInMessages.muteUser
    );
  }, [performConditionalSignIn, hubChannel, userId]);

  const kick = useCallback(() => {
    performConditionalSignIn(
      () => hubChannel.can("kick_users"),
      async () => await hubChannel.kick(userId),
      SignInMessages.kickUser
    );

    if (onClose) {
      onClose();
    } else if (onBack) {
      onBack();
    }
  }, [performConditionalSignIn, hubChannel, userId, onClose, onBack]);
  return (
    <UserProfileSidebar
      displayName={displayName}
      identityName={identityName}
      avatarPreview={<img src={avatarThumbnailUrl} />}
      avatarId={avatarId}
      imgUrl={getAvatarPreview()}
      userId={userId}
      isSignedIn={isSignedIn}
      canPromote={mayAddOwner}
      onPromote={addOwner}
      canDemote={mayRemoveOwner}
      onDemote={removeOwner}
      isHidden={isHidden}
      onToggleHidden={toggleHidden}
      canMute={mayMute}
      onMute={mute}
      canKick={mayKick}
      onKick={kick}
      showBackButton={showBackButton}
      onClose={onClose}
      onBack={onBack}
      toggleChatSidebar={toggleChatSidebar}
    />
  );
}
export function getUrl(avatarGlb) {
  return new Promise(function(resolve, reject) {
    const params = {
      model: avatarGlb,
      scene: "halfbody-portrait-v1",
      armature: "ArmatureTargetMale",
      blendShapes: {}
    };
    const http = new XMLHttpRequest();
    http.open("POST", "https://render.readyplayer.me/render");
    http.setRequestHeader("Content-type", "application/json");
    http.send(JSON.stringify(params));
    http.onload = function() {
      // Do whatever with response
      let str = http.responseText;
      str = str.replace('{"renders":[', "");
      str = str.replace("]}", "");
      resolve(str);
    };
  });
}
UserProfileSidebarContainer.propTypes = {
  user: PropTypes.object.isRequired,
  imgTab: PropTypes.array,
  hubChannel: PropTypes.object,
  performConditionalSignIn: PropTypes.func,
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  onClose: PropTypes.func,
  onCloseDialog: PropTypes.func.isRequired,
  showNonHistoriedDialog: PropTypes.func,
  toggleChatSidebar: PropTypes.func
};
