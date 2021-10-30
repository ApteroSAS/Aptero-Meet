import React, { ImageBackground, useCallback, useEffect, useState } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { ToolbarButton } from "./ToolbarButton";
import "./PrivatchatBubbles.scss";
export function PrivatechatBubbles({ receivedMessageNumber, onClick, imgUrl }) {
  return (
    <button onClick={onClick} class="button">
      <img class="img" src={imgUrl} height="30px" width="30px" />
      <span class="icon-button-badge">{receivedMessageNumber}</span>
    </button>
  );
}

export default PrivatechatBubbles;
