// @ts-nocheck
/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import React from 'react';
import ChatBox from '../components/ChatBoxContainer/ChatBox';
import { render, screen, waitFor } from '@testing-library/react';
import { ChatContext } from '../context/ChatContext';

const mockChatContext = {
  leaveRoom: jest.fn(),
};

const mockHandleBackgroundColor = jest.fn();
const mockSendMessage = jest.fn();
const mockRoomName = 'Testing';
const mockSocketId = 'socket_';
const mockBgColor = 'rgb(130,125,188)';
const mockMessageList = [
  {
    user: 'bob',
    roomName: 'Fiddle Faddle',
    message: 'hey hey hey',
    time: '15:40',
  },
  {
    user: 'alice',
    roomName: 'Fiddle Faddle',
    message: 'did you get that thing I sent you?',
    time: '15:56',
  },
];

describe('Chat Box', () => {
  it('should display messages in the chat window', async () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <ChatBox
          messageList={mockMessageList}
          roomName={mockRoomName}
          socketId={mockSocketId}
          sendMessage={mockSendMessage}
          handleBackgroundColor={mockHandleBackgroundColor}
          bgColor={mockBgColor}
        />
      </ChatContext.Provider>
    );

    await waitFor(() => {
      const messageContent = screen.getByText(mockMessageList[0].message);

      expect(messageContent).toBeTruthy();
    });
    await waitFor(() => {
      const messageContent = screen.getByText(mockMessageList[1].message);
      expect(messageContent).toBeTruthy();
    });
  });

  it('should display the user and the time of message', async () => {
    await render(
      <ChatContext.Provider value={mockChatContext}>
        <ChatBox
          messageList={mockMessageList}
          room={mockRoomName}
          socket={mockSocketId}
          sendMessage={mockSendMessage}
          handleBackgroundColor={mockHandleBackgroundColor}
        />
      </ChatContext.Provider>
    );

    const user = screen.getByText(mockMessageList[0].user);
    const time = screen.getByText(mockMessageList[1].time);

    expect(user).toBeTruthy();
    expect(time).toBeTruthy();
  });
});
