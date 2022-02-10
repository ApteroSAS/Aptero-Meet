import React, { ImageBackground, useCallback, useEffect, useState } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { ToolbarButton } from "./ToolbarButton";
import "./PrivatchatBubbles.scss";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";
export function PrivatechatBubbles({ receivedMessageNumber, onClick, imgUrl, bulle_id }) {
  if (bulle_id == "everyone") {
    return (
      <button onClick={onClick} className="button">
        <PeopleIcon />
        {receivedMessageNumber != 0 && <span className="icon-button-badge">{receivedMessageNumber}</span>}
      </button>
    );
  } else {
    return (
      <button onClick={onClick} className="button">
        <img src={imgUrl} className="img"></img>
        {receivedMessageNumber != 0 && <span className="icon-button-badge">{receivedMessageNumber}</span>}
      </button>
    );
  }
}

export default PrivatechatBubbles;
