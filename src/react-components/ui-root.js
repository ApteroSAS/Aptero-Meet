import React, { Component, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { FormattedMessage } from "react-intl";
import screenfull from "screenfull";
import { ReactComponent as ObjectsIcon } from "./icons/Objects.svg";
import configs from "../utils/configs";
import { VR_DEVICE_AVAILABILITY } from "../utils/vr-caps-detect";
import { canShare } from "../utils/share";
import styles from "../assets/stylesheets/ui-root.scss";
import styleUtils from "./styles/style-utils.scss";
import { ReactAudioContext } from "./wrap-with-audio";
import {
  pushHistoryState,
  clearHistoryState,
  popToBeginningOfHubHistory,
  navigateToPriorPage,
  sluglessPath
} from "../utils/history";
import StateRoute from "./state-route.js";
import { getPresenceProfileForSession, hubUrl } from "../utils/phoenix-utils";
import { getMicrophonePresences } from "../utils/microphone-presence";
import { getCurrentStreamer } from "../utils/component-utils";

import ProfileEntryPanel from "./profile-entry-panel";
import MediaBrowserContainer from "./media-browser";

import EntryStartPanel from "./entry-start-panel.js";
import AvatarEditor from "./avatar-editor";
import PreferencesScreen from "./preferences-screen.js";
import PresenceLog from "./presence-log.js";
import PreloadOverlay from "./preload-overlay.js";
import RTCDebugPanel from "./debug-panel/RtcDebugPanel.js";
import { showFullScreenIfAvailable, showFullScreenIfWasFullScreen } from "../utils/fullscreen";
import { handleExitTo2DInterstitial, exit2DInterstitialAndEnterVR, isIn2DInterstitial } from "../utils/vr-interstitial";
import maskEmail from "../utils/mask-email";

import qsTruthy from "../utils/qs_truthy";
import { LoadingScreenContainer } from "./room/LoadingScreenContainer";

import { RoomLayoutContainer } from "./room/RoomLayoutContainer";
import roomLayoutStyles from "./layout/RoomLayout.scss";
import { useAccessibleOutlineStyle } from "./input/useAccessibleOutlineStyle";
import { ToolbarButton } from "./input/ToolbarButton";
import { RoomEntryModal } from "./room/RoomEntryModal";
import { EnterOnDeviceModal } from "./room/EnterOnDeviceModal";
import { MicPermissionsModal } from "./room/MicPermissionsModal";
import { FallbackModal } from "../aptero/module/Fallback/FallbackModal";
import { MicSetupModalContainer } from "./room/MicSetupModalContainer";
import { InvitePopoverContainer } from "./room/InvitePopoverContainer";
import { MoreMenuPopoverButton, CompactMoreMenuButton, MoreMenuContextProvider } from "./room/MoreMenuPopover";
import { ChatSidebarContainer, ChatContextProvider, ChatToolbarButtonContainer } from "./room/ChatSidebarContainer";
import { ContentMenu, PeopleMenuButton, ObjectsMenuButton , PSidebarButton} from "./room/ContentMenu";
import { ReactComponent as CameraIcon } from "./icons/Camera.svg";
import { ReactComponent as AvatarIcon } from "./icons/Avatar.svg";
import { ReactComponent as AddIcon } from "./icons/Add.svg";
import { ReactComponent as DeleteIcon } from "./icons/Delete.svg";
import { ReactComponent as FavoritesIcon } from "./icons/Favorites.svg";
import { ReactComponent as StarOutlineIcon } from "./icons/StarOutline.svg";
import { ReactComponent as StarIcon } from "./icons/Star.svg";
import { ReactComponent as SettingsIcon } from "./icons/Settings.svg";
import { ReactComponent as WarningCircleIcon } from "./icons/WarningCircle.svg";
import { ReactComponent as HomeIcon } from "./icons/Home.svg";
import { ReactComponent as TextDocumentIcon } from "./icons/TextDocument.svg";
import { ReactComponent as SupportIcon } from "./icons/Support.svg";
import { ReactComponent as ShieldIcon } from "./icons/Shield.svg";
import { ReactComponent as DiscordIcon } from "./icons/Discord.svg";
import { ReactComponent as VRIcon } from "./icons/VR.svg";
import { ReactComponent as LeaveIcon } from "./icons/Leave.svg";
import { ReactComponent as EnterIcon } from "./icons/Enter.svg";
import { ReactComponent as InviteIcon } from "./icons/Invite.svg";
import { PeopleSidebarContainer, userFromPresence } from "./room/PeopleSidebarContainer";
import { ObjectListProvider } from "./room/useObjectList";
import { ObjectsSidebarContainer } from "./room/ObjectsSidebarContainer";
import { ObjectMenuContainer } from "./room/ObjectMenuContainer";
import { useCssBreakpoints } from "react-use-css-breakpoints";
import { PlacePopoverContainer } from "./room/PlacePopoverContainer";
import { SharePopoverContainer } from "./room/SharePopoverContainer";
import { VoiceButtonContainer } from "./room/VoiceButtonContainer";
import { ReactionPopoverContainer } from "./room/ReactionPopoverContainer";
import { SafariMicModal } from "./room/SafariMicModal";
import { RoomSignInModalContainer } from "./auth/RoomSignInModalContainer";
import { SignInStep } from "./auth/SignInModal";
import { LeaveReason, LeaveRoomModal } from "./room/LeaveRoomModal";
import { RoomSidebar } from "./room/RoomSidebar";
import { RoomSettingsSidebarContainer } from "./room/RoomSettingsSidebarContainer";
import { AutoExitWarningModal, AutoExitReason } from "./room/AutoExitWarningModal";
import { ExitReason } from "./room/ExitedRoomScreen";
import { UserProfileSidebarContainer } from "./room/UserProfileSidebarContainer";
import { CloseRoomModal } from "./room/CloseRoomModal";
import { WebVRUnsupportedModal } from "./room/WebVRUnsupportedModal";
import { TweetModalContainer } from "./room/TweetModalContainer";
import { TipContainer, FullscreenTip } from "./room/TipContainer";
import { SpectatingLabel } from "./room/SpectatingLabel";
import { SignInMessages } from "./auth/SignInModal";
import { apteroService } from "../aptero/ApteroServices";
import { CustomSidebarContainer } from "../aptero/module/CustomPanel/react-component/CustomSidebarContainer";
import { getSelectedPersonName } from "./room/PeopleSidebarContainer";
import { Promise } from "core-js";
import { UserProfileVisitCardContainer } from "./room/UserProfileVisitCardContainer";
import axios from "axios";
import { propertiesService } from "../aptero/module/properties/propertiesService";
import AptRoot from "../aptero/module/HubsBridge/AptRoot";
import { minimumQualityService } from "../aptero/module/perf/MinimumQualityService";
import { adapterReady, getAdapterParams } from "../aptero/module/webRTCadapter/adapter-config";
import {CustomMenuButton} from "../aptero/module/CustomPanel/react-component/CustomMenuButton";
import {InstancesMenuButton} from "../aptero/module/load-balancer/ui/InstancesMenuButton";
import {InstancesSidebarContainer} from "../aptero/module/load-balancer/ui/InstancesSidebarContainer";
import {isTeamsLimitedOK} from "../aptero/module/microsoft/TeamsLimit";
import {msTeamsAPI, msTeamsAPILight} from "../aptero/module/axolotis/modules/basic/ImportHelper";

const avatarEditorDebug = qsTruthy("avatarEditorDebug");
const IN_ROOM_MODAL_ROUTER_PATHS = ["/media"];
const IN_ROOM_MODAL_QUERY_VARS = ["media_source"];

const LOBBY_MODAL_ROUTER_PATHS = ["/media/scenes", "/media/avatars", "/media/favorites"];
const LOBBY_MODAL_QUERY_VARS = ["media_source"];
const LOBBY_MODAL_QUERY_VALUES = ["scenes", "avatars", "favorites"];

async function grantedMicLabels() {
  const mediaDevices = await navigator.mediaDevices.enumerateDevices();
  return mediaDevices.filter(d => d.label && d.kind === "audioinput").map(d => d.label);
}

const isMobile = AFRAME.utils.device.isMobile();
const isMobileVR = AFRAME.utils.device.isMobileVR();
const AUTO_EXIT_TIMER_SECONDS = 10;

const aptGuiVisible = !new URL(window.location.href).searchParams.get("hideui"); //aptero
var ImageList = [];
const profileList = [];

export class UIRoot extends Component {
  willCompileAndUploadMaterials = false;

  static propTypes = {
    enterScene: PropTypes.func,
    exitScene: PropTypes.func,
    onSendMessage: PropTypes.func,
    disableAutoExitOnIdle: PropTypes.bool,
    forcedVREntryType: PropTypes.string,
    isBotMode: PropTypes.bool,
    store: PropTypes.object,
    mediaSearchStore: PropTypes.object,
    scene: PropTypes.object,
    authChannel: PropTypes.object,
    hubChannel: PropTypes.object,
    linkChannel: PropTypes.object,
    hub: PropTypes.object,
    availableVREntryTypes: PropTypes.object,
    checkingForDeviceAvailability: PropTypes.bool,
    environmentSceneLoaded: PropTypes.bool,
    entryDisallowed: PropTypes.bool,
    roomUnavailableReason: PropTypes.string,
    hubIsBound: PropTypes.bool,
    isSupportAvailable: PropTypes.bool,
    presenceLogEntries: PropTypes.array,
    presences: PropTypes.object,
    sessionId: PropTypes.string,
    subscriptions: PropTypes.object,
    initialIsFavorited: PropTypes.bool,
    showSignInDialog: PropTypes.bool,
    signInMessage: PropTypes.string,
    onContinueAfterSignIn: PropTypes.func,
    showSafariMicDialog: PropTypes.bool,
    onMediaSearchResultEntrySelected: PropTypes.func,
    onAvatarSaved: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    showInterstitialPrompt: PropTypes.bool,
    onInterstitialPromptClicked: PropTypes.func,
    performConditionalSignIn: PropTypes.func,
    hide: PropTypes.bool,
    showPreload: PropTypes.bool,
    onPreloadLoadClicked: PropTypes.func,
    embed: PropTypes.bool,
    embedToken: PropTypes.string,
    onLoaded: PropTypes.func,
    activeObject: PropTypes.object,
    selectedObject: PropTypes.object,
    breakpoint: PropTypes.string
  };

  state = {
    enterInVR: false,
    entered: false,
    entering: false,
    dialog: null,
    showShareDialog: false,
    linkCode: null,
    linkCodeCancel: null,
    miniInviteActivated: false,
    people: [],
    didConnectToNetworkedScene: false,
    noMoreLoadingUpdates: false,
    hideLoader: false,
    showPrefs: false,
    watching: false,
    isStreaming: false,
    waitingOnAudio: false,
    audioTrackClone: null,
    displayName: null,
    identityName: null,

    onBack: null,
    onClose: null,
    autoExitTimerStartedAt: null,
    autoExitTimerInterval: null,
    autoExitReason: null,
    secondsRemainingBeforeAutoExit: Infinity,

    signedIn: false,
    videoShareMediaSource: null,
    showVideoShareFailed: false,

    objectInfo: null,
    objectSrc: "",
    sidebarId: null,
    userId: null,
    presenceCount: 0,
    msTeamsAPI: null,

    persistentIframe: null,
    psidebarIcon: null,
  };

  constructor(props) {
    super(props);

    props.mediaSearchStore.setHistory(props.history);

    // An exit handler that discards event arguments and can be cleaned up.
    this.exitEventHandler = () => this.props.exitScene();
    this.mediaDevicesManager = window.APP.mediaDevicesManager;
    if (msTeamsAPILight().msTeams()) {
      msTeamsAPI().then(service => {
        this.setState({ msTeamsAPI: service });
      });
    }
  }

  //aptero
  syncPersistentIframe = () => {
    this.setState({ persistentIframe: window.PERSISTENTIFRAME });
    // console log whenever we set the sidebar to the persistent iframe, which we do by checking the state
    if (window.PERSISTENTIFRAME && this.state.persistentIframe === window.PERSISTENTIFRAME) {
      const obj = {
        url : "psidebar",
        type : "sidebar_iframe",
        title: window.PFrameProps.name,
        icon: window.PFrameProps.icon,
      }
      this.setState({ psidebarIcon: obj.icon });
      setTimeout(()=>{
        const sceneEl = document.querySelector("a-scene");
        sceneEl.emit("action_toggle_custom_sidebar_info",obj)
      },10);
    }

    this.forceUpdate();
  };

  componentDidUpdate(prevProps) {
    const { hubChannel, showSignInDialog } = this.props;
    if (hubChannel) {
      const { signedIn } = hubChannel;
      if (signedIn !== this.state.signedIn) {
        this.setState({ signedIn });
      }
    }
    if (prevProps.showSignInDialog !== showSignInDialog) {
      if (showSignInDialog) {
        this.showContextualSignInDialog();
      } else {
        this.closeDialog();
      }
    }
    if (!this.willCompileAndUploadMaterials && this.state.noMoreLoadingUpdates) {
      this.willCompileAndUploadMaterials = true;
      // We want to ensure that react and the browser have had the chance to render / update.
      // See https://stackoverflow.com/a/34999925 , although our solution flipped setTimeout and requestAnimationFrame
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          if (!this.props.isBotMode) {
            try {
              this.props.scene.renderer.compile(this.props.scene.object3D, this.props.scene.camera);
              this.props.scene.object3D.traverse(obj => {
                if (!obj.material) {
                  return;
                }
                const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
                for (const material of materials) {
                  for (const prop in material) {
                    if (material[prop] && material[prop].isTexture) {
                      this.props.scene.renderer.initTexture(material[prop]);
                    }
                  }
                }
              });
            } catch (e) {
              console.error(e);
              this.props.exitScene(ExitReason.sceneError); // https://github.com/mozilla/hubs/issues/1950
            }
          }

          if (!this.state.hideLoader) {
            this.setState({ hideLoader: true });
          }
        }, 0);
      });
    }

    if (!this.props.selectedObject || !prevProps.selectedObject) {
      const sceneEl = this.props.scene;

      if (this.props.selectedObject) {
        sceneEl.classList.add(roomLayoutStyles.sceneSmFullScreen);
      } else {
        sceneEl.classList.remove(roomLayoutStyles.sceneSmFullScreen);
      }
    }

    if (this.state.presenceCount != this.occupantCount()) {
      this.setState({ presenceCount: this.occupantCount() });
    }
  }

  onConcurrentLoad = () => {
    if (qsTruthy("allow_multi") || this.props.store.state.preferences["allowMultipleHubsInstances"]) return;
    this.startAutoExitTimer(AutoExitReason.concurrentSession);
  };

  onIdleDetected = () => {
    if (
      this.props.disableAutoExitOnIdle ||
      this.state.isStreaming ||
      this.props.store.state.preferences["disableIdleDetection"]
    )
      return;
    this.startAutoExitTimer(AutoExitReason.idle);
  };

  onActivityDetected = () => {
    if (this.state.autoExitTimerInterval) {
      this.endAutoExitTimer();
    }
  };

  componentDidMount() {

    this.props.scene.addEventListener("join", () => {
      if (!!this.props.store.state.credentials && !!this.props.store.state.credentials.token && !this.props.store.state.profile.microsoftUser) {
        // eslint-disable-next-line no-use-before-define
        getUserProfile(this.props.store);
      }
      const useFetch = async avatarId => {
        var data;
        const fetchData = async () => {
          // eslint-disable-next-line no-use-before-define
          data = await getUrl(avatarId);
        };
        await fetchData();
        return data;
      };
      useFetch(this.props.store.state.profile.avatarId).then(resp => {
        var profilePictureUrl = resp;
        if (resp != null) {
          profilePictureUrl = profilePictureUrl.replace("\"", "");
          profilePictureUrl = profilePictureUrl.replace("\"", "");
          this.props.store.update({
            profile: { profilePicture: profilePictureUrl }
          });
        }
      });
    });
    this.props.scene.addEventListener("avatarClick", e => {
      this.setSidebar("display_user_panel", { selectedUserId: e.detail });
    });

    this.props.scene.addEventListener("avatarChanged", () => {
      console.log("has changed avatar");
      const useFetch = async avatarId => {
        let data;
        const fetchData = async () => {
          // eslint-disable-next-line no-use-before-define
          data = await getUrl(avatarId);
        };
        await fetchData();
        return data;
      };
      useFetch(this.props.store.state.profile.avatarId).then(resp => {
        let profilePictureUrl = resp;
        if (resp != null) {
          profilePictureUrl = profilePictureUrl.replace("\"", "");
          profilePictureUrl = profilePictureUrl.replace("\"", "");
          this.props.store.update({
            profile: { profilePicture: profilePictureUrl }
          });
        }
      });
      this.props.store.update({ activity: { hasChangedAvatar: false } });
    });

    window.addEventListener("concurrentload", this.onConcurrentLoad);
    window.addEventListener("idle_detected", this.onIdleDetected);
    window.addEventListener("activity_detected", this.onActivityDetected);
    document.querySelector(".a-canvas").addEventListener("mouseup", () => {
      if (this.state.showShareDialog) {
        this.setState({ showShareDialog: false });
      }
    });

    this.props.scene.addEventListener("loaded", this.onSceneLoaded);
    this.props.scene.addEventListener("share_video_enabled", this.onShareVideoEnabled);
    this.props.scene.addEventListener("share_video_disabled", this.onShareVideoDisabled);
    this.props.scene.addEventListener("share_video_failed", this.onShareVideoFailed);
    this.props.scene.addEventListener("exit", this.exitEventHandler);
    this.props.scene.addEventListener("action_exit_watch", () => {
      if (this.state.hide) {
        this.setState({ hide: false, hideUITip: false });
      } else {
        this.setState({ watching: false });
      }
    });
    this.props.scene.addEventListener("action_toggle_ui", () =>
      this.setState({ hide: !this.state.hide, hideUITip: false })
    );
    this.props.scene.addEventListener("devicechange", () => {
      this.forceUpdate();syncPersistentIframe = () => {
        this.setState({ persistentIframe: window.PERSISTENTIFRAME });
      };
    });
    //Aptero
    this.props.scene.addEventListener("action_toggle_custom_sidebar", () => {
      this.toggleSidebar("custom");
    });
    this.props.scene.addEventListener("action_toggle_custom_psidebar", () => {
      this.toggleSidebar("psidebar");
    });
    window.addEventListener("action_toggle_custom_sidebar_fullscreen", () => {
      setTimeout(() => {
        this.adjustIframeSize(";)", this.state.sidebarId);
      }, 10);
    });

    //sidebar!!


    // Add listener for adjustIframeSize
    this.props.scene.addEventListener("adjustIframeSize", (e) => {
      this.adjustIframeSize(e.detail.currentState, e.detail.newState);
    });
    // Also for when we resize the window
    window.addEventListener("resize", () => {
      this.adjustIframeSize(";)", this.state.sidebarId);
    });

    this.syncPersistentIframe();
    window.addEventListener('togglePFrameButtonVisibility', this.syncPersistentIframe);

    const scene = this.props.scene;

    const unsubscribe = this.props.history.listen((location, action) => {
      const state = location.state;

      // If we just hit back into the entry flow, just go back to the page before the room landing page.
      if (action === "POP" && state && state.entry_step && this.state.entered) {
        unsubscribe();
        navigateToPriorPage(this.props.history);
        return;
      }
    });

    // If we refreshed the page with any state history (eg if we were in the entry flow
    // or had a modal/overlay open) just reset everything to the beginning of the flow by
    // erasing all history that was accumulated for this room (including across refreshes.)
    //
    // We don't do this for the media browser case, since we want to be able to share
    // links to the browser pages
    if (this.props.history.location.state && !sluglessPath(this.props.history.location).startsWith("/media")) {
      popToBeginningOfHubHistory(this.props.history);
    }

    this.setState({
      audioContext: {
        playSound: sound => {
          scene.emit(sound);
        },
        onMouseLeave: () => {
          //          scene.emit("play_sound-hud_mouse_leave");
        }
      }
    });

    if (this.props.forcedVREntryType && this.props.forcedVREntryType.endsWith("_now")) {
      this.props.scene.addEventListener(
        "loading_finished",
        () => {
          setTimeout(() => this.handleForceEntry(), 1000);
        },
        { once: true }
      );
    }

    this.playerRig = scene.querySelector("#avatar-rig");

    scene.addEventListener("action_media_tweet", this.onTweet);
  }

  UNSAFE_componentWillMount() {
    this.props.store.addEventListener("statechanged", this.storeUpdated);
  }

  componentWillUnmount() {
    this.props.scene.removeEventListener("loaded", this.onSceneLoaded);
    this.props.scene.removeEventListener("exit", this.exitEventHandler);
    this.props.scene.removeEventListener("share_video_enabled", this.onShareVideoEnabled);
    this.props.scene.removeEventListener("share_video_disabled", this.onShareVideoDisabled);
    this.props.scene.removeEventListener("share_video_failed", this.onShareVideoFailed);
    this.props.scene.removeEventListener("action_media_tweet", this.onTweet);
    this.props.store.removeEventListener("statechanged", this.storeUpdated);
    window.removeEventListener("concurrentload", this.onConcurrentLoad);
    window.removeEventListener("idle_detected", this.onIdleDetected);
    window.removeEventListener("activity_detected", this.onActivityDetected);

    //Aptero
    this.props.scene.removeEventListener("action_toggle_custom_sidebar", () => {
      this.toggleSidebar("custom");
    });
    this.props.scene.removeEventListener("action_toggle_custom_psidebar", () => {
      this.toggleSidebar("psidebar");
    });
    if (window.hyperbeam_popup) {
      console.log("Remove hyperbeam popup DIV");
      window.hyperbeam_popup.remove();
    }
    window.removeEventListener('togglePFrameButtonVisibility', this.syncPersistentIframe);
  }

  storeUpdated = () => {
    this.forceUpdate();
  };

  showContextualSignInDialog = () => {
    const { signInMessage, authChannel, onContinueAfterSignIn } = this.props;

    this.showNonHistoriedDialog(RoomSignInModalContainer, {
      step: SignInStep.submit,
      message: signInMessage,
      onSubmitEmail: async email => {
        const { authComplete } = await authChannel.startAuthentication(email, this.props.hubChannel);

        this.showNonHistoriedDialog(RoomSignInModalContainer, {
          step: SignInStep.waitForVerification,
          onClose: onContinueAfterSignIn || this.closeDialog
        });

        await authComplete;

        this.setState({ signedIn: true });
        this.showNonHistoriedDialog(RoomSignInModalContainer, {
          step: SignInStep.complete,
          onClose: onContinueAfterSignIn || this.closeDialog,
          onContinue: onContinueAfterSignIn || this.closeDialog
        });
      },
      onSubmitEmailMicrosoftLogin: async () => {
        this.showNonHistoriedDialog(RoomSignInModalContainer, {
          step: SignInStep.WaitForMicrosoftVerification,
          onClose: onContinueAfterSignIn || this.closeDialog
        });
        await (await msTeamsAPI()).getLoginService().login();
        this.showNonHistoriedDialog(RoomSignInModalContainer, {
          step: SignInStep.complete,
          onClose: onContinueAfterSignIn || this.closeDialog,
          onContinue: onContinueAfterSignIn || this.closeDialog
        });
      },
      onClose: onContinueAfterSignIn || this.closeDialog
    });
  };

  updateSubscribedState = () => {
    const isSubscribed = this.props.subscriptions && this.props.subscriptions.isSubscribed();
    this.setState({ isSubscribed });
  };

  toggleFavorited = () => {
    this.props.performConditionalSignIn(
      () => this.props.hubChannel.signedIn,
      () => {
        const isFavorited = this.isFavorited();

        this.props.hubChannel[isFavorited ? "unfavorite" : "favorite"]();
        this.setState({ isFavorited: !isFavorited });
      },
      SignInMessages.favoriteRoom
    );
  };

  isFavorited = () => {
    return this.state.isFavorited !== undefined ? this.state.isFavorited : this.props.initialIsFavorited;
  };

  onLoadingFinished = () => {
    this.setState({ noMoreLoadingUpdates: true });
    this.props.scene.emit("loading_finished");

    if (this.props.onLoaded) {
      this.props.onLoaded();
    }
  };

  onSceneLoaded = () => {
    this.setState({ sceneLoaded: true });
  };

  onShareVideoEnabled = e => {
    this.setState({ videoShareMediaSource: e.detail.source });
  };

  onShareVideoDisabled = () => {
    this.setState({ videoShareMediaSource: null });
  };

  onShareVideoFailed = () => {
    this.setState({ showVideoShareFailed: true });
  };

  toggleMute = () => {
    APP.dialog.toggleMicrophone();
  };

  shareVideo = mediaSource => {
    this.props.scene.emit(`action_share_${mediaSource}`);
  };

  endShareVideo = () => {
    this.props.scene.emit("action_end_video_sharing");
  };

  spawnPen = () => {
    this.props.scene.emit("penButtonPressed");
  };

  onSubscribeChanged = async () => {
    if (!this.props.subscriptions) return;

    await this.props.subscriptions.toggle();
    this.updateSubscribedState();
  };

  handleForceEntry = () => {
    if (!this.props.forcedVREntryType) return;

    if (this.props.forcedVREntryType.startsWith("daydream")) {
      this.enterDaydream();
    } else if (this.props.forcedVREntryType.startsWith("vr")) {
      this.enterVR();
    } else if (this.props.forcedVREntryType.startsWith("2d")) {
      this.enter2D();
    }
  };

  startAutoExitTimer = autoExitReason => {
    if (this.state.autoExitTimerInterval) return;

    const autoExitTimerInterval = setInterval(() => {
      let secondsRemainingBeforeAutoExit = Infinity;

      if (this.state.autoExitTimerStartedAt) {
        const secondsSinceStart = (new Date() - this.state.autoExitTimerStartedAt) / 1000;
        secondsRemainingBeforeAutoExit = Math.max(0, Math.floor(AUTO_EXIT_TIMER_SECONDS - secondsSinceStart));
      }

      this.setState({ secondsRemainingBeforeAutoExit });
      this.checkForAutoExit();
    }, 500);

    this.setState({ autoExitTimerStartedAt: new Date(), autoExitTimerInterval, autoExitReason });
  };

  checkForAutoExit = () => {
    if (this.state.secondsRemainingBeforeAutoExit !== 0) return;
    this.endAutoExitTimer();
    this.props.exitScene();
  };

  isWaitingForAutoExit = () => {
    return this.state.secondsRemainingBeforeAutoExit <= AUTO_EXIT_TIMER_SECONDS;
  };

  endAutoExitTimer = () => {
    clearInterval(this.state.autoExitTimerInterval);
    this.setState({
      autoExitTimerStartedAt: null,
      autoExitTimerInterval: null,
      autoExitReason: null,
      secondsRemainingBeforeAutoExit: Infinity
    });
  };

  performDirectEntryFlow = async enterInVR => {
    this.setState({ enterInVR, waitingOnAudio: true });
    let hasGrantedMic = false;
    if (msTeamsAPILight().msTeams() || getAdapterParams().adapter === "none") {
      hasGrantedMic = true;
    } else {
      hasGrantedMic = (await grantedMicLabels()).length > 0;
    }

    if (hasGrantedMic || new URL(window.location.href).searchParams.get("offline2") || msTeamsAPILight().msTeams() || getAdapterParams().adapter === "none") {
      if (!this.mediaDevicesManager.isMicShared && !msTeamsAPILight().msTeams()) {
        await this.mediaDevicesManager.startLastUsedMicShare();
      }
      this.beginOrSkipAudioSetup();
    } else {
      this.onRequestMicPermission();
      this.pushHistoryState("entry_step", "mic_grant");
    }
    this.setState({ waitingOnAudio: false });
  };

  enter2D = async () => {
    await this.performDirectEntryFlow(false);
  };

  enterVR = async () => {
    if (this.props.forcedVREntryType || this.props.availableVREntryTypes.generic !== VR_DEVICE_AVAILABILITY.maybe) {
      await this.performDirectEntryFlow(true);
    } else {
      this.showNonHistoriedDialog(WebVRUnsupportedModal);
    }
  };

  enterDaydream = async () => {
    await this.performDirectEntryFlow(true);
  };

  micDeviceChanged = async deviceId => {
    this.mediaDevicesManager.startMicShare(deviceId);
  };

  onRequestMicPermission = async () => {
    // TODO: Show an error state if getting the microphone permissions fails
    await adapterReady();//APTERO
    if (getAdapterParams().adapter !== "none" && !msTeamsAPILight().msTeams()) {
      await this.mediaDevicesManager.startLastUsedMicShare();
    }
    this.beginOrSkipAudioSetup();
  };

  beginOrSkipAudioSetup = () => {
    const skipAudioSetup = this.props.forcedVREntryType && this.props.forcedVREntryType.endsWith("_now");

    AFRAME.scenes[0].audioListener.gain.gain.setTargetAtTime(
      1,
      AFRAME.scenes[0].audioListener.context.currentTime,
      0.2
    );
    if (skipAudioSetup || getAdapterParams().adapter === "none" || msTeamsAPILight().msTeams()) {
      this.onAudioReadyButton();
    } else {
      this.pushHistoryState("entry_step", "audio");
    }
  };

  shouldShowFullScreen = () => {
    // Disable full screen on iOS, since Safari's fullscreen mode does not let you prevent native pinch-to-zoom gestures.
    return (
      (isMobile || AFRAME.utils.device.isMobileVR()) &&
      !AFRAME.utils.device.isIOS() &&
      !this.state.enterInVR &&
      screenfull.enabled
    );
  };

  onAudioReadyButton = async () => {
    if (!this.state.enterInVR && !(this.props.forcedVREntryType && this.props.forcedVREntryType.endsWith("vr_now"))) {
      await showFullScreenIfAvailable();
    }

    // Push the new history state before going into VR, otherwise menu button will take us back
    clearHistoryState(this.props.history);

    const muteOnEntry = msTeamsAPILight().msTeams() ||
      getAdapterParams().adapter === "none" ||
      this.props.store.state.preferences["muteMicOnEntry"];

    await this.props.enterScene(this.state.enterInVR, muteOnEntry);

    this.setState({ entered: true, entering: false, showShareDialog: false });

    if (this.mediaDevicesManager.isMicShared) {
      console.log(`Using microphone: ${this.mediaDevicesManager.selectedMicLabel}`);
    }

    if (this.mediaDevicesManager.isVideoShared) {
      console.log("Screen sharing enabled.");
    }
    apteroService.notifySceneEntered();
  };

  attemptLink = async () => {
    this.pushHistoryState("entry_step", "device");
    const { code, cancel, onFinished } = await this.props.linkChannel.generateCode();
    this.setState({ linkCode: code, linkCodeCancel: cancel });
    onFinished.then(() => {
      this.setState({ log: false, linkCode: null, linkCodeCancel: null });
      this.props.exitScene();
    });
  };

  toggleShareDialog = async () => {
    this.props.store.update({ activity: { hasOpenedShare: true } });
    this.setState({ showShareDialog: !this.state.showShareDialog });
  };

  closeDialog = () => {
    if (this.state.dialog) {
      this.setState({ dialog: null });
    } else {
      this.props.history.goBack();
    }

    if (isIn2DInterstitial()) {
      exit2DInterstitialAndEnterVR();
    } else {
      showFullScreenIfWasFullScreen();
    }
  };

  showNonHistoriedDialog = (DialogClass, props = {}) => {
    this.setState({
      dialog: <DialogClass {...{ onClose: this.closeDialog, ...props }} />
    });
  };

  toggleStreamerMode = () => {
    const isStreaming = !this.state.isStreaming;
    this.props.scene.systems["hubs-systems"].characterController.fly = isStreaming;

    if (isStreaming) {
      this.props.hubChannel.beginStreaming();
    } else {
      this.props.hubChannel.endStreaming();
    }

    this.setState({ isStreaming });
  };

  renderDialog = (DialogClass, props = {}) => <DialogClass {...{ onClose: this.closeDialog, ...props }} />;

  signOut = async () => {
    await this.props.authChannel.signOut(this.props.hubChannel);
    this.setState({ signedIn: false });
  };

  onMiniInviteClicked = () => {
    const link = `https://${configs.SHORTLINK_DOMAIN}/${this.props.hub.hub_id}`;

    this.setState({ miniInviteActivated: true });
    setTimeout(() => {
      this.setState({ miniInviteActivated: false });
    }, 5000);

    if (canShare()) {
      navigator.share({ title: document.title, url: link });
    } else {
      copy(link);
    }
  };

  sendMessage = msg => {
    this.props.onSendMessage(msg);
  };

  occupantCount = () => {
    return this.props.presences ? Object.entries(this.props.presences).length : 0;
  };

  hasEmbedPresence = () => {
    if (!this.props.presences) {
      return false;
    } else {
      for (const p of Object.values(this.props.presences)) {
        for (const m of p.metas) {
          if (m.context && m.context.embed) {
            return true;
          }
        }
      }
    }

    return false;
  };

  onTweet = ({ detail }) => {
    handleExitTo2DInterstitial(true, () => {
    }).then(() => {
      this.props.performConditionalSignIn(
        () => this.props.hubChannel.signedIn,
        () => {
          this.showNonHistoriedDialog(TweetModalContainer, {
            hubChannel: this.props.hubChannel,
            ...detail
          });
        },
        SignInMessages.tweet
      );
    });
  };

  onChangeScene = () => {
    this.props.performConditionalSignIn(
      () => this.props.hubChannel.can("update_hub"),
      () => {
        showFullScreenIfAvailable();
        this.props.mediaSearchStore.sourceNavigateWithNoNav("scenes", "use");
      },
      SignInMessages.changeScene
    );
  };

  pushHistoryState = (k, v) => pushHistoryState(this.props.history, k, v);

  adjustIframeSize(currentState, newState) {
    if (window.PERSISTENTIFRAME && currentState !== newState) {
      if (newState === "psidebar") {
        // Sync persistent iframe with the sidebar bounds
        const iframe = window.PERSISTENTIFRAME;
        const sidebar = document.querySelector(".psidebar");
        if (!sidebar) {
          iframe.style.visibility = "hidden";
          return;
        }
        const sidebarRect = sidebar.getBoundingClientRect();
        iframe.style.left = sidebarRect.left + "px";
        iframe.style.top = sidebarRect.top + "px";
        iframe.style.width = sidebarRect.width + "px";
        iframe.style.height = sidebarRect.height + "px";
        iframe.style.visibility = "visible";

        // Adjust Z index for fullscreen
        if (sidebarRect.width > window.innerWidth/2) {
          iframe.style.zIndex = 11;
        } else {
          iframe.style.zIndex = 1;
        }

        // Sync Sidebar with the new name
        const obj = {
          url : "psidebar",
          type : "sidebar_iframe",
          title: window.PFrameProps.name,
          icon: window.PFrameProps.icon,
        }
        setTimeout(()=>{
          const sceneEl = document.querySelector("a-scene");
          sceneEl.emit("action_toggle_custom_sidebar_info",obj)
        },10);

      } else {
        // Hide persistent iframe
        const iframe = window.PERSISTENTIFRAME;
        iframe.style.visibility = "hidden";
      }
    }
  }

  setSidebar(sidebarId, otherState) {

    this.setState({ sidebarId, selectedUserId: null, ...otherState });
    this.unmuteHBElement();
    // Also adjust iframe size if we are in the persistent iframe (or close it)
    if (sidebarId === "psidebar" || this.state.sidebarId === "psidebar") {
      this.adjustIframeSize(this.state.sidebarId, sidebarId);
    }
  }

  toggleSidebar(sidebarId, otherState) {
    if (sidebarId === "chat") {
      this.setState({ userId: otherState });
    }
    if (sidebarId === "cardVisit") {
      this.setState({ userId: otherState });
    }

    this.setState(({ sidebarId: curSidebarId }) => {
      const nextSidebarId = curSidebarId === sidebarId ? null : sidebarId;
      console.log("Current sidebar: " + curSidebarId + " Next sidebar: " + nextSidebarId);

      // Unmute Hyperbeam element if we DO NOT set sidebarId to "custom"
      if (nextSidebarId !== "custom") {
        this.unmuteHBElement();
      }

      // Handle when we want to CLOSE the persistent iframe
      if (nextSidebarId === "psidebar" 
      && window.PERSISTENTIFRAME === null) {
        // We were indeed in the persistent iframe, so we should close it
        if (curSidebarId === "psidebar") {
          console.log("End persistent iframe")
          this.setState({ sidebarId: null });
          return {
            sidebarId: null,
            selectedUserId: null,
            ...otherState
          }
        } else { // There's something else in the Sidebar (Like the chat for example)
          return;
        }
      }

      if (nextSidebarId === "psidebar" || curSidebarId === "psidebar") {
        console.log("Adjust iframe size")
        // Wait 15 ms first
        setTimeout(() => {
          this.adjustIframeSize(curSidebarId, nextSidebarId);
        }, 15);
      }

      return {
        sidebarId: nextSidebarId,
        selectedUserId: null,
        ...otherState
      };
    });
  }

  unmuteHBElement = () => {
    // Unmumte Hyperbeam element if defined
    const hb_source = window.mutedHBElement;
    if (hb_source) {
      const audio = hb_source.getObject3D(hb_source.attrName);
      if (audio) {
        audio.setVolume(1);
        console.log("Unmuting Hyperbeam element")
      }
      window.mutedHBElement = undefined;
    }    
  }

  renderInterstitialPrompt = () => {
    return (
      <div className={styles.interstitial} onClick={() => this.props.onInterstitialPromptClicked()}>
        <div>
          <FormattedMessage id="ui-root.interstitial-prompt" defaultMessage="Continue"/>
        </div>
      </div>
    );
  };

  renderBotMode = () => {
    return (
      <div className="loading-panel">
        <img className="loading-panel__logo" src={configs.image("logo")}/>
        <input type="file" id="bot-audio-input" accept="audio/*"/>
        <input type="file" id="bot-data-input" accept="application/json"/>
      </div>
    );
  };

  onEnteringCanceled = () => {
    this.props.hubChannel.sendEnteringCancelledEvent();
    this.setState({ entering: false });
  };

  //first = false;//aptero
  renderEntryStartPanel = () => {
    const { hasAcceptedProfile, hasChangedName } = this.props.store.state.activity;
    let promptForNameAndAvatarBeforeEntry = this.props.hubIsBound ? !hasAcceptedProfile : !hasChangedName;
    /*if(!this.first && (this.props.forcedVREntryType && this.props.forcedVREntryType.endsWith("_now"))){
      this.first = true;
      console.log(this);
      setTimeout(() => this.handleForceEntry(), 500);
    }*/
    // TODO: What does onEnteringCanceled do?
    return (
      aptGuiVisible && (
        <>
          <RoomEntryModal
            appName={configs.translation("app-name")}
            logoSrc={configs.image("logo")}
            roomName={this.props.hub.name}
            showJoinRoom={!this.state.waitingOnAudio && !this.props.entryDisallowed}
            onJoinRoom={() => {
              //aptero
              if (!(this.props.forcedVREntryType && this.props.forcedVREntryType.endsWith("_now"))) {
                this.setState({ entering: true });
                this.props.hubChannel.sendEnteringEvent();

                if (promptForNameAndAvatarBeforeEntry) {
                  this.pushHistoryState("entry_step", "profile");
                } else {
                  this.onRequestMicPermission();
                  this.pushHistoryState("entry_step", "mic_grant");
                }
              }
            }}
            showEnterOnDevice={!this.state.waitingOnAudio && !this.props.entryDisallowed && !isMobileVR}
            onEnterOnDevice={() => this.attemptLink()}
            showSpectate={!this.state.waitingOnAudio}
            onSpectate={() => {
              AFRAME.scenes[0].audioListener.gain.gain.setTargetAtTime(
                1,
                AFRAME.scenes[0].audioListener.context.currentTime,
                0.2
              );
              this.setState({ watching: true });
            }}
            showOptions={this.props.hubChannel.canOrWillIfCreator("update_hub")}
            onOptions={() => {
              this.props.performConditionalSignIn(
                () => this.props.hubChannel.can("update_hub"),
                () => this.setSidebar("room-settings"),
                SignInMessages.roomSettings
              );
            }}
          />
          {!this.state.waitingOnAudio && (
            <EntryStartPanel
              hubChannel={this.props.hubChannel}
              entering={this.state.entering}
              onEnteringCanceled={this.onEnteringCanceled}
            />
          )}
        </>
      )
    );
  };
  renderDevicePanel = () => {
    return (
      <EnterOnDeviceModal
        shortUrl={configs.SHORTLINK_DOMAIN}
        loadingCode={!this.state.linkCode}
        code={this.state.linkCode}
        headsetConnected={
          this.props.availableVREntryTypes.generic !== VR_DEVICE_AVAILABILITY.no ||
          this.props.availableVREntryTypes.cardboard !== VR_DEVICE_AVAILABILITY.no
        }
        unsupportedBrowser={this.props.availableVREntryTypes.generic === VR_DEVICE_AVAILABILITY.maybe}
        onEnterOnConnectedHeadset={() => {
          // TODO: This is bad. linkCodeCancel should be tied to component lifecycle not these callback methods.
          this.state.linkCodeCancel();
          this.setState({ linkCode: null, linkCodeCancel: null });
          this.enterVR();
        }}
        onBack={() => {
          if (this.state.linkCodeCancel) {
            // If the back button is pressed rapidly
            // (before link code generation finishes),
            // linkCodeCancel will not be a function
            // and attempting to call it will throw.
            // TODO: If that happens it may be ideal to
            // interrupt and cancel link code generation.
            this.state.linkCodeCancel();
          }
          this.setState({ linkCode: null, linkCodeCancel: null });
          this.props.history.goBack();
        }}
      />
    );
  };

  renderAudioSetupPanel = () => {
    const muteOnEntry = this.props.store.state.preferences["muteMicOnEntry"] || false;
    // TODO: Show HMD mic not chosen warning
    return (
      <MicSetupModalContainer
        scene={this.props.scene}
        selectedMicrophone={this.mediaDevicesManager.selectedMicDeviceId}
        microphoneOptions={this.mediaDevicesManager.micDevices}
        onChangeMicrophone={this.micDeviceChanged}
        microphoneEnabled={this.mediaDevicesManager.isMicShared}
        microphoneMuted={muteOnEntry}
        onChangeMicrophoneMuted={() => this.props.store.update({ preferences: { muteMicOnEntry: !muteOnEntry } })}
        onEnterRoom={() => {
          this.onAudioReadyButton();
        }}
        onBack={() => this.props.history.goBack()}
      />
    );
  };

  isInModalOrOverlay = () => {
    if (
      this.state.entered &&
      (IN_ROOM_MODAL_ROUTER_PATHS.find(x => sluglessPath(this.props.history.location).startsWith(x)) ||
        IN_ROOM_MODAL_QUERY_VARS.find(x => new URLSearchParams(this.props.history.location.search).get(x)))
    ) {
      return true;
    }

    if (
      !this.state.entered &&
      (LOBBY_MODAL_ROUTER_PATHS.find(x => sluglessPath(this.props.history.location).startsWith(x)) ||
        LOBBY_MODAL_QUERY_VARS.find(
          (x, i) => new URLSearchParams(this.props.history.location.search).get(x) === LOBBY_MODAL_QUERY_VALUES[i]
        ))
    ) {
      return true;
    }

    if (this.state.objectInfo && this.state.objectInfo.object3D) {
      return true; // TODO: Get object info dialog to use history
    }
    if (this.state.sidebarId !== null) {
      return true;
    }

    return !!(
      (this.props.history &&
        this.props.history.location.state &&
        (this.props.history.location.state.modal || this.props.history.location.state.overlay)) ||
      this.state.dialog
    );
  };

  getSelectedUser() {
    const selectedUserId = this.state.selectedUserId;
    const presence = this.props.presences[selectedUserId];
    if (!presence) {
      return null;
    } else {
      const micPresences = getMicrophonePresences();
      return userFromPresence(selectedUserId, presence, micPresences, this.props.sessionId);
    }
  }

  getSelectedId() {
    const selectedUserId = this.state.selectedUserId;
    return selectedUserId;
  }

  render() {
    const isGhost =
      configs.feature("enable_lobby_ghosts") && (this.state.watching || this.state.hide || this.props.hide);
    const hide = this.state.hide || this.props.hide;

    const rootStyles = {
      [styles.ui]: true,
      "ui-root": true,
      "in-modal-or-overlay": this.isInModalOrOverlay(),
      isGhost,
      hide
    };

    if (this.props.hide || this.state.hide) {
      return (
        <div className={classNames(rootStyles)}>
          <RoomLayoutContainer
            scene={this.props.scene}
            store={this.props.store}
            viewport={!this.state.hideUITip && <FullscreenTip onDismiss={() => this.setState({ hideUITip: true })}/>}
          />
        </div>
      );
    }

    if (this.props.showSafariMicDialog) {
      return (
        <div className={classNames(rootStyles)}>
          <RoomLayoutContainer scene={this.props.scene} store={this.props.store} modal={<SafariMicModal/>}/>
        </div>
      );
    }

    const preload = this.props.showPreload;

    const isLoading = !preload && !this.state.hideLoader;

    if (isLoading && this.state.showPrefs) {
      return (
        <div>
          <LoadingScreenContainer scene={this.props.scene} onLoaded={this.onLoadingFinished}/>
          <PreferencesScreen
            onClose={() => {
              this.setState({ showPrefs: false });
            }}
            store={this.props.store}
            scene={this.props.scene}
          />
        </div>
      );
    }
    if (this.props.isBotMode) return this.renderBotMode();
    if (isLoading) {
      return <LoadingScreenContainer scene={this.props.scene} onLoaded={this.onLoadingFinished}/>;
    }
    if (this.state.showPrefs) {
      return (
        <PreferencesScreen
          onClose={() => {
            this.setState({ showPrefs: false });
          }}
          store={this.props.store}
          scene={this.props.scene}
        />
      );
    }

    if (this.props.showInterstitialPrompt) return this.renderInterstitialPrompt();

    const entered = this.state.entered;
    const watching = this.state.watching;
    const enteredOrWatching = entered || watching;
    const showRtcDebugPanel = this.props.store.state.preferences["showRtcDebugPanel"];
    const showAudioDebugPanel = this.props.store.state.preferences["showAudioDebugPanel"];
    const displayNameOverride = this.props.hubIsBound
      ? getPresenceProfileForSession(this.props.presences, this.props.sessionId).displayName
      : null;

    const enableSpectateVRButton =
      configs.feature("enable_lobby_ghosts") &&
      isGhost &&
      !hide &&
      this.props.availableVREntryTypes.generic !== VR_DEVICE_AVAILABILITY.no;

    const entryDialog =
      this.props.availableVREntryTypes &&
      !preload &&
      (this.isWaitingForAutoExit() ? (
        <AutoExitWarningModal
          reason={this.state.autoExitReason}
          secondsRemaining={this.state.secondsRemainingBeforeAutoExit}
          onCancel={this.endAutoExitTimer}
        />
      ) : (
        <>
          <StateRoute stateKey="entry_step" stateValue="device" history={this.props.history}>
            {this.renderDevicePanel()}
          </StateRoute>
          <StateRoute stateKey="entry_step" stateValue="mic_grant" history={this.props.history}>
            <MicPermissionsModal onBack={() => this.props.history.goBack()}/>
          </StateRoute>
          <StateRoute stateKey="entry_step" stateValue="audio" history={this.props.history}>
            {this.renderAudioSetupPanel()}
          </StateRoute>
          <StateRoute
            stateKey="entry_step"
            stateValue="profile"
            history={this.props.history}
            render={props => (
              <ProfileEntryPanel
                {...props}
                containerType="modal"
                displayNameOverride={displayNameOverride}
                finished={() => {
                  if (this.props.forcedVREntryType) {
                    this.pushHistoryState();
                    this.handleForceEntry();
                  } else {
                    this.onRequestMicPermission();
                    this.pushHistoryState("entry_step", "mic_grant");
                  }
                }}
                showBackButton
                onBack={() => this.pushHistoryState()}
                store={this.props.store}
                mediaSearchStore={this.props.mediaSearchStore}
                avatarId={props.location.state.detail && props.location.state.detail.avatarId}
              />
            )}
          />
          <StateRoute stateKey="entry_step" stateValue="" history={this.props.history}>
            {this.renderEntryStartPanel()}
          </StateRoute>
        </>
      ));

    const presenceLogEntries = this.props.presenceLogEntries || [];

    const mediaSource = this.props.mediaSearchStore.getUrlMediaSource(this.props.history.location);

    // Allow scene picker pre-entry, otherwise wait until entry
    const showMediaBrowser =
      mediaSource && (["scenes", "avatars", "favorites"].includes(mediaSource) || this.state.entered);

    const streaming = this.state.isStreaming;

    const showObjectList = enteredOrWatching;

    const streamer = getCurrentStreamer();
    const streamerName = streamer && streamer.displayName;

    const renderEntryFlow = (!enteredOrWatching && this.props.hub) || this.isWaitingForAutoExit();

    const canCreateRoom = !configs.feature("disable_room_creation") || configs.isAdmin();
    const canCloseRoom = this.props.hubChannel && !!this.props.hubChannel.canOrWillIfCreator("close_hub");
    const isModerator = this.props.hubChannel && this.props.hubChannel.canOrWillIfCreator("kick_users") && !isMobileVR;

    let moreMenu = [
      {
        id: "user",
        label:
          "You" +
          (this.state.signedIn ? ` (Signed in as: ${maskEmail(this.props.store.state.credentials.email)})` : ""),
        items: [
          this.state.signedIn
            ? {
              id: "sign-out",
              label: <FormattedMessage id="more-menu.sign-out" defaultMessage="Sign Out"/>,
              icon: LeaveIcon,
              onClick: async () => {
                await this.props.authChannel.signOut(this.props.hubChannel);
                this.setState({ signedIn: false });
              }
            }
            : {
              id: "sign-in",
              label: <FormattedMessage id="more-menu.sign-in" defaultMessage="Sign In"/>,
              icon: EnterIcon,
              onClick: () => this.showContextualSignInDialog()
            },
          canCreateRoom && {
            id: "create-room",
            label: <FormattedMessage id="more-menu.create-room" defaultMessage="Create Room"/>,
            icon: AddIcon,
            onClick: () =>
              this.showNonHistoriedDialog(LeaveRoomModal, {
                destinationUrl: "/",
                reason: LeaveReason.createRoom
              })
          },
          {
            id: "user-profile",
            label: <FormattedMessage id="more-menu.profile" defaultMessage="Change Name & Avatar"/>,
            icon: AvatarIcon,
            onClick: () => this.setSidebar("profile")
          },
          {
            id: "favorite-rooms",
            label: <FormattedMessage id="more-menu.favorite-rooms" defaultMessage="Favorite Rooms"/>,
            icon: FavoritesIcon,
            onClick: () =>
              this.props.performConditionalSignIn(
                () => this.props.hubChannel.signedIn,
                () => {
                  showFullScreenIfAvailable();
                  this.props.mediaSearchStore.sourceNavigateWithNoNav("favorites", "use");
                },
                SignInMessages.favoriteRooms
              )
          },
          {
            id: "preferences",
            label: "Preferences",
            icon: SettingsIcon,
            onClick: () => this.setState({ showPrefs: true })
          }
        ].filter(item => item)
      },
      {
        id: "room",
        label: <FormattedMessage id="more-menu.room" defaultMessage="Room"/>,
        items: [
          renderEntryFlow && (enableSpectateVRButton || true) && { //Aptero add enter-device menu
            id: "enter-device",
            label: <FormattedMessage id="room-entry-modal.enter-on-device-button" defaultMessage="Enter On Device"/>,
            icon: VRIcon,
            onClick: () => this.attemptLink()
          },
          {
            id: "room-info",
            label: <FormattedMessage id="more-menu.room-info" defaultMessage="Room Info and Settings"/>,
            icon: HomeIcon,
            onClick: () => this.setSidebar("room-info")
          },
          {
            id: "objects",
            label: <FormattedMessage id="more-menu.objects" defaultMessage="Objects"/>,
            icon: ObjectsIcon,
            onClick: () => this.setSidebar("objects")
          },
          (this.props.breakpoint === "sm" || this.props.breakpoint === "md" || true) &&//Aptero for the '|| to force render of invite'
          this.props.hub &&
          (this.props.hub.entry_mode !== "invite" || this.props.hubChannel.can("update_hub")) && {
            id: "invite",
            label: <FormattedMessage id="more-menu.invite" defaultMessage="Invite"/>,
            icon: InviteIcon,
            onClick: () => console.log(document.querySelector("." + styles.inviteButtonContainer).click())
            // this.props.scene.emit("action_invite")
          },
          this.isFavorited()
            ? {
              id: "unfavorite-room",
              label: <FormattedMessage id="more-menu.unfavorite-room" defaultMessage="Unfavorite Room"/>,
              icon: StarIcon,
              onClick: () => this.toggleFavorited()
            }
            : {
              id: "favorite-room",
              label: <FormattedMessage id="more-menu.favorite-room" defaultMessage="Favorite Room"/>,
              icon: StarOutlineIcon,
              onClick: () => this.toggleFavorited()
            },
          isModerator &&
          entered && {
            id: "streamer-mode",
            label: streaming ? (
              <FormattedMessage id="more-menu.exit-streamer-mode" defaultMessage="Exit Streamer Mode"/>
            ) : (
              <FormattedMessage id="more-menu.enter-streamer-mode" defaultMessage="Enter Streamer Mode"/>
            ),
            icon: CameraIcon,
            onClick: () => this.toggleStreamerMode()
          },
          (this.props.breakpoint === "sm" || this.props.breakpoint === "md") &&
          entered && {
            id: "leave-room",
            label: <FormattedMessage id="more-menu.enter-leave-room" defaultMessage="Leave Room"/>,
            icon: LeaveIcon,
            onClick: () => {
              this.showNonHistoriedDialog(LeaveRoomModal, {
                destinationUrl: "/",
                reason: LeaveReason.leaveRoom
              });
            }
          },
          canCloseRoom && {
            id: "close-room",
            label: <FormattedMessage id="more-menu.close-room" defaultMessage="Close Room"/>,
            icon: DeleteIcon,
            onClick: () =>
              this.props.performConditionalSignIn(
                () => this.props.hubChannel.can("update_hub"),
                () => {
                  this.showNonHistoriedDialog(CloseRoomModal, {
                    roomName: this.props.hub.name,
                    onConfirm: () => {
                      this.props.hubChannel.closeHub();
                    }
                  });
                },
                SignInMessages.closeRoom
              )
          }
        ].filter(item => item)
      },
      {
        id: "support",
        label: <FormattedMessage id="more-menu.support" defaultMessage="Support"/>,
        items: [
          configs.feature("show_community_link") && {
            id: "community",
            label: <FormattedMessage id="more-menu.community" defaultMessage="Community"/>,
            icon: DiscordIcon,
            href: configs.link("community", "https://discord.gg/dFJncWwHun")
          },
          configs.feature("show_issue_report_link") && {
            id: "report-issue",
            label: <FormattedMessage id="more-menu.report-issue" defaultMessage="Report Issue"/>,
            icon: WarningCircleIcon,
            href: configs.link("issue_report", "https://www.aptero.co/docs/help.html")
          },
          entered && {
            id: "start-tour",
            label: <FormattedMessage id="more-menu.start-tour" defaultMessage="Start Tour"/>,
            icon: SupportIcon,
            onClick: () => {
              window.open("https://vimeo.com/524816064");
              this.props.scene.systems.tips.resetTips();
            }
          },
          configs.feature("show_docs_link") && {
            id: "help",
            label: <FormattedMessage id="more-menu.help" defaultMessage="Help"/>,
            icon: SupportIcon,
            href: configs.link("docs", "https://www.aptero.co/docs")
          },
          configs.feature("show_controls_link") && {
            id: "controls",
            label: <FormattedMessage id="more-menu.controls" defaultMessage="Controls"/>,
            icon: SupportIcon,
            href: configs.link("controls", "https://www.aptero.co/docs/hubs-controls.html")
          },
          configs.feature("show_whats_new_link") && {
            id: "whats-new",
            label: <FormattedMessage id="more-menu.whats-new" defaultMessage="What's New"/>,
            icon: SupportIcon,
            href: "/whats-new"
          },
          configs.feature("show_terms") && {
            id: "tos",
            label: <FormattedMessage id="more-menu.tos" defaultMessage="Terms of Service"/>,
            icon: TextDocumentIcon,
            href: configs.link("terms_of_use", "https://github.com/mozilla/hubs/blob/master/TERMS.md")
          },
          configs.feature("show_privacy") && {
            id: "privacy",
            label: <FormattedMessage id="more-menu.privacy" defaultMessage="Privacy Notice"/>,
            icon: ShieldIcon,
            href: configs.link("privacy_notice", "https://github.com/mozilla/hubs/blob/master/PRIVACY.md")
          },
          {
            id: "faq",
            label: <FormattedMessage id="more-menu.faq" defaultMessage="FAQ"/>,
            icon: SupportIcon,
            href: configs.link("docs", "https://www.aptero.co/help.html")
          }
        ].filter(item => item)
      }
    ];

    if (msTeamsAPILight().msTeams() && this.state.msTeamsAPI) {
      moreMenu = [
        {
          id: "user",
          label:
            "You" +
            (this.state.signedIn ? ` (Signed in as: ${maskEmail(this.props.store.state.credentials.email)})` : ""),
          items: [
            {
              id: "user-profile",
              label: <FormattedMessage id="more-menu.profile" defaultMessage="Change Name & Avatar"/>,
              icon: AvatarIcon,
              onClick: () => this.setSidebar("profile")
            },
            {
              id: "preferences",
              label: "Preferences",
              icon: SettingsIcon,
              onClick: () => this.setState({ showPrefs: true })
            },
            this.state.msTeamsAPI.getLoginService().isSignedIn() ? {
              id: "authorize",
              label: "Sign Out",
              icon: SettingsIcon,
              onClick: () => {
                this.state.msTeamsAPI.getLoginService().logout();
              }
            } : {
              id: "authorize",
              label: "Sign In",
              icon: SettingsIcon,
              onClick: () => {
                this.state.msTeamsAPI.getLoginService().login();
              }
            }
          ].filter(item => item)
        },
        {
          id: "room",
          label: <FormattedMessage id="more-menu.room" defaultMessage="Room"/>,
          items: [
            renderEntryFlow && (enableSpectateVRButton || true) && { //Aptero add enter-device menu
              id: "enter-device",
              label: <FormattedMessage id="room-entry-modal.enter-on-device-button" defaultMessage="Enter On Device"/>,
              icon: VRIcon,
              onClick: () => this.attemptLink()
            },
            {
              id: "room-info",
              label: <FormattedMessage id="more-menu.room-info" defaultMessage="Room Info and Settings"/>,
              icon: HomeIcon,
              onClick: () => this.setSidebar("room-info")
            },
            (isTeamsLimitedOK()) && {
              id: "objects",
              label: <FormattedMessage id="more-menu.objects" defaultMessage="Objects"/>,
              icon: ObjectsIcon,
              onClick: () => this.setSidebar("objects")
            },
            this.isFavorited()
              ? {
                id: "unfavorite-room",
                label: <FormattedMessage id="more-menu.unfavorite-room" defaultMessage="Unfavorite Room"/>,
                icon: StarIcon,
                onClick: () => this.toggleFavorited()
              }
              : {
                id: "favorite-room",
                label: <FormattedMessage id="more-menu.favorite-room" defaultMessage="Favorite Room"/>,
                icon: StarOutlineIcon,
                onClick: () => this.toggleFavorited()
              },
            (isModerator && entered && isTeamsLimitedOK()) && {
              id: "streamer-mode",
              label: streaming ? (
                <FormattedMessage id="more-menu.exit-streamer-mode" defaultMessage="Exit Streamer Mode"/>
              ) : (
                <FormattedMessage id="more-menu.enter-streamer-mode" defaultMessage="Enter Streamer Mode"/>
              ),
              icon: CameraIcon,
              onClick: () => this.toggleStreamerMode()
            }
          ].filter(item => item)
        },
        {
          id: "support",
          label: isTeamsLimitedOK() ?<FormattedMessage id="more-menu.support" defaultMessage="Support"/>: <></>,
          items: [
            configs.feature("show_community_link") && {
              id: "community",
              label: <FormattedMessage id="more-menu.community" defaultMessage="Community"/>,
              icon: DiscordIcon,
              href: configs.link("community", "https://discord.gg/dFJncWwHun")
            },
            configs.feature("show_issue_report_link") && {
              id: "report-issue",
              label: <FormattedMessage id="more-menu.report-issue" defaultMessage="Report Issue"/>,
              icon: WarningCircleIcon,
              href: configs.link("issue_report", "https://www.aptero.co/docs/help.html")
            },
            (entered && isTeamsLimitedOK()) && {
              id: "start-tour",
              label: <FormattedMessage id="more-menu.start-tour" defaultMessage="Start Tour"/>,
              icon: SupportIcon,
              onClick: () => {
                window.open("https://vimeo.com/524816064");
                this.props.scene.systems.tips.resetTips();
              }
            },
            configs.feature("show_docs_link") && {
              id: "help",
              label: <FormattedMessage id="more-menu.help" defaultMessage="Help"/>,
              icon: SupportIcon,
              href: configs.link("docs", "https://www.aptero.co/docs")
            },
            configs.feature("show_controls_link") && {
              id: "controls",
              label: <FormattedMessage id="more-menu.controls" defaultMessage="Controls"/>,
              icon: SupportIcon,
              href: configs.link("controls", "https://www.aptero.co/docs/hubs-controls.html")
            },
            configs.feature("show_whats_new_link") && {
              id: "whats-new",
              label: <FormattedMessage id="more-menu.whats-new" defaultMessage="What's New"/>,
              icon: SupportIcon,
              href: "/whats-new"
            },
            configs.feature("show_terms") && {
              id: "tos",
              label: <FormattedMessage id="more-menu.tos" defaultMessage="Terms of Service"/>,
              icon: TextDocumentIcon,
              href: configs.link("terms_of_use", "https://github.com/mozilla/hubs/blob/master/TERMS.md")
            },
            configs.feature("show_privacy") && {
              id: "privacy",
              label: <FormattedMessage id="more-menu.privacy" defaultMessage="Privacy Notice"/>,
              icon: ShieldIcon,
              href: configs.link("privacy_notice", "https://github.com/mozilla/hubs/blob/master/PRIVACY.md")
            },
            (isTeamsLimitedOK()) && {
              id: "faq",
              label: <FormattedMessage id="more-menu.faq" defaultMessage="FAQ"/>,
              icon: SupportIcon,
              href: configs.link("docs", "https://www.aptero.co/help.html")
            }
          ].filter(item => item)
        }
      ];
    }

    if (!this.getSelectedUser() && (this.state.sidebarId === "display_user_panel" || this.state.sidebarId === "user")) {
      this.setState({ sidebarId: null });
    }

    return (
      <MoreMenuContextProvider>
        <ReactAudioContext.Provider value={this.state.audioContext}>
          <div className={classNames(rootStyles)}>
            {preload && this.props.hub && (
              <PreloadOverlay
                hubName={this.props.hub.name}
                hubScene={this.props.hub.scene}
                baseUrl={hubUrl(this.props.hub.hub_id).href}
                onLoadClicked={this.props.onPreloadLoadClicked}
              />
            )}
            {!this.state.dialog && (
              <StateRoute
                stateKey="overlay"
                stateValue="avatar-editor"
                history={this.props.history}
                render={props => (
                  <AvatarEditor
                    className={styles.avatarEditor}
                    signedIn={this.state.signedIn}
                    onSignIn={this.showContextualSignInDialog}
                    onSave={() => {
                      if (props.location.state.detail && props.location.state.detail.returnToProfile) {
                        this.props.history.goBack();
                      } else {
                        this.props.history.goBack();
                        // We are returning to the media browser. Trigger an update so that the filter switches to
                        // my-avatars, now that we've saved an avatar.
                        this.props.mediaSearchStore.sourceNavigateWithNoNav("avatars", "use");
                      }
                      this.props.onAvatarSaved();
                    }}
                    onClose={() => this.props.history.goBack()}
                    store={this.props.store}
                    debug={avatarEditorDebug}
                    avatarId={props.location.state.detail && props.location.state.detail.avatarId}
                    hideDelete={props.location.state.detail && props.location.state.detail.hideDelete}
                  />
                )}
              />
            )}
            {!this.state.dialog && showMediaBrowser && (
              <MediaBrowserContainer
                history={this.props.history}
                mediaSearchStore={this.props.mediaSearchStore}
                hubChannel={this.props.hubChannel}
                onMediaSearchResultEntrySelected={(entry, selectAction) => {
                  if (entry.type === "room") {
                    this.showNonHistoriedDialog(LeaveRoomModal, {
                      destinationUrl: entry.url,
                      reason: LeaveReason.joinRoom
                    });
                  } else {
                    this.props.onMediaSearchResultEntrySelected(entry, selectAction);
                  }
                }}
                performConditionalSignIn={this.props.performConditionalSignIn}
                showNonHistoriedDialog={this.showNonHistoriedDialog}
                store={this.props.store}
                scene={this.props.scene}
              />
            )}
            {this.props.hub && (
              <RoomLayoutContainer
                scene={this.props.scene}
                store={this.props.store}
                objectFocused={!!this.props.selectedObject}
                streaming={streaming}
                viewport={
                  <>
                    {!this.state.dialog && renderEntryFlow ? entryDialog : undefined}
                    {!this.props.selectedObject && <CompactMoreMenuButton/>}
                    {(aptGuiVisible) &&
                      (!this.props.selectedObject ||
                        (this.props.breakpoint !== "sm" && this.props.breakpoint !== "md")) && (
                        <ContentMenu>
                            <CustomMenuButton
                              active={this.state.sidebarId === "custom"}
                              onClick={() => this.toggleSidebar("custom")}
                            />
                            <InstancesMenuButton
                                active={this.state.sidebarId === "instances"}
                                onClick={() => this.toggleSidebar("instances")}
                            />
                          {showObjectList && false && (//Aptero
                            <ObjectsMenuButton
                              active={this.state.sidebarId === "objects"}
                              onClick={() => this.toggleSidebar("objects")}
                            />
                          )}
                          {//Aptero
                            this.state.persistentIframe && (
                            <PSidebarButton
                              active={this.state.sidebarId === "psidebar"}
                              onClick={() => this.toggleSidebar("psidebar")}
                              icon={this.state.psidebarIcon}
                            />
                          )}
                          <PeopleMenuButton
                            active={this.state.sidebarId === "people"}
                            onClick={() => this.toggleSidebar("people")}
                            presencecount={this.state.presenceCount}
                          />
                        </ContentMenu>
                      )}
                    {!entered && !streaming && !isMobile && streamerName && <SpectatingLabel name={streamerName}/>}
                    {this.props.activeObject && (
                      <ObjectMenuContainer
                        hubChannel={this.props.hubChannel}
                        scene={this.props.scene}
                        onOpenProfile={() => this.setSidebar("profile")}
                        onGoToObject={() => {
                          if (this.props.breakpoint === "sm") {
                            this.setSidebar(null);
                          }
                        }}
                      />
                    )}
                    {this.state.sidebarId !== "chat" && this.props.hub && (
                      <PresenceLog
                        inRoom={true}
                        presences={this.props.presences}
                        entries={presenceLogEntries}
                        hubId={this.props.hub.hub_id}
                        history={this.props.history}
                        onViewProfile={sessionId => this.setSidebar("user", { selectedUserId: sessionId })}
                      />
                    )}
                    <TipContainer
                      hide={this.props.activeObject || !aptGuiVisible}
                      inLobby={watching}
                      inRoom={entered}
                      isEmbedded={this.props.embed}
                      isStreaming={streaming}
                      hubId={this.props.hub.hub_id}
                      presences={this.props.presences}
                      scene={this.props.scene}
                      store={this.props.store}
                    />
                    {(showRtcDebugPanel || showAudioDebugPanel) && (
                      <RTCDebugPanel
                        history={this.props.history}
                        store={window.APP.store}
                        scene={this.props.scene}
                        presences={this.props.presences}
                        sessionId={this.props.sessionId}
                        showRtcDebug={showRtcDebugPanel}
                        showAudioDebug={showAudioDebugPanel}
                      />
                    )}
                  </>
                }
                sidebar={
                  this.state.sidebarId ? (
                    <>
                      {this.state.sidebarId === "custom" ||
                       this.state.sidebarId === "psidebar" && (
                        <CustomSidebarContainer onClose={() => this.setSidebar(null)}/>
                      )}

                      {this.state.sidebarId === "instances" && (
                          <InstancesSidebarContainer onClose={() => this.setSidebar(null)}/>
                      )}

                      {this.state.sidebarId === "chat" && (
                        <ChatSidebarContainer
                          userId={this.state.userId}
                          userName={getSelectedPersonName()}
                          presences={this.props.presences}
                          occupantCount={this.occupantCount()}
                          canSpawnMessages={entered && this.props.hubChannel.can("spawn_and_move_media")}
                          scene={this.props.scene}
                          onClose={() => this.setSidebar(null)}
                          toggleChatSidebar={(type, userid) => this.toggleSidebar(type, userid)}
                        />
                      )}
                      {this.state.sidebarId === "objects" && (
                        <ObjectsSidebarContainer
                          hubChannel={this.props.hubChannel}
                          onClose={() => this.setSidebar(null)}
                        />
                      )}
                      {this.state.sidebarId === "people" && (
                        <PeopleSidebarContainer
                          signedIn={() => this.showContextualSignInDialog()}
                          signedInMicorsoft={() => this.showContextualMicrosoftSignInDialog()}
                          displayNameOverride={displayNameOverride}
                          store={this.props.store}
                          mediaSearchStore={this.props.mediaSearchStore}
                          hubChannel={this.props.hubChannel}
                          history={this.props.history}
                          mySessionId={this.props.sessionId}
                          presences={this.props.presences}
                          onClose={() => this.setSidebar(null)}
                          onCloseDialog={() => this.closeDialog()}
                          showNonHistoriedDialog={this.showNonHistoriedDialog}
                          performConditionalSignIn={this.props.performConditionalSignIn}
                          toggleChatSidebar={(type, userid, onBack) => this.toggleSidebar(type, userid, onBack)}
                        />
                      )}
                      {this.state.sidebarId === "profile" && (
                        <ProfileEntryPanel
                          history={this.props.history}
                          containerType="sidebar"
                          displayNameOverride={displayNameOverride}
                          finished={() => this.setSidebar(null)}
                          onClose={() => this.setSidebar(null)}
                          store={this.props.store}
                          mediaSearchStore={this.props.mediaSearchStore}
                        />
                      )}
                      {(this.state.sidebarId === "user" && this.getSelectedUser()) && (
                        <UserProfileSidebarContainer
                          user={this.getSelectedUser()}
                          performConditionalSignIn={this.props.performConditionalSignIn}
                          onClose={() => this.setSidebar(null)}
                          onCloseDialog={() => this.closeDialog()}
                          toggleSidebar={(type) => this.toggleSidebar(type)}
                          showNonHistoriedDialog={this.showNonHistoriedDialog}
                        />
                      )}

                      {(this.state.sidebarId === "display_user_panel" && this.getSelectedUser()) && (
                        <UserProfileSidebarContainer
                          user={this.getSelectedUser()}
                          performConditionalSignIn={this.props.performConditionalSignIn}
                          onClose={() => this.setSidebar(null)}
                          onCloseDialog={() => this.closeDialog()}
                          toggleSidebar={(type) => this.toggleSidebar(type)}
                          showNonHistoriedDialog={this.showNonHistoriedDialog}
                          signedIn={() => this.showContextualSignInDialog()}
                          signedInMicorsoft={() => this.showContextualMicrosoftSignInDialog()}
                          displayNameOverride={displayNameOverride}
                          store={this.props.store}
                          mediaSearchStore={this.props.mediaSearchStore}
                          hubChannel={this.props.hubChannel}
                          history={this.props.history}
                          mySessionId={this.props.sessionId}
                          presences={this.props.presences}
                          toggleChatSidebar={(type, userid, onBack) => this.toggleSidebar(type, userid, onBack)}
                        />
                      )}
                      {this.state.sidebarId === "cardVisit" && (
                        <UserProfileVisitCardContainer
                          mySessionId={this.props.sessionId}
                          presences={this.props.presences}
                          userId={this.state.userId}
                          store={this.props.store}
                          hubChannel={this.props.hubChannel}
                          performConditionalSignIn={this.props.performConditionalSignIn}
                          onClose={() => this.setSidebar(null)}
                          onCloseDialog={() => this.closeDialog()}
                          toggleSidebar={(type) => this.toggleSidebar(type)}
                          showNonHistoriedDialog={this.showNonHistoriedDialog}
                        />
                      )}
                      {this.state.sidebarId === "room-info" && (
                        <RoomSidebar
                          accountId={this.props.sessionId}
                          room={this.props.hub}
                          canEdit={this.props.hubChannel.canOrWillIfCreator("update_hub") || configs.isAdmin()}
                          onEdit={() => {
                            this.props.performConditionalSignIn(
                              () => this.props.hubChannel.can("update_hub") || configs.isAdmin(),
                              () => this.setSidebar("room-info-settings"),
                              SignInMessages.roomSettings
                            );
                          }}
                          onClose={() => this.setSidebar(null)}
                          onChangeScene={this.onChangeScene}
                        />
                      )}
                      {this.state.sidebarId === "room-info-settings" && (
                        <RoomSettingsSidebarContainer
                          room={this.props.hub}
                          hubChannel={this.props.hubChannel}
                          showBackButton
                          onClose={() => this.setSidebar("room-info")}
                          onChangeScene={this.onChangeScene}
                        />
                      )}
                      {this.state.sidebarId === "room-settings" && (
                        <RoomSettingsSidebarContainer
                          room={this.props.hub}
                          accountId={this.props.sessionId}
                          hubChannel={this.props.hubChannel}
                          onClose={() => this.setSidebar(null)}
                          onChangeScene={this.onChangeScene}
                        />
                      )}
                    </>
                  ) : (
                    undefined
                  )
                }
                modal={this.state.dialog}
                toolbarLeft={<div></div>/*
                  */
                }
                toolbarCenter={
                  !aptGuiVisible ? null : (
                    <>
                      {(!msTeamsAPILight().msTeams()) && <>
                        {watching && (
                          <>
                            <ToolbarButton
                              icon={<EnterIcon/>}
                              label={<FormattedMessage id="toolbar.join-room-button" defaultMessage="Join Room"/>}
                              preset="accept"
                              onClick={() => this.setState({ watching: false })}
                            />
                            {enableSpectateVRButton && (
                              <ToolbarButton
                                icon={<VRIcon/>}
                                preset="accent5"
                                label={
                                  <FormattedMessage id="toolbar.spectate-in-vr-button" defaultMessage="Spectate in VR"/>
                                }
                                onClick={() => this.props.scene.enterVR()}
                              />
                            )}
                          </>
                        )}
                        {entered && (
                          <>
                            <VoiceButtonContainer
                              scene={this.props.scene}
                              microphoneEnabled={this.mediaDevicesManager.isMicShared}
                            />
                            <SharePopoverContainer scene={this.props.scene} hubChannel={this.props.hubChannel}/>
                            <PlacePopoverContainer
                              scene={this.props.scene}
                              hubChannel={this.props.hubChannel}
                              mediaSearchStore={this.props.mediaSearchStore}
                              showNonHistoriedDialog={this.showNonHistoriedDialog}
                            />
                            {this.props.hubChannel.can("spawn_emoji") && <ReactionPopoverContainer/>}
                          </>
                        )}
                        <ChatToolbarButtonContainer onClick={() => this.toggleSidebar("chat", "everyone")}/>
                        {entered && isMobileVR && (
                          <ToolbarButton
                            className={styleUtils.hideLg}
                            icon={<VRIcon/>}
                            preset="accept"
                            label={<FormattedMessage id="toolbar.enter-vr-button" defaultMessage="Enter VR"/>}
                            onClick={() => exit2DInterstitialAndEnterVR(true)}
                          />
                        )}
                      </>
                      }
                    </>
                  )
                }
                toolbarRight={
                  !aptGuiVisible ? null : (
                    <>
                      {entered && isMobileVR && (
                        <ToolbarButton
                          icon={<VRIcon/>}
                          preset="accept"
                          label={<FormattedMessage id="toolbar.enter-vr-button" defaultMessage="Enter VR"/>}
                          onClick={
                            () => this.props.scene.enterVR()//APTERO
                            //() => exit2DInterstitialAndEnterVR(true)
                          }
                        />
                      )}
                      <MoreMenuPopoverButton menu={moreMenu}/>{/*Aptero*/}
                      {!aptGuiVisible ? null : (
                        <InvitePopoverContainer className={styles.inviteButtonContainer}
                                                hub={this.props.hub}
                                                hubChannel={this.props.hubChannel}
                                                scene={this.props.scene}
                        />)}
                    </>
                  )
                }
              />
            )}
          </div>
        </ReactAudioContext.Provider>
      </MoreMenuContextProvider>
    );
  }
}

