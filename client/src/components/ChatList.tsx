import Chat from './Messaging';
import { ChatContext } from '../context/ChatContext';
import { useContext } from 'react';
import { ChatContextType } from '../context/ChatContext';

function ChatList() {
  const { roomLists, socket } = useContext(ChatContext) as ChatContextType;

  const index = roomLists.findIndex((list) => list.socketId === socket.id);

  if (index === -1) {
    return;
  }

  return (
    <>
      <div>
        {roomLists[index].rooms.map((room) => (
          <div className='ChatList' key={room.name}>
            <Chat room={room.name} socket={socket}></Chat>
          </div>
        ))}
      </div>
    </>
  );
}

export default ChatList;
