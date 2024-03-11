import React, { useEffect } from "react";
import styledheader from "../../../react-components/layout/Header.scss";

export const AptHomeStyles = () => {
  useEffect(() => {
    // Equivalent to componentDidMount
    document.body.classList.add("ApteroHomeStyles");

    return () => {
      // Equivalent to componentWillUnmount
      document.body.classList.remove("ApteroHomeStyles");
    };
  }, []); // The empty array ensures this effect runs only once after the initial render

  return (
      <>
        <style>{`
        .ApteroHomeStyles .${styledheader.homeLink} {
          width: auto;
        }
      `}</style>
      </>
  );
};
