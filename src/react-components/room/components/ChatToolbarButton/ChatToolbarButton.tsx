import { ToolbarButton } from "../../../input/ToolbarButton";
// TO DO: look into changing icon theme handling to work with TS
// @ts-ignore
import { ReactComponent as ChatIcon } from "../../../icons/Chat.svg";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";
import React, { useContext } from "react";
import { ChatContext } from "../../contexts/ChatContext";

const chatTooltipDescription = defineMessage({
  id: "chat-tooltip.description",
  defaultMessage: "Open the chat sidebar (T)"
});

type ChatToolbarButtonProps = {
  onClick: () => void;
  selected: boolean
};

const ChatToolbarButton = ({ onClick, selected }: ChatToolbarButtonProps) => {
  const { unreadMessages } = useContext(ChatContext);
  const intl = useIntl();
  const description = intl.formatMessage(chatTooltipDescription);

  return (
      <ToolbarButton
        // Ignore type lint error as we will be redoing ToolbarButton in the future
        // @ts-ignore
        onClick={onClick}
        statusColor={unreadMessages ? "unread" : undefined}
        icon={<ChatIcon />}
        preset="accent4"
        label={<FormattedMessage id="chat-toolbar-button" defaultMessage="Chat" />}
        selected={selected}
      />
  );
};

export default ChatToolbarButton;
