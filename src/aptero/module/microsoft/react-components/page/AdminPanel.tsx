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
            <Identity/>
            <RoomEditor/>
        </div>
    );
}
