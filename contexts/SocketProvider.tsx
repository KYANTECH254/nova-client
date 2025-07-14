"use client";
import ErrorComponent from "@/components/Error";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [Error, setError] = useState("")

  useEffect(() => {
    const socketInstance: Socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`, {
      transports: ["websocket"], 
      reconnectionAttempts: 5, 
    });

    socketInstance.on("connect", () => {
      setError("");
      console.log("Connected to websocket");
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", () => {
      setError("Failed to Connect to websocket");
      console.log("Failed to Connect to websocket");
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  if (Error) {
    return <ErrorComponent message={Error} />;
  }
  
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
