export function completeEntry(entry: any, is360: any, selectAction: any): any;
export function createAvatarCustomTileV2(onclick: any): JSX.Element;
export const WEB_BROWSER_URL_MODE: "web-browser";
export class MediaTilesLib {
    sessionCache: {};
    displayWebBrowserTile: boolean;
    setPropsAndState(parent: any, props: any, state: any): void;
    parent: any;
    props: any;
    state: any;
    handleEntryClicked: any;
    getTileDimensions(isImage: any, isAvatar: any, imageAspect: any): number[];
    createStreamTile(): JSX.Element;
    createStandardTile(clickAction: any, imgSrc: any, title: any): JSX.Element;
    createShareScreenTile(): JSX.Element;
    createWebcamTile(device: any): JSX.Element;
    createWebBrowserTile(): JSX.Element;
    createWebcamTiles(): JSX.Element[];
    showEmptyStringOnNoResult(): boolean;
    createAdditionalTiles(): JSX.Element;
}
export function mlHandleEntryClicked(evt: any, entry: any, parent: any): void;
