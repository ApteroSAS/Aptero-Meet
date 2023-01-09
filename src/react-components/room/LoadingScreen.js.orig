import React from "react";
import PropTypes from "prop-types";
import { LoadingScreenLayout } from "../layout/LoadingScreenLayout";
import { Spinner } from "../misc/Spinner";
import { useRandomMessageTransition } from "./useRandomMessageTransition";
<<<<<<< .merge_file_a07292

export function LoadingScreen({ logoSrc, message, infoMessages }) {
  //const infoMessage = useRandomMessageTransition(infoMessages);

=======
export function LoadingScreen({ message, infoMessages }) {
  const infoMessage = useRandomMessageTransition(infoMessages);
>>>>>>> .merge_file_a01040
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
