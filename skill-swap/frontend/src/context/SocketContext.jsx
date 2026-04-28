// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io("/", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("user:online", user.id);
    socket.on("users:online", setOnlineUsers);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const sendMessage = (data) => socketRef.current?.emit("message:send", data);

  const onMessage = (cb) => {
    socketRef.current?.on("message:receive", cb);
    return () => socketRef.current?.off("message:receive", cb);
  };

  const onMessageSent = (cb) => {
    socketRef.current?.on("message:sent", cb);
    return () => socketRef.current?.off("message:sent", cb);
  };

  const emitTyping = (receiverId, isTyping) => {
    const event = isTyping ? "typing:start" : "typing:stop";
    socketRef.current?.emit(event, { senderId: user?.id, receiverId });
  };

  const onTyping = (cb) => {
    socketRef.current?.on("typing:start", cb);
    return () => socketRef.current?.off("typing:start", cb);
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, sendMessage, onMessage, onMessageSent, emitTyping, onTyping, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
