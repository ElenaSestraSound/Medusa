/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../components/ChatBoxContainer/ChatBoxInput';

describe('Chat input', () => {
  it('should call sendMessage function with the correct message', () => {
    const mockSendMessage = jest.fn();

    render(<ChatInput sendMessage={mockSendMessage} />);

    const inputElement = screen.getByTestId('message-input');
    const buttonElement = screen.getByTestId('send-button');

    const testMessage = 'Fiddle Faddle';

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      userEvent.type(inputElement, testMessage);
      userEvent.click(buttonElement);
    });

    expect(mockSendMessage).toHaveBeenCalledWith(testMessage);
    expect(inputElement.value).toBe('');
  });

  it('should update state as input changes', () => {
    const testInput = 'Pfaffaroo';

    render(<ChatInput sendMessage={() => {}} />);

    const inputElement = screen.getByTestId('message-input');
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      userEvent.type(inputElement, testInput);
    });
    expect(inputElement.value).toBe(testInput);
  });
});
