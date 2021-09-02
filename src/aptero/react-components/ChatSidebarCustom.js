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
    default:
      return null;
  }
}