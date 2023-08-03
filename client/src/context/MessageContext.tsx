import { Context, createContext, useState } from "react";
// import { ChatContext } from "./ChatContext";
import { useContext } from "react";
import { Socket, io } from "socket.io-client";

type MessageContextType = {
  message: string;
  setMessage: (message: string) => void;
  messageList: string[];
  setMessageList: (list: string[]) => void;
  sendMessage: (room: any) => void;
  enterRoom: (roomName: string) => void;
};

//remove when chat context is finished
type ChatContextType = {
  chatrooms: {
    name: string;
    users: string;
    usernames: string[];
  };
  roomLists: RoomListsType[];
  setRoom: (room: string) => void;
  setRoomLists: (f: (lists: RoomListsType[]) => RoomListsType[]) => void,
  socket: Socket;
};

type RoomType = {
  time: string;
  name: string;
};

type RoomListsType = {
  socketId: string;
  rooms: [{
    time: string;
    name: string;
  }];
};

const MessageContext = createContext<MessageContextType | null>(null);

type IMessageProviderProps = {
  children: React.ReactNode;
};

function MessageProvider ({ children }: IMessageProviderProps) {
  //remove when chat context is finished
  const dummyChatContext: ChatContextType = {
    chatrooms: {
      name: "",
      users: "",
      usernames: []
    },
    roomLists: {
      socketId: "",
      rooms: {
        time: "",
        name: ""
      }
    },
    setRoom: (room: string) => { },
    setRoomLists: () => { },
    socket: io()
  };
  // const { socket, setRoom, roomLists, setRoomLists } = useContext<ChatContextType>(ChatContext);
  const { socket, setRoom, roomLists, setRoomLists } = dummyChatContext;
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  function enterRoom (roomName: string) {
    const existingRoom = roomLists.some((list) =>
      list.rooms.some((room) => room.name === roomName)
    );

    if (existingRoom) {
      console.log("You are already in this room.");
      return;
    }
    setRoom(roomName);
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
      const updatedList: RoomListsType[] = [{
        socketId: socket.id,
        rooms: updatedRooms,
      }];
      const updatedRoomLists = [...prevRoomLists];
      updatedRoomLists[index] = updatedList;

      console.log("Updated Rooms RoomList:", updatedRooms);

      return updatedRoomLists;
    });
  }

  const sendMessage = async (room) => {
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
        await socket.emit("send_message", messageData);
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

  const value = { message: "" };
  return (
    < MessageContext.Provider value={value} >
      {children}
    </ MessageContext.Provider>
  );
}

export { MessageContext, MessageProvider };
