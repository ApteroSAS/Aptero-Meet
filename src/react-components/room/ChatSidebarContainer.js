import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import DropDownChatList, { getPersonName } from "./DropDownChatList";
import { getPresences } from "./DropDownChatList";
import {
  ChatSidebar,
  ChatMessageGroup,
  SystemMessage,
  ChatMessageList,
  ChatInput,
  MessageAttachmentButton,
  SpawnMessageButton,
  ChatToolbarButton,
  SendMessageButton,
  EmojiPickerPopoverButton,
  ChatLengthWarning
} from "./ChatSidebar";
import { useMaintainScrollPosition } from "../misc/useMaintainScrollPosition";
import { spawnChatMessage } from "../chat-message";
import { discordBridgesForPresences } from "../../utils/phoenix-utils";
import { useIntl } from "react-intl";
import { MAX_MESSAGE_LENGTH } from "../../utils/chat-message";
import { PrivatechatBubbles } from "../input/PrivatechatBubbles";
import { usePeopleList } from "./PeopleSidebarContainer";
import { Prop } from "../debug-panel/Prop";
const ChatContext = createContext({ messageGroups: [], privateMessages: [], sendMessage: () => {} });
let uniqueMessageId = 0;
const everyone_value = {
  id: "everyone",
  receivedMessageNumber: 0,
  display_bulle:true
};
var bulles_list = [everyone_value];
const NEW_MESSAGE_GROUP_TIMEOUT = 1000 * 60;
var deleted_item_id='';
function shouldCreateNewMessageGroup(messageGroups, newMessage, now) {
  if (messageGroups.length === 0) {
    return true;
  }

  const lastMessageGroup = messageGroups[messageGroups.length - 1];

  if (lastMessageGroup.senderSessionId !== newMessage.sessionId) {
    return true;
  }

  const lastMessage = lastMessageGroup.messages[lastMessageGroup.messages.length - 1];

  return now - lastMessage.timestamp > NEW_MESSAGE_GROUP_TIMEOUT;
}
function shouldCreateNewPrivateMessageGroup(privateMessages, newMessage, now) {
  if (privateMessages.length === 0) {
    return true;
  }

  const lastMessageGroup = privateMessages[privateMessages.length - 1];

  if (
    lastMessageGroup.senderSessionId !== newMessage.sessionId ||
    lastMessageGroup.userReceiverId !== newMessage.receiverClientId
  ) {
    return true;
  }

  const lastMessage = lastMessageGroup.messages[lastMessageGroup.messages.length - 1];

  return now - lastMessage.timestamp > NEW_MESSAGE_GROUP_TIMEOUT;
}

function processChatMessage(messageGroups, newMessage) {
  const now = Date.now();
  const { name, sent, sessionId, ...messageProps } = newMessage;

  if (shouldCreateNewMessageGroup(messageGroups, newMessage, now)) {
    return [
      ...messageGroups,
      {
        id: uniqueMessageId++,
        timestamp: now,
        sent,
        sender: name,
        senderSessionId: sessionId,
        messages: [{ id: uniqueMessageId++, timestamp: now, ...messageProps }]
      }
    ];
  }

  const lastMessageGroup = messageGroups.pop();
  lastMessageGroup.messages = [
    ...lastMessageGroup.messages,
    { id: uniqueMessageId++, timestamp: now, ...messageProps }
  ];

  return [...messageGroups, { ...lastMessageGroup }];
}
function processPrivateChatMessage(privateMessage, newMessage) {
  const now = Date.now();
  const { name, sent, sessionId, receiverClientId, ...messageProps } = newMessage;
  if (shouldCreateNewPrivateMessageGroup(privateMessage, newMessage, now)) {
    return [
      ...privateMessage,
      {
        id: uniqueMessageId++,
        timestamp: now,
        sent,
        sender: name,
        senderSessionId: sessionId,
        userReceiverId: receiverClientId,
        messages: [{ id: uniqueMessageId++, timestamp: now, ...messageProps }]
      }
    ];
  }

  const lastMessageGroup = privateMessage.pop();
  lastMessageGroup.messages = [
    ...lastMessageGroup.messages,
    { id: uniqueMessageId++, timestamp: now, ...messageProps }
  ];

  return [...privateMessage, { ...lastMessageGroup }];
}

