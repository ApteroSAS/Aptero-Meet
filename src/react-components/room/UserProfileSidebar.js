import React, { useState } from "react";
import PropTypes from "prop-types";
import { Sidebar } from "../sidebar/Sidebar";
import { BackButton } from "../input/BackButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { FormattedMessage, useIntl } from "react-intl";
import { rotateInPlaceAroundWorldUp, affixToWorldUp } from "../../utils/three-utils";
import { UserProfileVisitCardContainer } from "./UserProfileVisitCardContainer";
import { PeopleSidebarContainer, usePeopleList } from "./PeopleSidebarContainer";
import { msTeamsAPILight, msTeamsAPI } from "@aptero/axolotis-module-teams";

function useGoToSelectedAvatar(entity) {
  const targetMatrix = new THREE.Matrix4();
  const translation = new THREE.Matrix4();
  //entity.object3D.translateZ(1);
  targetMatrix.copy(entity.object3D.matrixWorld);
  translation.makeTranslation(0, 0, 0.75);
  targetMatrix.multiply(translation);
  affixToWorldUp(targetMatrix, targetMatrix);
  rotateInPlaceAroundWorldUp(targetMatrix, Math.PI, targetMatrix);

  document
    .querySelector("a-scene")
    .systems["hubs-systems"].characterController.enqueueWaypointTravelTo(targetMatrix, true, {
    willDisableMotion: false,
    willDisableTeleporting: false,
    snapToNavMesh: false,
    willMaintainInitialOrientation: false
  });
}

