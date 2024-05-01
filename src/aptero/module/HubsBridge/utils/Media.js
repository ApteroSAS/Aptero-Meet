import { addMedia } from "../../../../utils/media-utils";

export async function pinEntity(entity) {
  return NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
    entity = networkedEl;
    if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) {
      return entity;
    } else {
      //Pin the new object by default
      entity.setAttribute("pinnable", "pinned", true);
      entity.emit("pinned", { el: entity });
      return entity;
    }
  });
}

export async function unpinEntity(entity) {
  return NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
    entity = networkedEl;
    if (!NAF.utils.isMine(entity) && !NAF.utils.takeOwnership(entity)) {
      return entity;
    } else {
      //Pin the new object by default
      entity.setAttribute("pinnable", "pinned", false);
      entity.emit("unpinned", { el: entity });
      return entity;
    }
  });
}

export function spawnMedia(src, contentOrigin, data) {
  const { entity, orientation } = addMedia(
    src,
    "#interactable-media",
    contentOrigin,
    data && data.type && data.type.includes("360") ? "360-equirectangular" : null,
    !(src instanceof MediaStream),
    true,
    true,
    data ? data : {}
  );
  return  { entity, orientation };
}

export function spawnMediaInfrontOfPlayer(src, contentOrigin, data) {
  const offset = { x: 0, y: 0, z: -1.5 };
  const { entity, orientation } = spawnMedia(src, contentOrigin, data);
  orientation.then(or => {
    entity.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset,
      orientation: or
    });
  });
  return {entity, orientation};
}
