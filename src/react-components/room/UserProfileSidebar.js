import React from "react";
import PropTypes from "prop-types";
import { Sidebar } from "../sidebar/Sidebar";
import { CloseButton } from "../input/CloseButton";
import { BackButton } from "../input/BackButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import styles from "./UserProfileSidebar.scss";
import { FormattedMessage, useIntl } from "react-intl";
import { fetchRandomDefaultAvatarId } from "../../utils/identity";
import { rotateInPlaceAroundWorldUp, affixToWorldUp } from "../../utils/three-utils";
export function UserProfileSidebar({
  className,
  displayName,
  identityName,
  avatarPreview,
  avatarId,
  userId,
  isSignedIn,
  canPromote,
  onPromote,
  canDemote,
  onDemote,
  isHidden,
  onToggleHidden,
  canMute,
  onMute,
  canKick,
  onKick,
  showBackButton,
  onBack,
  onClose,
  ...rest
}) {
  const intl = useIntl();

  return (
    <Sidebar
      title={identityName ? `${displayName} (${identityName})` : displayName}
      beforeTitle={showBackButton ? <BackButton onClick={onBack} /> : <CloseButton onClick={onClose} />}
      className={className}
      {...rest}
    >
      <Column center padding>
        <div className={styles.avatarPreviewContainer}>{avatarPreview || <div />}</div>
        {canPromote && (
          <Button
            preset="accept"
            disabled={!isSignedIn}
            title={
              isSignedIn
                ? intl.formatMessage({ id: "user-profile-sidebar.promote-button", defaultMessage: "Promote" })
                : intl.formatMessage(
                    {
                      id: "user-profile-sidebar.promote-button-disabled-label",
                      defaultMessage: "{displayName} is signed out."
                    },
                    { displayName }
                  )
            }
            onClick={onPromote}
          >
            <FormattedMessage id="user-profile-sidebar.promote-button" defaultMessage="Promote" />
          </Button>
        )}
        {canDemote && (
          <Button
            preset="cancel"
            disabled={!isSignedIn}
            title={
              isSignedIn
                ? intl.formatMessage({ id: "user-profile-sidebar.demote-button", defaultMessage: "Demote" })
                : intl.formatMessage(
                    {
                      id: "user-profile-sidebar.demote-button-disabled-label",
                      defaultMessage: "{displayName} is signed out."
                    },
                    { displayName }
                  )
            }
            onClick={onDemote}
          >
            <FormattedMessage id="user-profile-sidebar.demote-button" defaultMessage="Demote" />
          </Button>
        )}
        <Button onClick={onToggleHidden}>
          {isHidden ? (
            <FormattedMessage id="user-profile-sidebar.unhide-button" defaultMessage="Unhide" />
          ) : (
            <FormattedMessage id="user-profile-sidebar.hide-button" defaultMessage="Hide" />
          )}
        </Button>
        <Button type="button" preset="basic"  onClick={() => {
          var a=NAF.connection.entities["entities"];
          var entity1,entity2;
          var userId2=NAF.clientId;
        
            for(var key in a)
            {
              var entity = a[key];
              if(entity.components.networked.attrValue.creator!=null)
              {
                if(entity.components.networked.attrValue.creator.toString()==userId.toString())
                {
                  entity1=entity;
                }
                else if(entity.components.networked.attrValue.creator.toString()==userId2.toString())
                {
                  entity2=entity;
                }
              }

            }
            entity2.object3D.position.set(entity1.object3D.position.x,entity1.object3D.position.y,entity1.object3D.position.z-0.7);
            useGoToSelectedAvatar();
        }}>
          <FormattedMessage id="avatar-teleport" defaultMessage="teleport" />
        </Button>
        {canMute && (
          <Button preset="cancel" onClick={onMute}>
            <FormattedMessage id="user-profile-sidebar.mute-button" defaultMessage="Mute" />
          </Button>
        )}
        {canKick && (
          <Button preset="cancel" onClick={onKick}>
            <FormattedMessage id="user-profile-sidebar.kick-button" defaultMessage="Kick" />
          </Button>
        )}
      </Column>
    </Sidebar>
  );
}

UserProfileSidebar.propTypes = {
  className: PropTypes.string,
  displayName: PropTypes.string,
  identityName: PropTypes.string,
  avatarPreview: PropTypes.node,
  avatarId:PropTypes.string,
  userId:PropTypes.string,
  isSignedIn: PropTypes.bool,
  canPromote: PropTypes.bool,
  onPromote: PropTypes.func,
  canDemote: PropTypes.bool,
  onDemote: PropTypes.func,
  isHidden: PropTypes.bool,
  onToggleHidden: PropTypes.func,
  canMute: PropTypes.bool,
  onMute: PropTypes.func,
  canKick: PropTypes.bool,
  onKick: PropTypes.func,
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  onClose: PropTypes.func
};
function useGoToSelectedAvatar() {
  const targetMatrix = new THREE.Matrix4();
  const translation = new THREE.Matrix4();
  targetMatrix.copy(entity1.object3D.matrixWorld);
  affixToWorldUp(targetMatrix, targetMatrix);
  rotateInPlaceAroundWorldUp(targetMatrix, Math.PI, targetMatrix);

  document.querySelector('a-scene').systems["hubs-systems"].characterController.enqueueWaypointTravelTo(targetMatrix, true, {
    willDisableMotion: false,
    willDisableTeleporting: false,
    snapToNavMesh: false,
    willMaintainInitialOrientation: false
  });
  



}
