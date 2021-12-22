import TestPanelLazy from "../service/SelfTestService.loader";
import React, { Component } from "react";
import { ShareScreenModal } from "./ShareScreenModal";
import AudioChangeHelper from "./AudioChangeHelper";
import GaugeModal from "./GaugeModal";
import UnderPage from "./UnderPage";
import AptStyles from "./AptStyles";

export default class AptRoot extends Component {
  render() {
    return (<>
        <TestPanelLazy/>
        <ShareScreenModal onBack={() => {
        }}/>
        <AudioChangeHelper/>
        <GaugeModal/>
        <UnderPage/>
        <AptStyles/>
      </>
    );
  }
}
