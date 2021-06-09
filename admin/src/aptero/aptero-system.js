import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Title } from "react-admin";
import withCommonStyles from "../utils/with-common-styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { getAdminInfo, getEditableConfig, getConfig, putConfig } from "../utils/ita";
import axios from "axios";
import { propertiesService } from "../../../src/aptero/properties/propertiesService";

// NOTE there's a mysterious uncaught exception in a promise when this component is shown, that seems
// to be coupled with the "All 3rd party content" typography block. It's a mystery.

const styles = withCommonStyles(() => ({
  worker: {
    width: "600px",
    height: "200px",
    fontFamily: "monospace",
    marginTop: "8px"
  },

  workerInput: {
    padding: "8px",
    width: "250px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    margin: "8px"
  }
}));

class ApteroSystemComponent extends Component {
  state = {
    loading: false,
    roomsid: "",
    adapter: ""
  };

  async componentDidMount() {
    this.adminInfo = await getAdminInfo();
    this.retConfig = await getEditableConfig("reticulum");
  }

  async onSubmit(e) {
    e.preventDefault();
    console.log("submited");
    let mongoData = {
      data: { AppConfigOverride: { adapterParams: { adapter: this.state.adapter } } },
      hubsid: this.state.roomsid,
      jwt: window.APP.store.state.credentials.token
    };
    let newjwt = await axios.post("https://" + propertiesService.RETICULUM_SERVER + "/service/room" + "/room/jwt/helper/mongo", mongoData);
    let result = await axios.post("https://" + propertiesService.RETICULUM_SERVER + "/service/room/" + "room/update/mongo", { jwt: newjwt.data });
    console.log(result.data);
  }

  render() {
    return (
      <Card className={this.props.classes.container}>
        <Title title="Content CDN" />
        <form onSubmit={this.onSubmit.bind(this)}>
          <CardContent className={this.props.classes.info}>
            <Typography variant="body2" gutterBottom>
              Change room adapter
            </Typography>

            <input
              type="text"
              placeholder="room sid"
              className={this.props.classes.workerInput}
              value={this.state.roomsid}
              onChange={e => this.setState({ roomsid: e.target.value })}
            />
            <Select
              labelId="select-label"
              id="select"
              value={this.state.adapter}
              onChange={e => this.setState({ adapter: e.target.value })}
            >
              <MenuItem value={"default"}>default</MenuItem>
              <MenuItem value={"dialog"}>dialog</MenuItem>
              <MenuItem value={"dialog-io"}>dialog-io</MenuItem>
              <MenuItem value={"twilio"}>twilio</MenuItem>
              <MenuItem value={"agora"}>agora</MenuItem>
              <MenuItem value={"janus"}>janus</MenuItem>
            </Select>
            <Button
              onClick={this.onSubmit.bind(this)}
              className={this.props.classes.button}
              variant="contained"
              color="primary"
            >change
            </Button>
          </CardContent>
        </form>
      </Card>
    );
  }
}

export const ApteroSystem = withStyles(styles)(ApteroSystemComponent);
