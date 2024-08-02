import React from "react";
import PropTypes from "prop-types";
import styles from "./LoadingScreenLayoutNew.scss";
import { Column } from "../layout/Column";
import { svgCorner } from "./LoadingScreenSVGs.js";
import { ReactComponent as LogoSVG } from "./logo-MWN_darkMode.svg"; // Adjust the path accordingly

export function LoadingScreenLayout({ center, bottom }) {
  return (
    <div className={styles.loadingScreenLayout}>
      <img
        className={`${styles.corners} ${styles.cornerTopLeft}`}
        src={svgCorner}
      />
      <img
        className={`${styles.corners} ${styles.cornerBottomRight}`}
        src={svgCorner}
      />
      <Column center padding gap="lg" className={styles.center}>
        <LogoSVG className={styles.logo} />
        {center}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112.37 103.47" className={styles.svgContainer}>
          <g>
            <path className={`${styles.clsWhite}`} d="M20.72,89.89c-7.97-8.39-12.86-19.73-12.86-32.21C7.87,31.84,28.81,10.9,54.64,10.9c9.54,0,18.41,2.85,25.81,7.76"/>
            <path className={`${styles.clsOrange}`} d="M2,39.8C7.76,22.85,21.58,8.99,40.15,3.95c29.66-8.04,60.23,9.49,68.27,39.15,6.03,22.24-2.32,44.98-19.37,58.36"/>
          </g>
        </svg>
      </Column>
      {bottom && (
        <Column center className={styles.bottom}>
          {bottom}
        </Column>
      )}
    </div>
  );
}

LoadingScreenLayout.propTypes = {
  center: PropTypes.node,
  bottom: PropTypes.node
};