function usePeopleList(presences, mySessionId) {
  if (!presences || !mySessionId) {
    return [];
  }
  let people;

  const micPresences = getMicrophonePresences();

  if (!micPresences) {
    return [];
  }

  people = Object.entries(presences).map(([id, presence]) => {
    return userFromPresence(id, presence, micPresences, mySessionId);
  });

  people = people.filter(value => {
    return presences[value.id];
  });
  return people;
}

function getUrl(avatarGlb) {
  return new Promise(function(resolve) {
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
      str = str.replace("{\"renders\":[", "");
      str = str.replace("]}", "");
      resolve(str);
    };
  });
}

async function getUserProfile(store) {
  const mail = store.state.credentials.email;
  return axios.get(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/dbapi/get/user/" + mail).then(resp => {
    let data = resp.data;
    if(data) {
      //this.setState({displayName:data.displayName});
      //this.setState({jobTitle:data.jobTitle});
      //this.setState({companyName:data.companyName});
      //this.setState({phoneNumber:data.phoneNumber});
      store.update({
        profile: {
          displayName: data.displayName,
          //avatarId: this.state.avatarId,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          email: store.state.credentials.email,
          phoneNumber: data.phoneNumber
        }
      });
    }
  }).catch(reason => {
    console.error(reason);
  });
}


