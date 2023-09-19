import {
    createWorld,
    getGlobalStorageValue,
    GLOBAL_WORLDS_ENTITY,
    WorldEntity
} from "@aptero/axolotis-player";
import {register as registerBasic} from "./modules/basic";

export async function initAxolotisPlayer() {
    const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
    if ((worlds && worlds.length > 0)) {
        throw new Error("Axolotis World already initialized");
    }
    await createWorld();
    registerBasic();
    console.log("Axolotis player : loaded");
}