// Returns the new message groups array when we receive a message.
// If the message is ignored, we return the original message group array.
function updateMessageGroups(messageGroups, newMessage) {
  switch (newMessage.type) {
    case "join":
    case "entered":
    case "leave":
    case "display_name_changed":
    case "scene_changed":
    case "hub_name_changed":
    case "hub_changed":
    case "log":
      return [
        ...messageGroups,
        {
          id: uniqueMessageId++,
          systemMessage: true,
          timestamp: Date.now(),
          ...newMessage
        }
      ];
    case "chat":
    case "image":
    case "photo":
    case "video":
      return processChatMessage(messageGroups, newMessage);
    default:
      return messageGroups;
  }
}
function updateprivateMessageGroups(privateMessages, newMessage) {
  switch (newMessage.type) {
    case "join":
    case "entered":
    case "leave":
    case "display_name_changed":
    case "scene_changed":
    case "hub_name_changed":
    case "hub_changed":
    case "log":
      return [
        ...privateMessages,
        {
          id: uniqueMessageId++,
          systemMessage: true,
          timestamp: Date.now(),
          ...newMessage
        }
      ];
    case "chat":
    case "image":
    case "photo":
    case "video":
      return processPrivateChatMessage(privateMessages, newMessage);
    default:
      return privateMessages;
  }
}

