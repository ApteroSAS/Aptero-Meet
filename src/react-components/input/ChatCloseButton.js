import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { IconButton } from "../input/IconButton";
import { ReactComponent as CloseIcon } from "../icons/button_close_jaune.svg";

import styles from "./CloseButton.scss";
export function ChatCloseButton({ lg, className, ...rest }) {
  return (
    <IconButton className={classNames({ [styles.lg]: lg }, className)} {...rest}>
      <CloseIcon width={16} height={16} />
    </IconButton>
  );
}

ChatCloseButton.propTypes = {
  className: PropTypes.string,
  lg: PropTypes.bool
};
