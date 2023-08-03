import { createContext, useState } from "react";

type MessageContextType = {
  message: string;
  setMessage: (message: string) => void;
  messageList: string[];
  setMessageList: (list: string[]) => void;
  sendMessage: (room: any) => void;
  handleRoomButtonClick: (roomName: string) => void;
};

const defaultContext: MessageContextType = {
  message: "defaultMessage",
  setMessage: (message: string) => { },
  messageList: [],
  setMessageList: (list: string[]) => { },
  sendMessage: (room: any) => { },
  handleRoomButtonClick: (roomName: string) => { }
};

const MessageContext = createContext<MessageContextType>(defaultContext);

type IMessageProviderProps = {
  children: React.ReactNode;
};

function MessageProvider ({ children }: IMessageProviderProps) {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const value = { message: "" };
  return (
    < MessageContext.Provider value={value} >
      {children}
    </ MessageContext.Provider>
  );
}

export { MessageContext, MessageProvider };
