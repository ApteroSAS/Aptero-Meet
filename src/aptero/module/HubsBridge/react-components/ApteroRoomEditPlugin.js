import React, { Component } from "react";
import configs from "../../../../utils/configs";

export default class ApteroRoomEditPlugin extends Component {
  static propTypes = {};

  state = {};

  componentDidMount = async () => {
  };

  componentWillUnmount() {
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {"Selected adapter : "+configs.APP_CONFIG.adapterParams.adapter}
        </div>
      </React.Fragment>
      );
  }
}
