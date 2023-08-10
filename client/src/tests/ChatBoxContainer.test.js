/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatContext } from '../context/ChatContext';
import ChatBoxContainer from '../components/ChatBoxContainer/ChatBoxContainer';

const mockHandleBackgroundColor = jest.fn();
const mockChatContext = {
  userRoomList: {
    rooms: [
      { name: 'Fiddle Faddle' },
      { name: 'Testing' },
      { name: 'Pf4ffing' },
    ],
  },
  socket: 'socket_',
};

describe('Chat box container', () => {
  it('should render a list of chat boxes', () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <ChatBoxContainer handleBackgroundColor={mockHandleBackgroundColor} />
      </ChatContext.Provider>
    );
    const chatBoxElements = screen.getAllByTestId('chat-list');

    expect(chatBoxElements.length).toBe(
      mockChatContext.userRoomList.rooms.length
    );
  });
});
