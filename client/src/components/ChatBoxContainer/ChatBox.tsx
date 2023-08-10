import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import ChatBoxInput from './ChatBoxInput';
import ChatBoxHeader from './ChatBoxHeader';
import { ChatContextType } from '../../context/ContextTypes';
import { Message } from '../types';
import useRandomUserNameColor from '../../hooks/useRandomUserNameColor';
import { calculateLeft, calculateTop } from '../../utils';
import ResizableDraggableComponent from './ResizableComponent';

type IChatBoxProps = {
  messageList: Message[];
  sendMessage: (roomName: string, message: string) => void;
  roomName: string;
  socketId: string;
  handleBackgroundColor: () => void;
  bgColor: string;
};

export default function ChatBox({
  bgColor,
  messageList,
  sendMessage,
  roomName,
  socketId,
  handleBackgroundColor,
}: IChatBoxProps) {
  const [position, setPosition] = useState({ top: '-1000px', left: '-1000px' });
  const { leaveRoom } = useContext(ChatContext) as ChatContextType;
  const { getColor } = useRandomUserNameColor(socketId);

  useEffect(() => {
    setPosition({ top: calculateTop(), left: calculateLeft() });
  }, []);

  const handleSendMessage = (message: string) => {
    sendMessage(roomName, message);
  };

  const handleLeaveRoom = () => {
    handleBackgroundColor();
    leaveRoom(roomName);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  return (
    <>
      <ResizableDraggableComponent
        position={position}
        data-testid='message-container'>
        <ChatBoxHeader roomName={roomName} leaveRoom={handleLeaveRoom} />
        <div style={{ height: '90%' }}>
          <div className='flex-col p-2 pb-[50px] max-h-full overflow-y-scroll hide-scrollbar'>
            {messageList
              .filter((messageContent) => messageContent.roomName === roomName)
              .map((messageContent, i) => (
                <div
                  className={`Message ${
                    messageContent.user === socketId ? 'me' : 'other'
                  }`}
                  key={i}>
                  <div
                    className='mb-1 text-xs'
                    style={{ color: getColor(messageContent.user) }}>
                    {messageContent.user === socketId
                      ? 'You'
                      : `User ${messageContent.user.substring(0, 5)}`}
                    , {messageContent.time}
                  </div>

                  <div
                    className='text-sm mb-2 font-normal break-words'
                    data-testid={`message-content`}>
                    {messageContent.message}
                  </div>
                  <div ref={messagesEndRef}></div>
                </div>
              ))}
          </div>
        </div>
        {/* <div style={{ backgroundColor: bgColor }}> */}
          <ChatBoxInput bgColor={bgColor} sendMessage={handleSendMessage} />
        {/* </div> */}
      </ResizableDraggableComponent>
    </>
  );
}
