/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import React from 'react';
import userEvent from '@testing-library/user-event';
import RoomSelector from '../components/ChatRoomManager/NewChatRoomForm';
import { render, screen, act } from '@testing-library/react';
import { ChatContext } from '../context/ChatContext';

const mockChatContext = {
  joinRoom: jest.fn(),
};
const mockHandleBackgroundColor = jest.fn();
const mockSetSelectorClosed = jest.fn();
const mockSetSelectorVisible = jest.fn();
const mockIsSelectorClosedTrue = true;
const mockIsSelectorClosedFalse = false;
const mockIsSelectorVisible = true;

describe('New Chat Room Form', () => {
  jest.setTimeout(30000);
  it('should show the plus button if selectedClosed is true', async () => {
    jest.setTimeout(30000);
    render(
      <ChatContext.Provider value={mockChatContext}>
        <RoomSelector
          handleBackgroundColor={mockHandleBackgroundColor}
          setSelectorClosed={mockSetSelectorClosed}
          setSelectorVisible={mockSetSelectorVisible}
          isSelectorClosed={mockIsSelectorClosedTrue}
          isSelectorVisible={mockIsSelectorVisible}
        />
      </ChatContext.Provider>
    );

    const plusButton = await screen.findByTestId(
      'plus-button',
      {},
      { timeout: 20000 }
    );

    expect(plusButton).toBeTruthy();
  });

  it('input should update the room state', async () => {
    jest.setTimeout(30000);
    render(
      <ChatContext.Provider value={mockChatContext}>
        <RoomSelector
          handleBackgroundColor={mockHandleBackgroundColor}
          setSelectorClosed={mockSetSelectorClosed}
          setSelectorVisible={mockSetSelectorVisible}
          isSelectorClosed={mockIsSelectorClosedFalse}
          isSelectorVisible={mockIsSelectorVisible}
        />
      </ChatContext.Provider>
    );

    const testInput = 'Fiddle Faddle';

    const input = await screen.findByTestId(
      'room-input',
      {},
      { timeout: 20000 }
    );

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      userEvent.type(input, testInput);
    });

    const roomNameState = input.value;
    expect(roomNameState).toBe(testInput);
  });

  it('should call joinRoom function with the correct room name', async () => {
    jest.setTimeout(30000);
    render(
      <ChatContext.Provider value={mockChatContext}>
        <RoomSelector
          handleBackgroundColor={mockHandleBackgroundColor}
          setSelectorClosed={mockSetSelectorClosed}
          setSelectorVisible={mockSetSelectorVisible}
          isSelectorClosed={mockIsSelectorClosedFalse}
          isSelectorVisible={mockIsSelectorVisible}
        />
      </ChatContext.Provider>
    );

    const testRoomName = 'Meat Pies!';
    const input = await screen.findByTestId(
      'room-input',
      {},
      { timeout: 5000 }
    );
    const join = await screen.findByTestId(
      'join-button',
      {},
      { timeout: 5000 }
    );

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      userEvent.type(input, testRoomName);
      userEvent.click(join);
    });

    expect(mockChatContext.joinRoom).toHaveBeenCalledWith(testRoomName);
  });
});
