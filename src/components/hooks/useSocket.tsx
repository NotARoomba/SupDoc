import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import io, { Socket } from "socket.io-client";
import { useLoading } from "./useLoading";
import { useUser } from "./useUser";

export type SocketContextType = {
  connected: boolean;
};
const SocketContext = createContext<SocketContextType | undefined>(undefined);

type SocketProviderProps = {
  children: React.ReactNode;
};

export default function SocketProvider({ children }: SocketProviderProps) {
  const { t } = useTranslation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const { user } = useUser();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (user?.publicKey && !socket) {
      const s = io(process.env.EXPO_PUBLIC_API_URL, {
        query: {
          publicKey: user.publicKey,
        },
      });
      s.on("connect", () => {
        setConnected(true);
        setSocket(s);
        setLoading(false);
      });
      s.on("disconnect", () => {
        setConnected(false);
        setSocket(null);
        setLoading(false);
      });
    }
  }, [user]);

  const socketContextValue = useMemo(
    () => ({
      connected,
    }),
    [connected, socket],
  );
  return (
    <SocketContext.Provider value={socketContextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
