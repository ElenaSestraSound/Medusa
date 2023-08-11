type Message = {
  user: string;
  roomName: string;
  message: string;
  time: string;
};

type UserData = {
  username: string;
  usernames: string[];
  userCount: number;
  room: string;
};

type ChatRoom = {
  name: string;
  users: number;
  usernames: string[];
  creator: string;
};

type ClientSocketType = {
  id: string | null;
  connected: boolean;
  listeners: { [key: string]: Function };
  on: (event: string, callback: Function) => void;
  emit: (event: string, message: any) => void;
  join: (roomName: string) => void;
  leave: (roomName: string) => void;
  disconnect: () => void;
  close: () => void;
};


export { Message, UserData, ChatRoom, ClientSocketType };
