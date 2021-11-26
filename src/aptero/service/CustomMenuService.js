import { roomParameters } from "./RoomParameters";


export class CustomMenuService{
  getButtonTitle(){
    return roomParameters.roomConfig.customButton && roomParameters.roomConfig.customButton?.title;
  }

  getIframeContentURL(){
    return roomParameters.roomConfig.customButton?.iframeUrl;
  }

  isActivated(){
    return roomParameters.roomConfig && roomParameters.roomConfig?.customButton;
  }
}

export const customMenuService = new CustomMenuService();