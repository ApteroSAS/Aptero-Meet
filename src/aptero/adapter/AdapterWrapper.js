import EventEmitter from "eventemitter3";
import { adapterFactory } from "./adapter-config";

export class AdapterWarpper {
  lasyLoadingFinished = false;
  tmplisteners = {};

   constructor() {
     this.tmpEventEmiter = new EventEmitter();
     this.on = (event, fn)=>{
       if(!this.tmplisteners[event]){
         this.tmplisteners[event] = [];
       }
       this.tmplisteners[event].push({fn});
     };
     this.internalInit();
   }

   async internalInit(){
     let adapter = await adapterFactory();

     //events emitter
     delete this["on"];
     Object.keys(this.tmplisteners).forEach((event)=>{
       const listeners = this.tmplisteners[event];
       if(listeners) {
         listeners.forEach(entry => {
           adapter.on(event, entry.fn)
         })
       }
     });

     //variables
     Object.keys(adapter).forEach(key => {
       this[key] = adapter[key];
     })

     //function
     this.__proto__ = adapter.__proto__;

     this.lasyLoadingFinished=true;
   }

}