export function UserProfileSidebar({
                                     mySessionId,
                                     className,
                                     displayName,
                                     identityName,
                                     avatarPreview,
                                     // eslint-disable-next-line no-unused-vars
                                     avatarId,
                                     userId,
                                     isSignedIn,
                                     canPromote,
                                     onPromote,
                                     canDemote,
                                     onDemote,
                                     // eslint-disable-next-line no-unused-vars
                                     isHidden,
                                     // eslint-disable-next-line no-unused-vars
                                     onToggleHidden,
                                     canMute,
                                     onMute,
                                     // eslint-disable-next-line no-unused-vars
                                     canKick,
                                     // eslint-disable-next-line no-unused-vars
                                     onKick,
                                     showBackButton,
                                     onBack,
                                     onClose,
                                     toggleChatSidebar,
                                     hubChannel,
                                     presences,
                                     performConditionalSignIn,
                                     onCloseDialog,
                                     showNonHistoriedDialog,
                                     // eslint-disable-next-line no-unused-vars
                                     onSelectPerson,
                                     store,
                                     mediaSearchStore,
                                     signedIn,
                                     ...rest
                                   }) {
  const intl = useIntl();
  const [goBack, setgoBack] = useState("goBack");
  const people = usePeopleList(presences, mySessionId);
  if (goBack == null) {
    //setgoBack("goBack");
    return (
      <PeopleSidebarContainer
        hubChannel={hubChannel}
        presences={presences}
        mySessionId={mySessionId}
        store={store}
        mediaSearchStore={mediaSearchStore}
        performConditionalSignIn={performConditionalSignIn}
        onCloseDialog={onCloseDialog}
        showNonHistoriedDialog={showNonHistoriedDialog}
        onClose={onClose}
        toggleChatSidebar={toggleChatSidebar}
        signedIn={signedIn}

      />
    );
  } else {
    let microsoftUserId = null;
    let microsoftUserEmail = null;
    try {
      const selectedPerson = people.find(person => person.id === userId);
      microsoftUserId = selectedPerson?.profile?.microsoftUser;
      microsoftUserEmail = selectedPerson?.profile?.email;
      //console.log("selected user :" + microsoftUser);
      //changeSelectedUserByUID(microsoftUserId);
    } catch (e) {
      console.error(e);
    }
    return (
      <Sidebar
        title={identityName ? `${displayName} (${identityName})` : displayName}
        beforeTitle={showBackButton ? <BackButton onClick={onBack}
        /> : <BackButton onClick={() => {
          //changeSelectedUserByMail("");
          setgoBack(null);//TODO strange goback management
        }}/>}
        className={className}
        {...rest}
      >
        <Column center padding>
          <UserProfileVisitCardContainer
            mySessionId={mySessionId}
            displayName={displayName}
            avatarPreview={avatarPreview}
            userId={userId}
            presences={presences}
          />

          {canPromote && (
            <Button
              preset="accept"
              disabled={!isSignedIn}
              title={
                isSignedIn
                  ? intl.formatMessage({
                    id: "user-profile-sidebar.promote-button",
                    defaultMessage: "Promote"
                  })
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
              <FormattedMessage id="user-profile-sidebar.promote-button" defaultMessage="Promote"/>
            </Button>
          )}
          {canDemote && (
            <Button
              preset="cancel"
              disabled={!isSignedIn}
              title={
                isSignedIn
                  ? intl.formatMessage({
                    id: "user-profile-sidebar.demote-button",
                    defaultMessage: "Demote"
                  })
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
              <FormattedMessage id="user-profile-sidebar.demote-button" defaultMessage="Demote"/>
            </Button>
          )}
          {/* aptero remove
                  <Button onClick={onToggleHidden}>
                        {isHidden ? (
                            <FormattedMessage id="user-profile-sidebar.unhide-button" defaultMessage="Unhide"/>
                        ) : (
                            <FormattedMessage id="user-profile-sidebar.hide-button" defaultMessage="Hide"/>
                        )}
                    </Button>*/}
          <Button
            type="button"
            preset="basic"
            onClick={() => {
              let a = NAF.connection.entities["entities"];
              let entity1;
              for (let key in a) {
                let entity = a[key];
                if (entity.components.networked.attrValue.creator != null) {
                  if (entity.components.networked.attrValue.creator.toString() === userId.toString()) {
                    entity1 = entity;
                  }
                }
              }
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useGoToSelectedAvatar(entity1);
              onClose();
            }}
          >
            <FormattedMessage id="avatar-teleport" defaultMessage="Go to"/>
          </Button>
          {(canMute && !msTeamsAPILight().msTeams()) && (
            <Button preset="cancel" onClick={onMute}>
              <FormattedMessage id="user-profile-sidebar.mute-button" defaultMessage="Mute"/>
            </Button>
          )}
          {/*
                    aptero remove
                    canKick && (
                        <Button preset="cancel" onClick={onKick}>
                            <FormattedMessage id="user-profile-sidebar.kick-button" defaultMessage="Kick"/>
                        </Button>
                    )*/}
          {!microsoftUserId &&
            <Button preset="basic" onClick={() => toggleChatSidebar("chat", userId, null)}>
              <FormattedMessage id="user-profile-sidebar.chat-button" defaultMessage="Chat"/>
            </Button>
          }
          {microsoftUserId &&
            <>
              <Button preset="basic" onClick={async () => {
                await (await msTeamsAPI()).processDeepLink("https://teams.microsoft.com/l/chat/0/0?users=" + microsoftUserEmail);
                onClose();
              }}>
                <FormattedMessage id="user-profile-sidebar.chat-button" defaultMessage="Chat"/>
              </Button>
              <Button preset="basic" onClick={async () => {
                await (await msTeamsAPI()).processDeepLink("https://teams.microsoft.com/l/call/0/0?users=" + microsoftUserEmail);
                onClose();
              }}>
                <FormattedMessage id="user-profile-sidebar.call-button" defaultMessage="Call"/>
              </Button>
            </>
          }
        </Column>
      </Sidebar>
    );
  }

}

UserProfileSidebar.propTypes = {
  mySessionId: PropTypes.string,
  className: PropTypes.string,
  displayName: PropTypes.string,
  identityName: PropTypes.string,
  avatarPreview: PropTypes.node,
  avatarId: PropTypes.string,
  userId: PropTypes.string,
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
  onClose: PropTypes.func,
  toggleChatSidebar: PropTypes.func,
  hubChannel: PropTypes.object,
  presences: PropTypes.object,
  performConditionalSignIn: PropTypes.func,
  onCloseDialog: PropTypes.func,
  showNonHistoriedDialog: PropTypes.func,
  onSelectPerson: PropTypes.func,
  store: PropTypes.object.isRequired,
  mediaSearchStore: PropTypes.object.isRequired,
  signedIn: PropTypes.func
};