export function ChatContextProvider({ messageDispatch, children, people }) {
  const [messageGroups, setMessageGroups] = useState([]);
  const [privateMessages, setPrivateMessage] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [test_messages, settestmessage] = useState([]);
  const [test_messages_public, settestmessagepublic] = useState([]);
  var bulles_list_chat = bulles_list;
  //getPeople();
  useEffect(() => {
    function onReceiveMessage(event) {
      const newMessage = event.detail;

      if (newMessage.type == "chat" && newMessage.sessionId != NAF.clientId) {
        bulles_list.map(option => {
          if (option.id == "everyone") {
            option.receivedMessageNumber = 1;
          }
        });
      }
      settestmessagepublic(test_messages_public => [...test_messages_public, newMessage]);
      setMessageGroups(messages => updateMessageGroups(messages, newMessage));

      if (
        newMessage.type === "chat" ||
        newMessage.type === "image" ||
        newMessage.type === "photo" ||
        newMessage.type === "video"
      ) {
        setUnreadMessages(true);
      }
    }
    function onReceivePrivateMessage(event) {
      const newMessage = event.detail;
      if (newMessage.receiverClientId == NAF.clientId) {
        const found = bulles_list_chat.find(element => element.id == newMessage.sessionId);
        if (found == null) {
          const element = {
            id: newMessage.sessionId,
            receivedMessageNumber: 1,
            display_bulle:true
          };
          bulles_list_chat.push(element);
        } else {
          bulles_list_chat.map(option => {
            if (option.id == newMessage.sessionId) {
              option.receivedMessageNumber = 1;
              option.display_bulle=true;
            }
          });
        }
      }
      else{
        const found = bulles_list_chat.find(element => element.id == newMessage.receiverClientId);
       if(found) {
          bulles_list_chat.map(option => {
            if (option.id == newMessage.receiverClientId) {
              option.display_bulle=true;
            }
          });
        }
      }
      settestmessage(test_messages => [...test_messages, newMessage]);
      setPrivateMessage(messages => updateprivateMessageGroups(messages, newMessage));

      if (
        newMessage.type === "chat" ||
        newMessage.type === "image" ||
        newMessage.type === "photo" ||
        newMessage.type === "video"
      ) {
        setUnreadMessages(true);
      }
    }

    if (messageDispatch) {
      messageDispatch.addEventListener("message", onReceiveMessage);
      messageDispatch.addEventListener("private", onReceivePrivateMessage);
    }

    return () => {
      if (messageDispatch) {
        messageDispatch.removeEventListener("message", onReceiveMessage);
        messageDispatch.removeEventListener("private", onReceivePrivateMessage);
      }
    };
  }, [messageDispatch, setMessageGroups, setPrivateMessage, setUnreadMessages]);

  const sendMessage = useCallback(
    message => {
      if (messageDispatch) {
        messageDispatch.dispatch(message);
      }
    },
    [messageDispatch]
  );

  const setMessagesRead = useCallback(() => {
    setUnreadMessages(false);
  }, [setUnreadMessages]);

  return (
    <ChatContext.Provider
      value={{
        messageGroups,
        privateMessages,
        test_messages,
        test_messages_public,
        unreadMessages,
        sendMessage,
        setMessagesRead,
        bulles_list_chat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

ChatContextProvider.propTypes = {
  children: PropTypes.node,
  messageDispatch: PropTypes.object,
  presences: PropTypes.object,
  sessionId: PropTypes.string,
  people: PropTypes.array
};

export function ChatSidebarContainer({
  scene,
  userId,
  userName,
  canSpawnMessages,
  presences,
  occupantCount,
  onClose,
  toggleChatSidebar
}) {
  const {
    messageGroups,
    privateMessages,
    test_messages,
    test_messages_public,
    sendMessage,
    setMessagesRead,
    bulles_list_chat
  } = useContext(ChatContext);
  const [onScrollList, listRef, scrolledToBottom] = useMaintainScrollPosition(messageGroups);
  const [message, setMessage] = useState("");
  const intl = useIntl();
  var name;
  const people = usePeopleList(presences, NAF.clientId);
  bulles_list = bulles_list_chat;
  if(deleted_item_id!='')
  {
    bulles_list=bulles_list.filter(item =>!(item.id == deleted_item_id));
    deleted_item_id='';
  }
  if (userId != "everyone") {
    people.map(person => {
      if (person.id == userId) {
        name = person.profile.displayName;
      }
    });
  } else {
    name = "Chat";
  }
  const onKeyDown = useCallback(
    e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
          if (userId == "everyone") {
            sendMessage(e.target.value);
            name = "Chat";
          } else {
            NAF.connection.adapter.hubChannel.receivePrivateClientId(userId, e.target.value);
          }
          setMessage("");
        }
      }
    },
    [sendMessage, setMessage, userId]
  );

  const onSendMessage = useCallback(() => {
    if (userId == "everyone") {
      sendMessage(message.substring(0, MAX_MESSAGE_LENGTH));
    } else {
      NAF.connection.adapter.hubChannel.receivePrivateClientId(userId, message.substring(0, MAX_MESSAGE_LENGTH));
    }

    setMessage("");
  }, [message, sendMessage, setMessage]);

  const onSpawnMessage = () => {
    spawnChatMessage(message);
    setMessage("");
  };

  const onUploadAttachments = useCallback(
    e => {
      // TODO: Right now there's no way to upload files to the chat only.
      // When we add the place menu whcih will have an explicit button for uploading files,
      // should we make this attach button only upload to chat?
      for (const file of e.target.files) {
        scene.emit("add_media", file);
      }
    },
    [scene]
  );

  useEffect(() => {
    if (scrolledToBottom) {
      setMessagesRead();
    }
  }, [messageGroups, scrolledToBottom, setMessagesRead]);

  const discordBridges = discordBridgesForPresences(presences);
  const discordSnippet = discordBridges.map(ch => "#" + ch).join(", ");
  let placeholder;

  if (occupantCount <= 1) {
    if (discordBridges.length === 0) {
      placeholder = intl.formatMessage({
        id: "chat-sidebar-container.input-placeholder.empty-room",
        defaultMessage: "Nobody is here yet..."
      });
    } else {
      placeholder = intl.formatMessage(
        {
          id: "chat-sidebar-container.input-placeholder.empty-room-bot",
          defaultMessage: "Send message to {discordChannels}"
        },
        { discordChannels: discordSnippet }
      );
    }
  } else {
    if (discordBridges.length === 0) {
      if (userId == "everyone") {
        placeholder = intl.formatMessage(
          {
            id: "chat-sidebar-container.input-placeholder.occupants",
            defaultMessage:
              "{occupantCount, plural, one {Send message  to one other...} other {Send message  to {occupantCount} others...} }"
          },
          { discordChannels: discordSnippet, occupantCount: occupantCount - 1 }
        );
      } else {
        placeholder = intl.formatMessage(
          {
            id: "chat-sidebar-container.input-placeholder.private-user",
            defaultMessage: "Send message  to {userName}"
          },
          { userName: name }
        );
      }
    } else {
      placeholder = intl.formatMessage(
        {
          id: "chat-sidebar-container.input-placeholder.occupants-and-bot",
          defaultMessage:
            "{occupantCount, plural, one {Send message to one other and {discordChannels}...} other {Send message to {occupantCount} others and {discordChannels}...} }"
        },
        { discordChannels: discordSnippet, occupantCount: occupantCount - 1 }
      );
    }
  }

  const isMobile = AFRAME.utils.device.isMobile();
  const isOverMaxLength = message.length > MAX_MESSAGE_LENGTH;
  const users = [];
  const users_private = [];
  var i = 1;
  return (
    <ChatSidebar onClose={onClose} userName={name}>
      <ChatMessageList ref={listRef} onScroll={onScrollList}>
        {messageGroups.map(option => {
          const message_list = [];
          const message_list_private = [];

          if (userId == "everyone") {
            var public_chat = false;

            if (option.messages != null) {
              option.messages.map(msg => {
                if (msg.receiverClientId == null) {
                  public_chat = true;
                  message_list.push(msg);
                }
              });
            }
            if (public_chat) {
              const user = option;
              user.messages = message_list;
              users.push(user);
              public_chat = false;
            }
            if (i == messageGroups.length) {
              if (userId == "everyone") {
                return users.map(({ id, ...rest }) => <ChatMessageGroup key={id} {...rest} />);
              }
              //}
            }
            i = i + 1;
          }

          ///rest.messages=message;
        })}
        {privateMessages.map(option => {
          const message_list = [];
          const message_list_private = [];
          if (userId != "everyone") {
            var private_chat = false;
            if (option.userReceiverId == NAF.clientId || option.senderSessionId == NAF.clientId) {
              if (option.userReceiverId == NAF.clientId) {
                const found = bulles_list.find(element => element.id == option.senderSessionId);
                if (found == null) {
                  const element = {
                    id: option.senderSessionId,
                    receivedMessageNumber: 0,
                    display_bulle:true
                  };
                  bulles_list.push(element);
                }
              } else {
                const found = bulles_list.find(element => element.id == option.userReceiverId);
                if (found == null) {
                  const element = {
                    id: option.userReceiverId,
                    receivedMessageNumber: 0,
                    display_bulle:true
                  };
                  bulles_list.push(element);
                }
              }
            }
            if (
              (option.userReceiverId == userId && option.senderSessionId == NAF.clientId) ||
              (option.userReceiverId == NAF.clientId && userId == option.senderSessionId)
            ) {
              option.messages.map(msg => {
                private_chat = true;
                message_list_private.push(msg);
              });
            }
            if (private_chat) {
              const user = option;
              user.messages = message_list_private;
              users_private.push(user);
              private_chat = false;
            }

            if (i == privateMessages.length) {
              if (userId != "everyone") {
                return users_private.map(({ id, ...rest }) => <ChatMessageGroup key={id} {...rest} />);
              }
            }
            i = i + 1;
          } else {
            if (option.userReceiverId == NAF.clientId || option.senderSessionId == NAF.clientId) {
              if (option.userReceiverId == NAF.clientId) {
                const found = bulles_list.find(element => element.id == option.senderSessionId);
                if (found == null) {
                  const element = {
                    id: option.senderSessionId,
                    receivedMessageNumber: 0,
                    display_bulle:true
                  };
                  bulles_list.push(element);
                }
              } else {
                const found = bulles_list.find(element => element.id == option.userReceiverId);
                if (found == null) {
                  const element = {
                    id: option.userReceiverId,
                    receivedMessageNumber: 0,
                    display_bulle:true
                  };
                  bulles_list.push(element);
                }
              }
            }
          }
        })}
      </ChatMessageList>
      <div>
        <ul className="bubbles-container">
          {bulles_list.map(bulles => {
            const a = 0;
            let str = "";
            if (bulles.id == "everyone") {
              str = "";
            } else {
              
              people.map(person=>{
                if(person.id==bulles.id){
                  if(person.profile.microsoftUserprofilePicture)
                  {
                    str=person.profile.microsoftUserprofilePicture;
                  }
                  else{
                    str=person.profile.profilePicture;
                  }

                  
                }
              });
            }
            if(bulles.display_bulle)
            {
              return (
                <li className="bubbles" key={bulles.id}>
                  <PrivatechatBubbles
                    receivedMessageNumber={bulles.receivedMessageNumber}
                    imgUrl={str}
                    bulle_id={bulles.id}
                    onDelete={()=>{
                      var index= bulles_list.findIndex((item => item.id == bulles.id));
                      bulles_list[index].display_bulle=false;
                      onClose();
                      toggleChatSidebar("chat",'everyone');
                    }}
                    onClick={e => {
                      bulles.receivedMessageNumber = 0;
                      onClose();
                      toggleChatSidebar("chat", bulles.id);
                    }}
                  />
                </li>
              );
            }

          })}
        </ul>
      </div>
      <ChatInput
        id="chat-input"
        onKeyDown={onKeyDown}
        onChange={e => setMessage(e.target.value)}
        placeholder={placeholder}
        value={message}
        isOverMaxLength={isOverMaxLength}
        warning={
          <>
            {message.length + 50 > MAX_MESSAGE_LENGTH && (
              <ChatLengthWarning messageLength={message.length} maxLength={MAX_MESSAGE_LENGTH} />
            )}
          </>
        }
        afterInput={
          <>
            {/* APTERO Disable Emoji picker
            !isMobile && (
              <EmojiPickerPopoverButton onSelectEmoji={emoji => setMessage(message => message + emoji.native)} />
            )*/}
            {message.length === 0 && canSpawnMessages ? (
              <MessageAttachmentButton onChange={onUploadAttachments} />
            ) : (
              <SendMessageButton onClick={onSendMessage} disabled={message.length === 0 || isOverMaxLength} />
            )}
            {canSpawnMessages && (
              <SpawnMessageButton disabled={message.length === 0 || isOverMaxLength} onClick={onSpawnMessage} />
            )}
          </>
        }
      />
     
    </ChatSidebar>
     
  );

}

ChatSidebarContainer.propTypes = {
  canSpawnMessages: PropTypes.bool,
  userId: PropTypes.string,
  userName: PropTypes.string,
  presences: PropTypes.object.isRequired,
  occupantCount: PropTypes.number.isRequired,
  scene: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  toggleChatSidebar: PropTypes.func.isRequired
};

export function ChatToolbarButtonContainer(props) {
  const { unreadMessages } = useContext(ChatContext);
  return <ChatToolbarButton {...props} statusColor={unreadMessages ? "unread" : undefined} />;
}
export function cleanBulle_list(bulles_list, people) {
  var found = false;
  const test = [];
  test.push(bulles_list[0]);
  bulles_list.map(item => {
    if (item.id != "everyone") {
      people.map(person => {
        if (item.id == person.id) {
          found = true;
        }
      });
      if (found) {
        test.push(item);
      }
      found = false;
    }
  });
  return test;
}
/*
export function  test(array){
  return array.splice(1,1);
}*/