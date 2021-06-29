import qsTruthy from "../../utils/qs_truthy";
import React, { Component } from "react";

const testMode = qsTruthy("test");

export async function startSelfTest() {
  if (testMode) {
    const selfTestService = (await import("../service/SelfTestService.module"));
    selfTestService.selfTestService.startSelfTest();
  }
}

export async function notifySceneEntered() {
  if (testMode) {
    const selfTestService = (await import("../service/SelfTestService.module"));
    selfTestService.selfTestService.notifySceneEntered();
  }
}


export default class TestPanelLazy extends Component {
  state = {
    child: <></>,
  };

  componentDidMount = async () => {
    if(testMode) {
      const TestPanel = (await import("../react-components/TestPanel"))
      //TestPanel.default
      this.setState({ child: new TestPanel.default() })
    }
  };

  render() {
      return this.state.child;
  }
}