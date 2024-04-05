/**
 * Should only import type to stay lightweight
 */
import {
  PhoenixAuthService, PHX_AUTH_SERVICE, ROOM_SERVICE,
  RoomService,
  Store, STORE_SERVICE
} from "@aptero/axolotis-module-basic";
import {container} from "../../IOCConfig";
import type {MsTeamsAPILight,MsTeamsAPI} from "@aptero/axolotis-module-teams";
import {MICROSOFT_SERVICE, MICROSOFT_STATIC_SERVICE} from "@aptero/axolotis-module-teams";

export async function roomService(): Promise<RoomService> {
  return container.getAsync<RoomService>(ROOM_SERVICE);
}

/* needs preload before usage */
export function roomServiceSync(): RoomService {
  return container.get<RoomService>(ROOM_SERVICE);
}

export async function phoenixAuth(): Promise<PhoenixAuthService> {
  return container.getAsync<PhoenixAuthService>(PHX_AUTH_SERVICE);
}

export async function store(): Promise<Store> {
  return container.getAsync<Store>(STORE_SERVICE);
}

//msTeamsAPILight
export function msTeamsAPILight(): MsTeamsAPILight {
  return container.get<MsTeamsAPILight>(MICROSOFT_STATIC_SERVICE);
}

//msTeamsAPI
export async function msTeamsAPI(): Promise<MsTeamsAPI> {
  return container.getAsync<MsTeamsAPI>(MICROSOFT_SERVICE);
}
