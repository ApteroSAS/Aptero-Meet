import React, { useCallback, useEffect, useState } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { ToolbarButton } from "./ToolbarButton";
import styles from "./PrivatchatBubbles.scss";
export function PrivatechatBubbles({ onClick }) {
  return <ToolbarButton className="test" onClick={onClick} preset="accent4" />;
}

export default PrivatechatBubbles;
