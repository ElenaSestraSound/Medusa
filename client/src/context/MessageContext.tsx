import { createContext, useEffect, useState } from "react";
import { ChatContext, ChatContextType, MessageType, RoomListType, RoomType } from "./ChatContext";
import { useContext } from "react";

type MessageContextType = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  messageList: MessageType[];
  setMessageList: React.Dispatch<React.SetStateAction<MessageType[]>>;
  sendMessage: (room: any) => Promise<void>;
  handleRoomButtonClick: (roomName: string) => void;
};

const MessageContext = createContext<MessageContextType | null>(null);

type IMessageProviderProps = {
  children: React.ReactNode;
};

function MessageProvider ({ children }: IMessageProviderProps) {
  const { socket, setRoom: setCurrentRoom, roomLists, setRoomLists } = useContext(ChatContext) as ChatContextType;
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState<MessageType[]>([]);

  function enterRoom (roomName: string) {
    const existingRoom = roomLists.some((list) =>
      list.rooms.some((room) => room.name === roomName)
    );

    if (existingRoom) {
      console.log("You are already in this room.");
      return;
    }
    setCurrentRoom(roomName);
    const roomData = {
      name: roomName,
      time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      creator: socket.id,
    };
    socket.emit("join_room", roomData);

    setRoomLists((prevRoomLists) => {
      const index = prevRoomLists.findIndex((list) => list.socketId === socket.id);
      const updatedRooms: RoomType[] = [
        ...prevRoomLists[index].rooms,
        { name: roomName, time: roomData.time },
      ];
      const updatedList: RoomListType = {
        socketId: socket.id,
        rooms: updatedRooms,
      };
      const updatedRoomLists = [...prevRoomLists];
      updatedRoomLists[index] = updatedList;

      console.log("Updated Rooms RoomList:", updatedRooms);

      return updatedRoomLists;
    });
  }

  const sendMessage = async (room: string) => {
    if (room !== "") {
      const messageData = {
        user: socket.id,
        room: room,
        message: message,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        sender: "me",
        socketId: socket.id
      };
      if (message !== "") {
        socket.emit("send_message", messageData);
        console.log('message sent:', messageData);
        setMessageList((list) => [...list, messageData]);
        setMessage("");
      }
    }
  };

  // USE EFFECTS
  // RECEIVE MESSAGE & JOIN EMPTY ROOM

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log('message received', data);
      const messageData = {
        ...data,
        sender: data.user === socket.id ? "me" : "other"
      };
      setMessageList((list) => [...list, messageData]);
      console.log('messageList', messageList);
    });

    socket.on('joined_empty_room', (data) => {
      console.log('joined_empty_room:', socket.id);
      const messageData = {
        user: socket.id,
        room: data.room,
        message: "Congrats, you are the first user that came up with this brilliant topic. Feel free, to wait for others to join you and in the meantime, maybe inspire yourself with what your friends talk about. ",
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        sender: "me",
        socketId: socket.id,
      };
      setMessageList((list) => [...list, messageData]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("joined_empty_room");
    };

  }, []);

  const value: MessageContextType = {
    message,
    setMessage,
    messageList,
    setMessageList,
    sendMessage,
    handleRoomButtonClick: enterRoom
  };
  return (
    < MessageContext.Provider value={value} >
      {children}
    </ MessageContext.Provider>
  );
}

export { MessageContext, MessageProvider };
