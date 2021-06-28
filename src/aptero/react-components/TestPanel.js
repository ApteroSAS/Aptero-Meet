import React, { Component } from "react";
import { selfTestService } from "../service/SelfTestService";

export default class TestPanel extends Component {

  static propTypes = {
  };

  state = {
    clients: {},
    error:false
  };

  componentDidMount = async () => {
    this.setState({clients:selfTestService.clients});
    selfTestService.notifyUpdate(()=>{
      this.setState({clients:selfTestService.clients,error:selfTestService.errorDetected});
    })
  };

  render() {
    if(!selfTestService.isTestMode()){
      return <></>;
    }else {
      return (
          <div style={{zIndex:900,pointerEvents:"auto"}}>
            <div>test mode : {NAF.clientId}</div>
            <div>error <span id="test-error-state">{this.state.error?"true":"false"}</span></div>
            <div id="test-clients-list">
            {Object.keys(this.state.clients).map(x => {
              return <div className="test-client" key={x}>{JSON.stringify(this.state.clients[x])}</div>
            })}
            </div>
          </div>
      );
    }
  }
}
