/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import React from 'react';
import userEvent from '@testing-library/user-event';
import RoomList from '../components/ChatRoomManager/ChatRoomMarquee';
import { render, screen } from '@testing-library/react';
import { ChatContext } from '../context/ChatContext';

const mockHandleBackgroundColor = jest.fn();
const mockSetSelectorVisible = jest.fn();
const mockSetSelectorClosed = jest.fn();

const mockChatContext = {
  chatrooms: [
    { name: 'Fiddle Faddle' },
    { name: 'Testing' },
    { name: 'Pf4ffing' },
  ],
  joinRoom: jest.fn(),
};

describe('Room List component', () => {
  it('should render an array of chatrooms as buttons', async () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <RoomList
          handleBackgroundColor={mockHandleBackgroundColor}
          setSelectorClosed={mockSetSelectorClosed}
          setSelectorVisible={mockSetSelectorVisible}
        />
      </ChatContext.Provider>
    );

    const buttons = screen.getAllByRole('button');
    const chatroomNames = mockChatContext.chatrooms.map((room) => room.name);
    const buttonsContent = buttons.map((button) => button.textContent);

    expect(buttonsContent).toEqual(chatroomNames);
  });

  it('should call the join room function with the correct name', async () => {
    render(
      <ChatContext.Provider value={mockChatContext}>
        <RoomList handleBackgroundColor={mockHandleBackgroundColor} />
      </ChatContext.Provider>
    );

    const roomName = screen.getByText(mockChatContext.chatrooms[0].name);

    userEvent.click(roomName);

    expect(mockChatContext.joinRoom).toHaveBeenCalledWith(roomName.textContent);
  });
});
