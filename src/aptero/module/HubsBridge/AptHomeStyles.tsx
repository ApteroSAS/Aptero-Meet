import React, { Component } from "react";
import styledheader from "../../../react-components/layout/Header.scss"

export default class AptHomeStyles extends Component {
  constructor(props) {
    super(props);
    document.body.classList.add("ApteroHomeStyles")
  }
  render() {

    return (
      <>
        <style>{`
            .ApteroHomeStyles .${styledheader.homeLink} {
              width: auto;
            }
        `}</style>
      </>
    );
  }
}
