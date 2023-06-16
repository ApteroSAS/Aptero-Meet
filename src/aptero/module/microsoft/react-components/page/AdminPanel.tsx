import React from "react";
import {Identity} from "../components/Identity";
import {RoomEditor} from "../components/RoomEditor";

export const AdminPanel: React.FC<any> = (props) => {
    //position needs to be absolute for it to occupies the entire screen
    return (
        <div style={{
            position:"absolute",width:"100%",height:"100%",
            display: "flex", /* Enables flexbox layout */
            flexDirection: "column", /* Stacks child elements vertically */
        }}>
            <div>
            <Identity/>
                Once your scene project is created you can add the 3D room where you want in teams (Meeting extension, Tab, Chat). Click on the contextual "Add App" menu.
            </div>
            <RoomEditor/>
        </div>
    );
}
