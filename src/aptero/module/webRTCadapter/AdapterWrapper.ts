import EventEmitter from "eventemitter3";
import { adapterFactory } from "./adapter-config";
import { wait } from "../../util/AsyncWaiter";
import { roomParameters } from "../HubsBridge/service/RoomParameters";
import {Adapter} from "./AdapterI";

declare const AFRAME;

/**
 * Adapter loading will be async so this clas will be used to wrap the adapter waiting for it to load
 * implements AdapterI interface
 */
export class AdapterWarpper{
  lasyLoadingFinished = false;
  tmplisteners = {};
  private tmpEventEmiter: EventEmitter<string | symbol, any>;
  private on;
  private __proto__: any;

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
     //wait for application ready
     await wait(()=>{return AFRAME && AFRAME.scenes && AFRAME.scenes[0]});
     //wait for room parameters retreived
     await roomParameters.applyRoomParameters();
     let adapter = await adapterFactory();

     //events emitter
     delete this["on"];
     Object.keys(this.tmplisteners).forEach((event)=>{
       const listeners = this.tmplisteners[event];
       if(listeners) {
         listeners.forEach(entry => {
           (adapter as any).on(event, entry.fn)
         })
       }
     });

     //variables
     Object.keys(adapter).forEach(key => {
       this[key] = adapter[key];
     })

     //function
     this.__proto__ = (adapter as any).__proto__;

     this.lasyLoadingFinished=true;
   }

}