export function getAvatarPreview() {
  return ImageList;
}

export function getProfileList() {
  return profileList;
}

/*
export async function getAllUsersMail(presences,sessionId)
{
  if(presences!=null && sessionId!=null)
  {
    const people=usePeopleList(presences,sessionId);
    people.map((person)=>{
      if(person.profile.email!=null)
      {
        const email=person.profile.email;
        const userId=person.id;
        getUserProfile(email,userId);
      }
    });
  }

  
}
export async function  getUserProfile(mail,userId) {
  try {
      const resp = await axios.get("http://127.0.0.1:8086/get/user/" + mail);
      let data = resp.data;
      const profile={
        email :mail,
        displayName :data.displayName,
        jobTitle:data.jobTitle,
        companyName:data.companyName,
        phoneNumber:data.phoneNumber,
        userId:userId
        
      }
      profileList.push(profile);
     
  } catch (reason) {
      console.error(reason);
  }
}
*/
function UIRootHooksWrapper(props) {
  useAccessibleOutlineStyle();
  const breakpoint = useCssBreakpoints();
  useEffect(() => {
    const el = document.getElementById("preload-overlay");
    el.classList.add("loaded");

    const sceneEl = props.scene;

    sceneEl.classList.add(roomLayoutStyles.scene);

    // Remove the preload overlay after the animation has finished.
    const timeout = setTimeout(() => {
      el.remove();
    }, 500);

    return () => {
      clearTimeout(timeout);
      sceneEl.classList.remove(roomLayoutStyles.scene);
    };
  }, [props.scene]);
  let people = usePeopleList(props.presences, props.sessionId);
  return (
    <ChatContextProvider
      messageDispatch={props.messageDispatch}
      presences={props.presences}
      sessionId={props.sessionId}
      people={people}
    >
      <ObjectListProvider scene={props.scene}>
        <UIRoot breakpoint={breakpoint} {...props} />
        <AptRoot/>
      </ObjectListProvider>
    </ChatContextProvider>
  );
}

UIRootHooksWrapper.propTypes = {
  scene: PropTypes.object.isRequired,
  messageDispatch: PropTypes.object,
  store: PropTypes.object.isRequired,
  presences: PropTypes.object,
  sessionId: PropTypes.string
};

export default UIRootHooksWrapper;
