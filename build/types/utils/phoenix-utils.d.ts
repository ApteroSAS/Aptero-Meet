export function hasReticulumServer(): boolean;
export function isLocalClient(): boolean;
export function hubUrl(hubId: any, extraParams: any, slug: any): URL;
export function getReticulumFetchUrl(path: any, absolute?: boolean, host?: any, port?: any): any;
export function getReticulumMeta(): Promise<any>;
export function getDirectReticulumFetchUrl(path: any, absolute?: boolean): any;
export function invalidateReticulumMeta(): Promise<void>;
export function connectToReticulum(debug?: boolean, params?: any, socketClass?: any): Promise<any>;
export function getLandingPageForPhoto(photoUrl: any): any;
export function fetchReticulumAuthenticated(url: any, method: string, payload: any): Promise<any>;
export function createAndRedirectToNewHub(name: any, sceneId: any, replace: any): Promise<void>;
export function getPresenceEntryForSession(presences: any, sessionId: any): any;
export function getPresenceContextForSession(presences: any, sessionId: any): any;
export function getPresenceProfileForSession(presences: any, sessionId: any): any;
export function migrateChannelToSocket(oldChannel: any, socket: any, params: any): Promise<any>;
export function migrateToChannel(oldChannel: any, newChannel: any): Promise<any>;
export function discordBridgesForPresences(presences: any): any[];
export function hasEmbedPresences(presences: any): boolean;
export function denoisePresence({ onJoin, onLeave, onChange }: {
    onJoin: any;
    onLeave: any;
    onChange: any;
}): {
    rawOnJoin: (key: any, beforeJoin: any, afterJoin: any) => void;
    rawOnLeave: (key: any, remaining: any, removed: any) => void;
};
export function presenceEventsForHub(events: any): {
    onJoin: (key: any, meta: any) => void;
    onLeave: (key: any, meta: any) => void;
    onChange: (key: any, previous: any, current: any) => void;
};
export function tryGetMatchingMeta({ ret_pool, ret_version }: {
    ret_pool: any;
    ret_version: any;
}, shouldAbandonMigration: any): Promise<boolean>;
