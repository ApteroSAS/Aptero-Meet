import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Sidebar } from "../sidebar/Sidebar";
import { BackButton } from "../input/BackButton";
import { Button } from "../input/Button";
import { Column } from "../layout/Column";
import { FormattedMessage, useIntl } from "react-intl";
import { Slider } from "../input/Slider";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as VolumeHigh } from "../icons/VolumeHigh.svg";
import { ReactComponent as VolumeMuted } from "../icons/VolumeMuted.svg";
import useAvatarVolume from "./hooks/useAvatarVolume";
import { calcLevel, calcGainMultiplier, MAX_VOLUME_LABELS } from "../../utils/avatar-volume-utils";
import {msTeamsAPI, msTeamsAPILight} from "../../aptero/module/axolotis/modules/basic/ImportHelper";
import {getAdapterParams} from "../../aptero/module/webRTCadapter/adapter-config";

const MIN = 0;
const MAX = MAX_VOLUME_LABELS - 1;

export function UserProfileSidebar({
  mySessionId,
  className,
  userId,
  displayName,
  identityName,
  avatarPreview,
  // eslint-disable-next-line no-unused-vars
  avatarId,
  hasMicPresence,
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
  isNetworkMuted,
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
  const [multiplier, updateMultiplier, isMuted, updateMuted] = useAvatarVolume(userId);
  const onLevelChanged = useCallback(
    level => {
      updateMultiplier(calcGainMultiplier(level));
    },
    [updateMultiplier]
  );
  const newLevel = calcLevel(multiplier);
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

        {hasMicPresence && (
          <div className={styles.sliderContainer}>
            <ToolbarButton
              icon={isNetworkMuted || isMuted ? <VolumeMuted /> : <VolumeHigh />}
              selected={isNetworkMuted || isMuted}
              preset="accent4"
              style={{ display: "block" }}
              onClick={() => {
                updateMuted(!isMuted);
              }}
              disabled={isNetworkMuted}
            />
            <Slider
              min={MIN}
              max={MAX}
              step={1}
              value={newLevel}
              onChange={onLevelChanged}
              className={styles.sliderInputContainer}
              disabled={isNetworkMuted || isMuted}
            />
          </div>
        )}
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
            <FormattedMessage id="user-profile-sidebar.promote-button" defaultMessage="Promote" />
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
            <FormattedMessage id="user-profile-sidebar.demote-button" defaultMessage="Demote" />
          </Button>
        )}
          {/* aptero remove
        <Button onClick={onToggleHidden}>
          {isHidden ? (
            <FormattedMessage id="user-profile-sidebar.unhide-button" defaultMessage="Unhide" />
          ) : (
            <FormattedMessage id="user-profile-sidebar.hide-button" defaultMessage="Hide" />
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
          {(canMute && !(msTeamsAPILight().msTeams() || getAdapterParams().adapter === "none")) && (
          <Button preset="cancel" onClick={onMute}>
            <FormattedMessage id="user-profile-sidebar.mute-button" defaultMessage="Mute" />
          </Button>
        )}
          {/*
                    aptero remove
                    canKick && (
          <Button preset="cancel" onClick={onKick}>
            <FormattedMessage id="user-profile-sidebar.kick-button" defaultMessage="Kick" />
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
  userId: PropTypes.string,
  displayName: PropTypes.string,
  identityName: PropTypes.string,
  avatarPreview: PropTypes.node,
  avatarId: PropTypes.string,
  hasMicPresence: PropTypes.bool,
  isSignedIn: PropTypes.bool,
  canPromote: PropTypes.bool,
  onPromote: PropTypes.func,
  canDemote: PropTypes.bool,
  onDemote: PropTypes.func,
  isHidden: PropTypes.bool,
  onToggleHidden: PropTypes.func,
  canMute: PropTypes.bool,
  isNetworkMuted: PropTypes.bool,
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

