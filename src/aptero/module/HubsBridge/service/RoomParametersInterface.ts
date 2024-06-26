interface Preferences {
  preferredMic: string;
  preferredSpeakers: string;
  theme: string;
  shouldPromptForRefresh: boolean;
  preferredCamera: string;
  muteMicOnEntry: boolean;
  disableLeftRightPanning: boolean;
  audioNormalization: number;
  invertTouchscreenCameraMove: boolean;
  enableOnScreenJoystickLeft: boolean;
  enableOnScreenJoystickRight: boolean;
  enableGyro: boolean;
  animateWaypointTransitions: boolean;
  showFPSCounter: boolean;
  allowMultipleHubsInstances: boolean;
  disableIdleDetection: boolean;
  fastRoomSwitching: boolean;
  lazyLoadSceneMedia: boolean;
  preferMobileObjectInfoPanel: boolean;
  globalVoiceVolume: number;
  globalMediaVolume: number;
  globalSFXVolume: number;
  snapRotationDegrees: number;
  materialQualitySetting: string;
  enableDynamicShadows: boolean;
  disableSoundEffects: boolean;
  disableMovement: boolean;
  disableBackwardsMovement: boolean;
  disableStrafing: boolean;
  disableTeleporter: boolean;
  disableAutoPixelRatio: boolean;
  movementSpeedModifier: number;
  locale: string;
  showRtcDebugPanel: boolean;
  showAudioDebugPanel: boolean;
  enableAudioClipping: boolean;
  audioClippingThreshold: number;
  audioPanningQuality: string;
  cursorSize: number;
  nametagVisibility: string;
  nametagVisibilityDistance: number;
  enablePostEffects: boolean;
  enableBloom: boolean;
  aaMode: string;
}

interface AppConfig {
  MICROSOFT_APP_ID: string;
  MICROSOFT_APP_AUTHORITY: string;
  GLOBAL_ASSETS_PATH: string;
  LOGGER: LoggerConfig;
  adapterParams: AdapterParams;
  features: FeaturesConfig;
  links: LinksConfig;
  theme: ThemeConfig;
  defaultTheme?: string;
}

interface LoggerConfig {
  URL: string;
  ACTIVATED: boolean;
  ORIGIN: string;
}

interface AdapterParams {
  adapter: string; // Possible values: 'dialog', 'dialog-io', 'janus', 'twilio', 'agora', 'none'
}

interface FeaturesConfig {
  teams_limited: boolean;
  fast_room_switching: boolean;
  hide_powered_by: boolean;
  show_feedback_ui: boolean;
  disable_room_creation: boolean;
}

interface LinksConfig {
  privacy_notice: string;
  terms_of_use: string;
}

interface ThemeConfig {
  "dark-theme": boolean;
  "action-color": string;
  "action-color-highlight": string;
  "action-text-color": string;
  "action-subtitle-color": string;
  "action-label-color": string;
  "notice-background-color": string;
  "notice-text-color": string;
  "notice-widget-color": string;
  "favorited-color": string;
}

export interface RoomParametersData {
  preferences?: Preferences;
  preferencesOverride?: Partial<Preferences>;
  permission?: Permissions;
  entryMode?: string;
  AppConfigOverride?: Partial<AppConfig>;
  customButton?: {
    iframeUrl?: string;
    title?: string;
  },
}

export interface Permission {
  hub_id: string;
  change_screen: boolean;
  show_spawn_and_move_media: boolean;
  share_screen: boolean;
  spawn_and_move_media: boolean;
  spawn_camera: boolean;
  pin_objects: boolean;
  change_video: boolean;
}

export interface AudioSettings {
  avatarDistanceModel: string;
  avatarRolloffFactor: number;
  avatarRefDistance: number;
  avatarMaxDistance: number;
}