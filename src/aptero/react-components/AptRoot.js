import TestPanelLazy from "../service/SelfTestService.loader";
import React, { Component } from "react";
import { ShareScreenModal } from "./ShareScreenModal";
import AudioChangeHelper from "./AudioChangeHelper";

export default class AptRoot extends Component {
  render() {
    return (<>
        <TestPanelLazy/>
        <ShareScreenModal onBack={() => {
        }}/>
        <AudioChangeHelper/>
      </>
    );
  }
}
