import { selectedUserData } from "@/store/slices/auth-slices";
import {
  addChannel,
  addChannelInChannelList,
  addContactInDmContactList,
  addMessage,
  selectedChatData,
  selectedChatMessage,
  selectedChatType,
  selectedTrigger,
  setTrigger,
} from "@/store/slices/chat-slices";
import { HOST } from "@/utils/constant";
import { useRef, useEffect, useContext, createContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import Cookie from "js-cookie";

import { setOfflineStatus, setOnlineStatus } from "@/store/slices/users-slices";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  const socket = useRef();
  const userData = useSelector(selectedUserData);
  const chatData = useSelector(selectedChatData);
  const chatMessage = useSelector(selectedChatType);
  const chatType = useSelector(selectedChatMessage);
  const dispatch = useDispatch();
  const cookie = Cookie.get("jwt");
  const trigger = useSelector(selectedTrigger);

  useEffect(() => {
    if (userData) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userData._id },
      });

      socket.current.on("connect", () => {
        // console.log("Connected to socket server");
      });

      socket.current.on("userStatus", ({ userId, status }) => {
        if (status === "online") {
          dispatch(setOnlineStatus(userId));
        } else {
          dispatch(setOfflineStatus(userId));
        }
      });

      socket.current.on("newChannel", (channel) => {
        dispatch(addChannel(channel));
        dispatch(setTrigger());
      });
      socket.current.on("dm-created", (message) => {
        dispatch(addChannelInChannelList(message));
        dispatch(setTrigger());
      });

      return () => {
        socket.current.off("newChannel");
        socket.current.off("userStatus");
        socket.current.disconnect();
        // console.log("Socket disconnected");
      };
    }
  }, [userData, cookie]);

  useEffect(() => {
    if (chatData) {
      const handleMessage = (message) => {
        if (
          chatType !== undefined &&
          (chatData._id === message.sender._id ||
            chatData._id === message.recipient._id)
        ) {
          dispatch(addMessage(message));
        }
        dispatch(addContactInDmContactList({ userId: userData._id, message }));
      };

      const handleReceiveChannelMessage = (message) => {
        if (
          selectedChatType !== undefined &&
          chatData._id === message.channelId
        ) {
          dispatch(addMessage(message));
        }
        dispatch(addChannelInChannelList(message));
        dispatch(setTrigger());
      };

      socket.current.on("receiveMessage", handleMessage);
      socket.current.on("receive-channel-message", handleReceiveChannelMessage);

      return () => {
        socket.current.off("receiveMessage", handleMessage);
        socket.current.off("channelCreated");
        socket.current.off(
          "receive-channel-message",
          handleReceiveChannelMessage
        );
      };
    }
  }, [chatData, chatType, chatMessage]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
