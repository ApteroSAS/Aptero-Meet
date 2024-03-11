import React from "react";
import PropTypes from "prop-types";
import { LoadingScreenLayout } from "../layout/LoadingScreenLayout";
import { Spinner } from "../misc/Spinner";
import { useRandomMessageTransition } from "./hooks/useRandomMessageTransition";
export function LoadingScreen({ message, infoMessages }) {
   //APTERO
  //const infoMessage = useRandomMessageTransition(infoMessages);
  return (
    <LoadingScreenLayout
      center={
        <>
          <Spinner />
          <p>{message}</p>
        </>
      }
      bottom={<div></div>}
    />
  );
}

LoadingScreen.propTypes = {
  message: PropTypes.node,
  infoMessages: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.node.isRequired,
      message: PropTypes.node.isRequired
    })
  )
};

LoadingScreen.defaultProps = {
  infoMessages: []
};
