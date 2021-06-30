import React, { Component } from "react";
import { selfTestService } from "../service/SelfTestService.module";

export default class TestPanel extends Component {

  static propTypes = {
  };

  state = {
    clients: {},
    error:false,
    consoleError:false,
  };

  componentDidMount = async () => {
    this.setState({clients:selfTestService.clients});
    selfTestService.notifyUpdate = ()=>{
      const newState = {
        clients:selfTestService.clients,
        error:selfTestService.errorDetected,
        consoleError:selfTestService.consoleErrorDetected,
      }
      if(JSON.stringify(this.state)!==JSON.stringify(newState)) {
        this.setState(newState);
      }
    }
  };

  render() {
    if(!selfTestService.isTestMode()){
      return <></>;
    }else {
      return (
        <>
          <span style={{zIndex:900,pointerEvents:"auto"}} >
            mic test
            <button id="test-start-mic-test" onClick={()=>{selfTestService.startMicTest()}}>Start</button>
            <button id="test-stop-mic-test" onClick={()=>{selfTestService.stopMicTest()}}>End</button>
          </span>
          <div style={{zIndex:900,pointerEvents:"off"}}>
            <div>test mode : {NAF.clientId}</div>
            <div>throw error <span id="test-error-state">{this.state.error?"true":"false"}</span></div>
            <div>console error <span id="test-error-state">{this.state.consoleError?"true":"false"}</span></div>
            <div id="test-clients-list">
            {Object.keys(this.state.clients).map(x => {
              return <div className="test-client" key={x}>{JSON.stringify(this.state.clients[x])}</div>
            })}
            </div>
          </div>
          </>
      );
    }
  }
}
