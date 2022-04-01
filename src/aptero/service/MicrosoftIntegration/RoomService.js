import axios from "axios";

export class RoomService{
    parseUrl(url){
        //https://alphahub.aptero.co/fTj63Hg/room?msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8
        let urlObj = new URL(url)
        return {
            origin:urlObj.origin,
            roomSID:urlObj.pathname.split("/")[1]
        }
    }

    async getEmbedToken(roomSID,origin){
        let res = await axios.get(origin+"/service/room/"+"room/"+roomSID+"/embed/token");
        return res.data;
    }
}

export const roomService = new RoomService();