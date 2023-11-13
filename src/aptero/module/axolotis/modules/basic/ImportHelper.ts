/**
 * Should only import type to stay lightweight
 */
import {
  COOKIE_STORE_SERVICE,
  CookieStore, NAME_SERVICE,
  NameGenerationService,
  PhoenixAuthService, PHX_AUTH_SERVICE,
  Properties,
  PROPERTIES_SERVICE, ROOM_SERVICE,
  RoomService,
  Store, STORE_SERVICE
} from "@aptero/axolotis-module-basic";
import {container} from "../../IOCConfig";
import type {MsTeamsAPILight} from "@aptero/axolotis-module-teams";
import type {MsTeamsAPI} from "@aptero/axolotis-module-teams";
import {MICROSOFT_SERVICE, MICROSOFT_STATIC_SERVICE} from "@aptero/axolotis-module-teams";

export async function propertyService(): Promise<Properties> {
  return container.getAsync<Properties>(PROPERTIES_SERVICE);
}

export async function roomService(): Promise<RoomService> {
  return container.getAsync<RoomService>(ROOM_SERVICE);
}

/* needs preload before usage */
export function roomServiceSync(): RoomService {
  return container.get<RoomService>(ROOM_SERVICE);
}

export async function nameGenerationService(): Promise<NameGenerationService> {
  return container.getAsync<NameGenerationService>(NAME_SERVICE);
}

export async function phoenixAuth(): Promise<PhoenixAuthService> {
  return container.getAsync<PhoenixAuthService>(PHX_AUTH_SERVICE);
}

export async function cookiesStore(): Promise<CookieStore> {
  return container.getAsync<CookieStore>(COOKIE_STORE_SERVICE);
}

export async function store(): Promise<Store> {
  return container.getAsync<Store>(STORE_SERVICE);
}

//msTeamsAPILight
export function msTeamsAPILight(): MsTeamsAPILight {
  return container.get<MsTeamsAPILight>(MICROSOFT_STATIC_SERVICE);
}

//Helps to transition to 100% async
export function msTeamsAPILightAsync(): Promise<MsTeamsAPILight> {
  return container.getAsync<MsTeamsAPILight>(MICROSOFT_STATIC_SERVICE);
}

//msTeamsAPI
export async function msTeamsAPI(): Promise<MsTeamsAPI> {
  return container.getAsync<MsTeamsAPI>(MICROSOFT_SERVICE);
}
