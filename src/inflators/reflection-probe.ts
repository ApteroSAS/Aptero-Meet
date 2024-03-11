import { addComponent } from "bitecs";
import {Box3, Box3Helper, Color, EquirectangularReflectionMapping, Texture, Vector3} from "three";
import * as THREE from "three";
import { HubsWorld } from "../app";
import { ReflectionProbe } from "../bit-components";
import { addObject3DComponent } from "../utils/jsx-entity";

export interface ReflectionProbeParams {
  size: number;
  envMapTexture?: Texture;
}

const DEFAULTS = {
  size: 1,
  envMapTexture: null
};

export function inflateReflectionProbe(world: HubsWorld, eid: number, componentProps: ReflectionProbeParams) {
  const { envMapTexture, size } = Object.assign({}, DEFAULTS, componentProps) as ReflectionProbeParams;
  envMapTexture!.flipY = true;
  envMapTexture!.mapping = EquirectangularReflectionMapping;
  const box = new Box3().setFromCenterAndSize(new Vector3(), new Vector3().setScalar(size * 2));

  addComponent(world, ReflectionProbe, eid);
  // TODO: Add ReflectionProbe to js type defs
  const probe = new (THREE as any).ReflectionProbe(box, envMapTexture);
  addObject3DComponent(world, eid, probe);

  if (AFRAME.scenes[0].systems["hubs-systems"].environmentSystem.debugMode) {
    const debugBox = new Box3().setFromCenterAndSize(
      new Vector3(),
      new Vector3().setScalar(size * 2)
    );
    probe.add(new Box3Helper(debugBox, new Color(Math.random(), Math.random(), Math.random())));
  }
}
