import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import ChatBoxInput from './ChatBoxInput';
import ChatBoxHeader from './ChatBoxHeader';
import { ChatContextType } from '../../context/ContextTypes';
import useWindowMove from '../../hooks/useWindowMove';
import { Message } from '../types';
import { getRandomColor } from '../../utils';
import useRandomUserNameColor from '../../hooks/useRandomUserNameColor';

type IChatBoxProps = {
  messageList: Message[],
  sendMessage: (roomName: string, message: string) => void;
  roomName: string,
  socketId: string,
  handleBackgroundColor: () => void;
};

export function ChatBox ({ messageList, sendMessage, roomName, socketId, handleBackgroundColor }: IChatBoxProps) {
  const { leaveRoom } = useContext(ChatContext) as ChatContextType;
  const { position, handleMouseDown, handleMouseMove, handleMouseUp } = useWindowMove();
  const { getColor } = useRandomUserNameColor(socketId);

  // MESSAGE FUNCTIONALITY
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
      <div
        className='MessageContainer'
        style={{ position: 'absolute', ...position }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}>
        <ChatBoxHeader roomName={roomName} leaveRoom={handleLeaveRoom} />

        <div className='ChatWindow'>
          <div className='MessageWrapper'>
            {messageList
              .filter((messageContent) => messageContent.roomName === roomName)
              .map((messageContent, i) => (
                <div className={`Message ${messageContent.user === socketId ? 'me' : 'other'}`} key={i}>
                  <div
                    className='User_Time'
                    style={{ color: getColor(messageContent.user) }}
                  >
                    {messageContent.user === socketId
                      ? 'You'
                      : `User ${messageContent.user.substring(0, 5)}`}
                    , {messageContent.time}
                  </div>

                  <div className='MessageContent'>{messageContent.message}</div>
                  <div ref={messagesEndRef}></div>
                </div>
              ))}
          </div>

          <ChatBoxInput sendMessage={handleSendMessage} />
        </div>
      </div>
    </>
  );
}
