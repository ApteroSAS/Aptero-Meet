import React, { Component } from "react";



export default class GaugeModal extends Component {

    state = {
        visible : false,
    };

    scanForPerf(){
        console.log("object spawned");
        /*
        if(false)//si les perfs doivent etre affichées
        {
            this.state.visible = true;
        }
        else {
            this.state.visible = false;
        }*/

    };

    componentDidMount() {
        const scene = document.querySelector("a-scene");
        scene.addEventListener("object_spawned", scanForPerf);
    }
    render() {
       return null
    }
}