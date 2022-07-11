import {
  createWorld,
  getGlobalStorageValue,
  GLOBAL_WORLDS_ENTITY,
  WorldEntity
} from "@aptero/axolotis-player";

export async function initAxolotisPlayer(){
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if ((worlds && worlds.length > 0)) {
    throw new Error("Axolotis World already initialized");
  }
  await createWorld();
  {
    const { register } = await import("@aptero/axolotis-module-teams");
    register();
  }
  {
    const { register } = await import("@aptero/axolotis-module-basic");
    register();
  }
  console.log("Axolotis player : loaded");
}