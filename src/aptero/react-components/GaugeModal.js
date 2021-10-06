import React, { Component } from "react";
import cloneObject3D from "../util/cloneObject3D";
import {
  calculateGLTFPerformanceScores,
  calculateUncompressedMipmapedTextureSize,
  isLargeImage
} from "../util/performance";
import EventEmitter from "eventemitter3";
import { GLTFExporter } from "../gltf/GLTFExporter";
import MessageDispatch from "../../message-dispatch";

function calculateImageVRAM(image) {
  if (!image) {
    return 0;
  }
  return calculateUncompressedMipmapedTextureSize(image.width, image.height);
}

function recursiveCountLight(node) {
  let count = 0;
  if (node.type.includes("Light")) {
    count++;
    //console.log(node);
  }

  if (node.children) {
    node.children.forEach(element => {
      count += recursiveCountLight(element);
    });
  }
  return count;
}

function calcPerformance(sceneEl) {
  let polygons = null,
    polygonsScore = null,
    totalVRAM = 0,
    texturesScore = null,
    largeTextures = 0,
    largeTexturesScore = null,
    lights = null,
    lightsScore = null,
    uniqueMaterials = null,
    materialsScore = null,
    fileSize = null,
    fileSizeScore = null,
    clonedscene = null;

  const jsonscene = sceneEl.object3D.toJSON();

  /*console.dir(sceneEl.object3D);
  console.dir(sceneEl);
  console.dir(jsonscene);
  console.dir(sceneEl.renderer.info);
  console.dir(sceneEl.renderer.state);
*/

  clonedscene = cloneObject3D(sceneEl.object3D, true);
  //console.log(clonedscene);

  // Calculate Scores

  // let polygonsScore
  polygons = sceneEl.renderer.info.render.triangles;

  if (polygons <= 50000) {
    polygonsScore = "Low";
  } else if (polygons <= 75000) {
    polygonsScore = "Medium";
  } else {
    polygonsScore = "High";
  }

  // let lightsScore;
  lights = recursiveCountLight(jsonscene.object);

  if (lights <= 3) {
    lightsScore = "Low";
  } else if (lights <= 6) {
    lightsScore = "Medium";
  } else {
    lightsScore = "High";
  }

  // let texturesScore;

  let image = new Image();
  jsonscene.images.forEach(element => {
    image.src = element.url;
    totalVRAM += calculateImageVRAM(image);
    if (isLargeImage(image.width, image.height)) largeTextures++;
  });

  if (totalVRAM <= 268435500) {
    texturesScore = "Low";
  } else if (totalVRAM <= 536870900) {
    texturesScore = "Medium";
  } else {
    texturesScore = "High";
  }
  largeTexturesScore = largeTextures > 0 ? "High" : "Low";

  // let materialsScore;

  let matlist = new Array();
  jsonscene.materials.forEach(element => {
    if (matlist.indexOf(element.uuid) == -1) matlist.push(element.uuid);
  });
  uniqueMaterials = matlist.length;

  if (uniqueMaterials <= 25) {
    materialsScore = "Low";
  } else if (uniqueMaterials <= 50) {
    materialsScore = "Medium";
  } else {
    materialsScore = "High";
  }

  // let fileSizeScore; !!!!!!!!!!!!!!!!!!!
  /*
  if (fileSize < 16777220) {
    fileSizeScore = "Low";
  } else if (fileSize < 52428800) {
    fileSizeScore = "Medium";
  } else {
    fileSizeScore = "High";
  }
*/
  return {
    polygons: {
      value: polygons,
      score: polygonsScore
    },
    textures: {
      value: totalVRAM,
      score: texturesScore,
      largeTexturesValue: largeTextures,
      largeTexturesScore
    },
    lights: {
      value: lights,
      score: lightsScore
    },
    materials: {
      value: uniqueMaterials,
      score: materialsScore
    }
    /*
    ,
    fileSize: {
      value: fileSize,
      score: fileSizeScore
    }
    */
  };
}

export default class GaugeModal extends Component {
  em = new EventEmitter();
  state = {
    visible: false
  };
  async scanForPerf(e) {
    //console.log(e);

    const performance = calcPerformance(this.sceneEl);
/*
    console.log(APP);
    console.dir(this);
    console.log(APP.messageDispatch);
    console.dir(e.target);*/
    APP.messageDispatch.receive({type:"performance_impact_detected"});

    /*

    audio_sub_room_changed

    await phxChannel.push("message", {body: room.preferencesOverride, type: "chat_events:sound_db_updated"});
    await phxChannel.push("message", {body: "Sound Preferences Updated", type: "chat"});

    */
  }

  componentDidMount() {
    this.sceneEl = AFRAME.scenes[0];
    this.sceneEl.addEventListener("object_spawned", this.scanForPerf);
  }
  render() {
    return null;
  }
}
