import EventEmitter from "eventemitter3";
import { adapterFactory } from "./adapter-config";

export class AdapterWarpper {
  lasyLoadingFinished = false;

   constructor() {
     this.tmpEventEmiter = new EventEmitter();
     this.on = (event, fn, context)=>{this.tmpEventEmiter.on(event, fn, context)};
     this.internalInit();
   }

   async internalInit(){
     let adapter = await adapterFactory();

     //events emitter
     Object.keys(this.tmpEventEmiter._events).forEach((event)=>{
       this.tmpEventEmiter._events[event].forEach(entry =>{
         adapter.on(event,entry.fn)
       })
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