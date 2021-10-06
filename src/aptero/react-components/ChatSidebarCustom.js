import { FormattedMessage } from "react-intl";
import React from "react";

export function customFormatSystemMessage(entry, intl) {
  switch (entry.type) {
    case "audio_sub_room_changed": {
      return (
        <FormattedMessage
          id="chat-sidebar-custom.system-message.audio_sub_room_changed"
          defaultMessage="You are now in audio channel {subroom}"
          values={{ subroom: <b>{entry.subroom}</b> }}
        />
      );
    }
    case "performance_impact_detected": {
      return (
        <FormattedMessage
          id="chat-sidebar-custom.system-message.performance_impact_detected"
          defaultMessage="slt"
        ><h1>Blue</h1></FormattedMessage>
      );
    }
    default:
      return null;
  }
}