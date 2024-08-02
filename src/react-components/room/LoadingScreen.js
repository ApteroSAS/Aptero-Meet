import React from "react";
import PropTypes from "prop-types";
import { LoadingScreenLayout } from "../layout/LoadingScreenLayoutNew";

export function LoadingScreen() {
  return (
    <LoadingScreenLayout
      center={<></>}
      bottom={<div></div>}
    />
  );
}

LoadingScreen.propTypes = {
  message: PropTypes.node,
};

LoadingScreen.defaultProps = {
  message: "",
};
