import React, { ImageBackground, useCallback, useEffect, useState } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { ToolbarButton } from "./ToolbarButton";
import "./PrivatchatBubbles.scss";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";
export function PrivatechatBubbles({ receivedMessageNumber, onClick, imgUrl, bulle_id,onDelete}) {
  if (bulle_id == "everyone") {
    return (
      <button onClick={onClick} class="button">
        <PeopleIcon />
        {receivedMessageNumber != 0 && <span class="icon-button-badge">{receivedMessageNumber}</span>}
      </button>
    );
  } else {
    return (
      <button onClick={onDelete} class="button">
        <img src={imgUrl} class="img"></img>
        {receivedMessageNumber != 0 && <span class="icon-button-badge">{receivedMessageNumber}</span>}
      </button>
    );
  }
}

export default PrivatechatBubbles;
