import React, { Component } from "react";
import cloneObject3D from "../util/cloneObject3D";
import { calculateGLTFPerformanceScores } from "../util/performance";
import { GLTFExporter } from "../gltf/GLTFExporter";

export default class GaugeModal extends Component {

    state = {
        visible : false,
    };
    async scanForPerf(){
        let scene, glbBlob, chunks;
        scene = this.sceneEl.object3D;
        const clonedScene = cloneObject3D(scene, true);
        console.log(clonedScene);
        const exporter = new GLTFExporter({
            mode: "glb",
            onlyVisible: false,
            includeCustomExtensions: true,
          });
        chunks = await exporter.exportChunks(clonedScene);
        glbBlob = await exporter.exportGLBBlob(chunks);

         
        scores = calculateGLTFPerformanceScores(scene, glbBlob, chunks);
        console.log(scores);
       /* 
        if(false)//si les perfs doivent etre affichées
        {
            this.state.visible = true;
        }
        else {
            this.state.visible = false;
        }/**/ 

    };

    componentDidMount() {
        this.sceneEl = AFRAME.scenes[0];
        this.sceneEl.addEventListener("object_spawned", this.scanForPerf);
    }
    render() {
       return null
    }
}