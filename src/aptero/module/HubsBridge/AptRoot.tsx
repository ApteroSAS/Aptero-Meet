import React, { Component } from "react";
import UnderPage from "./react-components/UnderPage";
import { Provider } from 'inversify-react';
import {container} from "../axolotis/IOCConfig";

export default class AptRoot extends Component {
  render() {
    return (<>
        <Provider container={container}>
          <UnderPage/>
        </Provider>
      </>
    );
  }
}
