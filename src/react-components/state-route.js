import React from 'react';
import PropTypes from 'prop-types';

const StateRoute = ({ history, stateKey, stateValue, render,children }) => {
  const shouldRender =
      (!history.location.state && !stateValue) ||
      (history.location.state &&
          (history.location.state[stateKey] === stateValue || (!history.location.state[stateKey] && !stateValue)));

  if (shouldRender) {
    console.log("StateRoute: ", stateKey, stateValue);
    if (render) {
      // Use the render prop if provided
      return <>{render({ location: history.location, history })}</>;
    } else if (typeof children === 'function') {
      // If children is a function, call it with the current history props
      return <>{children({ location: history.location, history })}</>;
    } else {
      // If children is not a function, just render them directly
      return <>{children}</>;
    }
  }

  return null;
};

StateRoute.propTypes = {
  stateKey: PropTypes.string.isRequired,
  stateValue: PropTypes.string,
  history: PropTypes.object.isRequired,
  render: PropTypes.func
};

export default StateRoute;
