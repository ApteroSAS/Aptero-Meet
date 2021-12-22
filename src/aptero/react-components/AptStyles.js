import React, { Component } from "react";
import styles from "./AptStyles.scss";
//We grab the style selectors of the elements we want to change
import stylesToolbar from "../../react-components/layout/Toolbar.scss";
import styleRoomLayout from "../../react-components/layout/RoomLayout.scss";
import stylesRoomEntryModal from "../../react-components/room/RoomEntryModal.scss";
import stylesButton from "../../react-components/input/Button.scss";
import stylesContentMenu from "../../react-components/room/ContentMenu.scss";
import stylesUtils from "../../react-components/styles/style-utils.scss";
import stylesMoreMenuPopover from "../../react-components/room/MoreMenuPopover.scss";
import stylesToolbarButton from "../../react-components/input/ToolbarButton.scss";
import stylesModal from "../../react-components/modal/Modal.scss";
//import { StylesContext } from "@material-ui/core/node_modules/@material-ui/styles";

const inviteSelector = `.ApteroStyles .${stylesUtils.showLg}.${stylesToolbar.content}:first-child > *:first-child`; //Also present before loading
const leaveSelector =
  ".ApteroStyles.entered " + `.${stylesUtils.showLg}.${stylesToolbar.content}:last-child > *:first-child`;
const moreSelector = `.ApteroStyles .${stylesUtils.showLg}.${stylesToolbar.content}:last-child > *:last-child`; //Also present before loading
const voiceSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:first-child`;
const shareSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:nth-child(2)`;
const placeSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:nth-child(3)`;
const reactSelector = `.ApteroStyles.entered .${stylesToolbar.content}:nth-child(2) > *:nth-child(4)`;
const chatSelector = `.ApteroStyles .${stylesToolbar.content}:nth-child(2) > *:last-child`; //Also present before loading
const peopleSelector = `.ApteroStyles .${stylesContentMenu.contentMenuButton}:last-child`; //Also present before loading
const objectSelector = `.ApteroStyles.entered .${stylesContentMenu.contentMenuButton}:first-child`;

export default class AptStyle extends Component {
  constructor(props) {
    super(props);
    this.setUp = this.setUp.bind(this);
  }

  setUp() {
    const scene = AFRAME.scenes[0];

    //We apply styling priority by adding a selector class
    document.body.classList.add("ApteroStyles");
    //We apply class to inform the styles about the state of the room
    scene.addEventListener("entered", a => {
      document.body.classList.add("entered");
    });
  }

  componentDidMount() {
    const scene = AFRAME.scenes[0];
    if (scene) this.setUp();
    else {
      const sceneEl = document.querySelector("a-scene"); //renderstart
      sceneEl.addEventListener("renderstart", this.setUp);
    }
  }

  render() {
    return (
      <>
        <style>
          .ApteroStyles .{stylesToolbar.toolbar}
          {`{
            background-color : transparent;
            border : none;
            grid-column-end: auto;
            height: min-content;
            padding: 12px;
            position: relative;
          }`}
          .ApteroStyles .{stylesModal.content}
          {`{
            max-height: calc(100vh - 170px);
            overflow-y: auto; 
          }`}
          .ApteroStyles .{styleRoomLayout.roomLayout}
          {`{
            display:grid;
            grid-template-columns: [main] auto [iconspace] minmax(0, min-content) [sidebar] minmax(0, min-content)
          }`}
          .ApteroStyles .{styleRoomLayout.sidebar}
          {`{
            grid-row-start: 1;
            grid-row-end: 3;
          }`}
          .ApteroStyles .{stylesToolbar.content} {">"} *:last-child
          {`{
            margin-right:0;
          }`}
          .ApteroStyles .{stylesToolbarButton.toolbarButton} label
          {`{
            display: none;
          }`}
          .ApteroStyles .{stylesContentMenu.contentMenu}
          {`{
              background: transparent;
              border: 0;
              top: 8px;
              right: 8px;
          }`}
          .ApteroStyles .{stylesContentMenu.separator}
          {`{
            display:none;
          }`}
          .ApteroStyles .{stylesContentMenu.contentMenuButton}
          {`{
            border-radius: 100px;
            margin: 1em;
            padding: 0;
            position: relative;
          }`}
          .ApteroStyles .{stylesContentMenu.contentMenuButton} span
          {`{
            display:none;
          }`}
          .ApteroStyles .{stylesContentMenu.contentMenuButton}:last-child:after
          {`{
            content: attr(presencecount);
            top: -2px;
            position: absolute;
            right: -2px;
            background: white;
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            border: solid 1px darkgrey;
          }`}
          .ApteroStyles .{stylesContentMenu.contentMenuButton} svg
          {`{
              border:transparent 2px solid;
              border-radius:9999px;
              width:41px;
              height:41px;
              padding:2px;
              margin:0;
          }`}
          {moreSelector} div, {voiceSelector} {`>`} div, {inviteSelector} div,  .ApteroStyles .{stylesContentMenu.contentMenuButton}
          {`{
            border-color: var(--basic-color);
            background-color: var(--basic-color);
            border: solid 1px grey;
          }`}
          {moreSelector}:hover div, {voiceSelector}:hover {`>`} div, {inviteSelector}:hover div,  .ApteroStyles .{stylesContentMenu.contentMenuButton}:hover
          {`{
            border-color: var(--basic-color-hover);
            background-color: var(--basic-color-hover);
          }`}
          {moreSelector}:active div, {voiceSelector}:active {`>`} div, {inviteSelector}:active div,  .ApteroStyles .{stylesContentMenu.contentMenuButton}:active
          {`{
            border-color: var(--basic-color-pressed);
            background-color: var(--basic-color-pressed);
          }`}
          
          {objectSelector}
          {`{
            display:none;
          }`}
  
          
        </style>
      </>
    );
  }
}
