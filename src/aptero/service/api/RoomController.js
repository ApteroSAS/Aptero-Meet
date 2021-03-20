export class RoomController{

    setEntryMode(mode){
        if(this.hub){
            this.hub.entry_mode=mode;//allow or invite
        }
    }

    setRoom(hub){
        this.hub = hub;
    }
}

export const roomController = new RoomController();