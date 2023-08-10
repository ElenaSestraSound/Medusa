import { ChatContext } from '../../context/ChatContext';
import { useContext, useState } from 'react';
import ChatBox from './ChatBox';
import { ChatContextType } from '../../context/ContextTypes';
import { createNewMessage, DEFAULT_MESSAGE } from '../helper';
import { socket } from '../../socket';
import { Message, MessageDetails } from '../types';
import { Event, useSocket } from '../../hooks/useSocket';
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

type IChatBoxListProps = {
  handleBackgroundColor: () => void;
  bgColor: string
};

export default function ChatBoxContainer({
  handleBackgroundColor,
  bgColor
}: IChatBoxListProps) {
  const { userRoomList } = useContext(ChatContext) as ChatContextType;
  const [messageList, setMessageList] = useState<Message[]>([]);
  const events: Event[] = [
    {
      name: 'receive_message',
      handler: (message: any) => {
        setMessageList((prevList: Message[]) => [...prevList, message]);
      },
    },
    {
      name: 'joined_empty_room',
      handler: () => {
        toast.success(DEFAULT_MESSAGE, {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      },
    },
    {
      name: 'notify_user_left',
      handler: (messageDetails: MessageDetails) => {
        const messsage = `User ${messageDetails.user} left the chatroom ${messageDetails.room}`;
        toast.info(messsage, {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      },
    },
  ];
  useSocket(events);

  const sendMessage = (roomName: string, message: string) => {
    if (roomName !== '' && message !== '') {
      const newMessage = createNewMessage(socket.id, message, roomName);
      socket.emit('send_message', newMessage);
      setMessageList((list) => [...list, newMessage]);
    }
  };

  return (
    <>
      <div>
        <ToastContainer />
        {userRoomList.rooms?.map((room) => (
          <div className='flex-col gap-2' key={room.name} data-testid='chat-list'>
            <ChatBox
              key={room.name}
              messageList={messageList}
              sendMessage={sendMessage}
              roomName={room.name}
              socketId={userRoomList.socketId}
              handleBackgroundColor={handleBackgroundColor}
              bgColor={bgColor}></ChatBox>
          </div>
        ))}
      </div>
    </>
  );
}
