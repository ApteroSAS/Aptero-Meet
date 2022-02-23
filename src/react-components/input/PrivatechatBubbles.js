import React, { ImageBackground, useCallback, useEffect, useState } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { ToolbarButton } from "./ToolbarButton";
import "./PrivatchatBubbles.scss";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";
import { CloseButton } from "./CloseButton";
export function PrivatechatBubbles({ receivedMessageNumber, onClick, imgUrl, bulle_id,onDelete}) {
  if (bulle_id == "everyone") {
    return (
      <button onClick={onClick} className="button">
        <PeopleIcon />
        {receivedMessageNumber != 0 && <span className="icon-button-badge">{receivedMessageNumber}</span>}
      </button>
    );
  } else {
    return (
      <div>
        <button onClick={onClick} className="button">
        <img src={imgUrl} className="img"></img>
        {receivedMessageNumber != 0 && <span className="icon-button-badge">{receivedMessageNumber}</span>}
        </button>
        {receivedMessageNumber==0 && <CloseButton onClick={onDelete} className="closeBtn"></CloseButton>}
      </div>
    );
  }
}

export default PrivatechatBubbles;
