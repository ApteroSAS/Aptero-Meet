export const defaultMaterialQualitySetting: string;
export namespace SCHEMA {
    export const id: string;
    export namespace definitions {
        namespace profile {
            const type: string;
            const additionalProperties: boolean;
            namespace properties {
                namespace displayName {
                    const type_1: string;
                    export { type_1 as type };
                    export const pattern: string;
                }
                namespace avatarId {
                    const type_2: string;
                    export { type_2 as type };
                }
                namespace companyName {
                    const type_3: string;
                    export { type_3 as type };
                }
                namespace jobTitleName {
                    const type_4: string;
                    export { type_4 as type };
                }
                namespace phoneNumber {
                    const type_5: string;
                    export { type_5 as type };
                }
                namespace description {
                    const type_6: string;
                    export { type_6 as type };
                }
                namespace profilePicture {
                    const type_7: string;
                    export { type_7 as type };
                }
                namespace microsoftUserprofilePicture {
                    const type_8: string;
                    export { type_8 as type };
                }
                namespace microsoftUser {
                    const type_9: string;
                    export { type_9 as type };
                }
                namespace personalAvatarId {
                    const type_10: string;
                    export { type_10 as type };
                }
            }
        }
        namespace credentials {
            const type_11: string;
            export { type_11 as type };
            const additionalProperties_1: boolean;
            export { additionalProperties_1 as additionalProperties };
            export namespace properties_1 {
                namespace token {
                    const type_12: string[];
                    export { type_12 as type };
                }
                namespace email {
                    const type_13: string[];
                    export { type_13 as type };
                }
            }
            export { properties_1 as properties };
        }
        namespace activity {
            const type_14: string;
            export { type_14 as type };
            const additionalProperties_2: boolean;
            export { additionalProperties_2 as additionalProperties };
            export namespace properties_2 {
                namespace hasFoundFreeze {
                    const type_15: string;
                    export { type_15 as type };
                }
                namespace hasChangedName {
                    const type_16: string;
                    export { type_16 as type };
                }
                namespace hasAcceptedProfile {
                    const type_17: string;
                    export { type_17 as type };
                }
                namespace hasChangedPicture {
                    const type_18: string;
                    export { type_18 as type };
                }
                namespace hasChangedAvatar {
                    const type_19: string;
                    export { type_19 as type };
                }
                namespace lastEnteredAt {
                    const type_20: string;
                    export { type_20 as type };
                }
                namespace hasPinned {
                    const type_21: string;
                    export { type_21 as type };
                }
                namespace hasRotated {
                    const type_22: string;
                    export { type_22 as type };
                }
                namespace hasRecentered {
                    const type_23: string;
                    export { type_23 as type };
                }
                namespace hasScaled {
                    const type_24: string;
                    export { type_24 as type };
                }
                namespace hasHoveredInWorldHud {
                    const type_25: string;
                    export { type_25 as type };
                }
                namespace hasOpenedShare {
                    const type_26: string;
                    export { type_26 as type };
                }
                namespace entryCount {
                    const type_27: string;
                    export { type_27 as type };
                }
            }
            export { properties_2 as properties };
        }
        namespace settings {
            const type_28: string;
            export { type_28 as type };
            const additionalProperties_3: boolean;
            export { additionalProperties_3 as additionalProperties };
            export namespace properties_3 {
                namespace lastUsedMicDeviceId {
                    const type_29: string;
                    export { type_29 as type };
                }
                namespace micMuted {
                    const type_30: string;
                    export { type_30 as type };
                }
            }
            export { properties_3 as properties };
        }
        namespace preferences {
            const type_31: string;
            export { type_31 as type };
            const additionalProperties_4: boolean;
            export { additionalProperties_4 as additionalProperties };
            export namespace properties_4 {
                namespace shouldPromptForRefresh {
                    const type_32: string;
                    export { type_32 as type };
                }
                namespace preferredMic {
                    const type_33: string;
                    export { type_33 as type };
                }
                namespace preferredCamera {
                    const type_34: string;
                    export { type_34 as type };
                }
                namespace muteMicOnEntry {
                    const type_35: string;
                    export { type_35 as type };
                }
                namespace audioOutputMode {
                    const type_36: string;
                    export { type_36 as type };
                }
                namespace audioNormalization {
                    const type_37: string;
                    export { type_37 as type };
                }
                namespace invertTouchscreenCameraMove {
                    const type_38: string;
                    export { type_38 as type };
                }
                namespace enableOnScreenJoystickLeft {
                    const type_39: string;
                    export { type_39 as type };
                }
                namespace enableOnScreenJoystickRight {
                    const type_40: string;
                    export { type_40 as type };
                }
                namespace enableGyro {
                    const type_41: string;
                    export { type_41 as type };
                }
                namespace onlyShowNametagsInFreeze {
                    const type_42: string;
                    export { type_42 as type };
                }
                namespace animateWaypointTransitions {
                    const type_43: string;
                    export { type_43 as type };
                }
                namespace showFPSCounter {
                    const type_44: string;
                    export { type_44 as type };
                }
                namespace allowMultipleHubsInstances {
                    const type_45: string;
                    export { type_45 as type };
                }
                namespace disableIdleDetection {
                    const type_46: string;
                    export { type_46 as type };
                }
                namespace fastRoomSwitching {
                    const type_47: string;
                    export { type_47 as type };
                }
                namespace preferMobileObjectInfoPanel {
                    const type_48: string;
                    export { type_48 as type };
                }
                namespace maxResolutionWidth {
                    const type_49: string;
                    export { type_49 as type };
                }
                namespace maxResolutionHeight {
                    const type_50: string;
                    export { type_50 as type };
                }
                namespace globalVoiceVolume {
                    const type_51: string;
                    export { type_51 as type };
                }
                namespace globalMediaVolume {
                    const type_52: string;
                    export { type_52 as type };
                }
                namespace snapRotationDegrees {
                    const type_53: string;
                    export { type_53 as type };
                }
                namespace materialQualitySetting {
                    const type_54: string;
                    export { type_54 as type };
                }
                namespace enableDynamicShadows {
                    const type_55: string;
                    export { type_55 as type };
                }
                namespace disableSoundEffects {
                    const type_56: string;
                    export { type_56 as type };
                }
                namespace disableMovement {
                    const type_57: string;
                    export { type_57 as type };
                }
                namespace disableBackwardsMovement {
                    const type_58: string;
                    export { type_58 as type };
                }
                namespace disableStrafing {
                    const type_59: string;
                    export { type_59 as type };
                }
                namespace disableTeleporter {
                    const type_60: string;
                    export { type_60 as type };
                }
                namespace disableAutoPixelRatio {
                    const type_61: string;
                    export { type_61 as type };
                }
                namespace movementSpeedModifier {
                    const type_62: string;
                    export { type_62 as type };
                }
                namespace disableEchoCancellation {
                    const type_63: string;
                    export { type_63 as type };
                }
                namespace disableNoiseSuppression {
                    const type_64: string;
                    export { type_64 as type };
                }
                namespace disableAutoGainControl {
                    const type_65: string;
                    export { type_65 as type };
                }
                namespace locale {
                    const type_66: string;
                    export { type_66 as type };
                }
                namespace showRtcDebugPanel {
                    const type_67: string;
                    export { type_67 as type };
                }
                namespace showAudioDebugPanel {
                    const type_68: string;
                    export { type_68 as type };
                }
                namespace enableAudioClipping {
                    const type_69: string;
                    export { type_69 as type };
                }
                namespace audioClippingThreshold {
                    const type_70: string;
                    export { type_70 as type };
                }
                namespace theme {
                    const type_71: string;
                    export { type_71 as type };
                }
                namespace thirdPersonMode {
                    const type_72: string;
                    export { type_72 as type };
                }
            }
            export { properties_4 as properties };
        }
        namespace confirmedDiscordRooms {
            const type_73: string;
            export { type_73 as type };
            export namespace items {
                const type_74: string;
                export { type_74 as type };
            }
        }
        namespace confirmedBroadcastedRooms {
            const type_75: string;
            export { type_75 as type };
            export namespace items_1 {
                const type_76: string;
                export { type_76 as type };
            }
            export { items_1 as items };
        }
        namespace uploadPromotionTokens {
            const type_77: string;
            export { type_77 as type };
            export namespace items_2 {
                const type_78: string;
                export { type_78 as type };
                const additionalProperties_5: boolean;
                export { additionalProperties_5 as additionalProperties };
                export namespace properties_5 {
                    namespace fileId {
                        const type_79: string;
                        export { type_79 as type };
                    }
                    namespace promotionToken {
                        const type_80: string;
                        export { type_80 as type };
                    }
                }
                export { properties_5 as properties };
            }
            export { items_2 as items };
        }
        namespace creatorAssignmentTokens {
            const type_81: string;
            export { type_81 as type };
            export namespace items_3 {
                const type_82: string;
                export { type_82 as type };
                const additionalProperties_6: boolean;
                export { additionalProperties_6 as additionalProperties };
                export namespace properties_6 {
                    namespace hubId {
                        const type_83: string;
                        export { type_83 as type };
                    }
                    namespace creatorAssignmentToken {
                        const type_84: string;
                        export { type_84 as type };
                    }
                }
                export { properties_6 as properties };
            }
            export { items_3 as items };
        }
        namespace embedTokens {
            const type_85: string;
            export { type_85 as type };
            export namespace items_4 {
                const type_86: string;
                export { type_86 as type };
                const additionalProperties_7: boolean;
                export { additionalProperties_7 as additionalProperties };
                export namespace properties_7 {
                    export namespace hubId_1 {
                        const type_87: string;
                        export { type_87 as type };
                    }
                    export { hubId_1 as hubId };
                    export namespace embedToken {
                        const type_88: string;
                        export { type_88 as type };
                    }
                }
                export { properties_7 as properties };
            }
            export { items_4 as items };
        }
        namespace onLoadActions {
            const type_89: string;
            export { type_89 as type };
            export namespace items_5 {
                const type_90: string;
                export { type_90 as type };
                const additionalProperties_8: boolean;
                export { additionalProperties_8 as additionalProperties };
                export namespace properties_8 {
                    namespace action {
                        const type_91: string;
                        export { type_91 as type };
                    }
                    namespace args {
                        const type_92: string;
                        export { type_92 as type };
                    }
                }
                export { properties_8 as properties };
            }
            export { items_5 as items };
        }
    }
    const type_93: string;
    export { type_93 as type };
    export namespace properties_9 {
        export namespace profile_1 {
            const $ref: string;
        }
        export { profile_1 as profile };
        export namespace credentials_1 {
            const $ref_1: string;
            export { $ref_1 as $ref };
        }
        export { credentials_1 as credentials };
        export namespace activity_1 {
            const $ref_2: string;
            export { $ref_2 as $ref };
        }
        export { activity_1 as activity };
        export namespace settings_1 {
            const $ref_3: string;
            export { $ref_3 as $ref };
        }
        export { settings_1 as settings };
        export namespace preferences_1 {
            const $ref_4: string;
            export { $ref_4 as $ref };
        }
        export { preferences_1 as preferences };
        export namespace confirmedDiscordRooms_1 {
            const $ref_5: string;
            export { $ref_5 as $ref };
        }
        export { confirmedDiscordRooms_1 as confirmedDiscordRooms };
        export namespace confirmedBroadcastedRooms_1 {
            const $ref_6: string;
            export { $ref_6 as $ref };
        }
        export { confirmedBroadcastedRooms_1 as confirmedBroadcastedRooms };
        export namespace uploadPromotionTokens_1 {
            const $ref_7: string;
            export { $ref_7 as $ref };
        }
        export { uploadPromotionTokens_1 as uploadPromotionTokens };
        export namespace creatorAssignmentTokens_1 {
            const $ref_8: string;
            export { $ref_8 as $ref };
        }
        export { creatorAssignmentTokens_1 as creatorAssignmentTokens };
        export namespace embedTokens_1 {
            const $ref_9: string;
            export { $ref_9 as $ref };
        }
        export { embedTokens_1 as embedTokens };
        export namespace onLoadActions_1 {
            const $ref_10: string;
            export { $ref_10 as $ref };
        }
        export { onLoadActions_1 as onLoadActions };
    }
    export { properties_9 as properties };
    const additionalProperties_9: boolean;
    export { additionalProperties_9 as additionalProperties };
}
export default class Store {
    _shouldResetAvatarOnInit: boolean;
    _signOutOnExpiredAuthToken: () => void;
    initProfile: () => Promise<void>;
    resetToRandomDefaultAvatar: () => Promise<void>;
    get state(): any;
    get credentialsAccountId(): any;
    resetConfirmedBroadcastedRooms(): void;
    resetTipActivityFlags(): void;
    bumpEntryCount(): void;
    enqueueOnLoadAction(action: any, args: any): void;
    executeOnLoadActions(sceneEl: any): void;
    clearOnLoadActions(): void;
    clearStoredArray(key: any): void;
    update(newState: any, mergeOpts: any): any;
    get materialQualitySetting(): any;
    [STORE_STATE_CACHE_KEY]: any;
}
declare const STORE_STATE_CACHE_KEY: unique symbol;
export {};
