import { Socket } from 'socket.io';
import { io } from '../server';
import { ioConnect } from '../controllers/socketListeners';
import { ClientSocketType } from '../models/types';
import { db } from '../models/chatroomModel';

import { createMockClientSocket } from './mockSocket';
import { mockChatRoom, mockEmptyChatRoom, mockChatRoomsArray } from './mocks';

import {
  handleCreateRoom,
  handleJoinRoom,
  handleLeaveRoom,
  handleDisconnect
} from '../controllers/socketHandlers';


let clientSocket: ClientSocketType;


beforeAll((done) => {
  clientSocket = createMockClientSocket('test_socket');
  ioConnect(io);
  clientSocket.on('connect', done);
});

afterAll(() => {
  io.close();
  clientSocket.close();
});


describe('WebSocket Server Test', () => {

  it('should emit event and client should listen', (done) => {
    clientSocket.on('hello', (arg: any) => {
      expect(arg).toBe('world');
      done();
    });
    io.emit('hello', 'world');
    if (clientSocket.listeners['hello']) {
      clientSocket.listeners['hello']('world');
    }
  });

});


describe('Test function \'handleCreateRoom\'', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    db.findChatroom = jest.fn().mockResolvedValue(null);
    db.createChatroom = jest.fn().mockResolvedValue(null);
    db.getAllChatrooms = jest.fn().mockResolvedValue(mockChatRoomsArray);
    io.emit = jest.fn();
  });

  it('should create a new chatroom if it does not exist', async () => {
    await handleCreateRoom(mockChatRoom);
    expect(db.findChatroom).toHaveBeenCalledWith(mockChatRoom.name);
    expect(db.createChatroom).toHaveBeenCalledWith(mockChatRoom);
    expect(db.getAllChatrooms).toHaveBeenCalled();
    expect(io.emit).toHaveBeenCalledWith('update_chatrooms', mockChatRoomsArray);
  });

  it('should not create a new chatroom if it already exists', async () => {
    jest.spyOn(db, 'findChatroom').mockResolvedValue(Promise.resolve(mockChatRoom));
    await handleCreateRoom(mockChatRoom);
    expect(db.findChatroom).toHaveBeenCalledWith(mockChatRoom.name);
    expect(db.createChatroom).not.toHaveBeenCalled();
    expect(db.getAllChatrooms).toHaveBeenCalled();
    expect(io.emit).toHaveBeenCalledWith('update_chatrooms', mockChatRoomsArray);
  });

});


describe('Test function \'handleJoinRoom\'', () => {

  let mockSocket: any;
  
  beforeEach(() => {
    mockSocket = createMockClientSocket('test_socket_123');
    jest.clearAllMocks();
    db.findChatroom = jest.fn().mockResolvedValue(mockChatRoom);
    db.updateChatroom = jest.fn().mockResolvedValue(null);
    io.emit = jest.fn();
  });

  it('should join an existing room and emit \'user_join\'', async () => {
    const originalMockChatRoom = { ...mockChatRoom };
    await handleJoinRoom(mockChatRoom.name, mockSocket as Socket);
    expect(mockSocket.join).toHaveBeenCalledWith(mockChatRoom.name);
    expect(db.updateChatroom).toHaveBeenCalledWith(mockChatRoom.name, {
      ...originalMockChatRoom,
      users: originalMockChatRoom.users + 1,
    });
    expect(mockChatRoom?.usernames).toContain(mockSocket.id);
    expect(io.emit).toHaveBeenCalledWith('user_join', {
      room: mockChatRoom.name,
      username: mockSocket.id,
      userCount: originalMockChatRoom.users + 1,
      usernames: mockChatRoom.usernames
    });
  });

  // it('should emit \'joined_empty_room\' if the user is the only one in the room', async () => {
  //   db.findChatroom = jest.fn().mockResolvedValue(mockEmptyChatRoom);
  //   await handleJoinRoom(mockEmptyChatRoom.name, mockSocket as Socket);
  //   expect(mockSocket.emit).toHaveBeenCalledWith('joined_empty_room', {
  //     room: mockEmptyChatRoom.name,
  //   });
  // });
  
  it('should not join the room if it does not exist', async () => {
    db.findChatroom = jest.fn().mockResolvedValue(null);
    await handleJoinRoom('nonexistentRoom', mockSocket as Socket);
    expect(mockSocket.join).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

});

describe('Test function \'handleLeaveRoom\'', () => {

  let mockSocket: any;

  beforeEach(() => {
    mockSocket = createMockClientSocket('test_socket_123');
    jest.clearAllMocks();
    db.findChatroom = jest.fn().mockResolvedValue(mockChatRoom);
    db.updateChatroom = jest.fn().mockResolvedValue(null);
    io.emit = jest.fn();
    io.to = jest.fn().mockReturnValue({ emit: jest.fn() });
  });

  it('should leave an existing room and emit \'user_leaves\'', async () => {
    const originalMockChatRoom = { ...mockChatRoom };
    await handleLeaveRoom(mockChatRoom.name, mockSocket as Socket);
    expect(mockSocket.leave).toHaveBeenCalledWith(mockChatRoom.name);
    expect(mockChatRoom?.usernames).not.toContain(mockSocket.id);
    expect(io.emit).toHaveBeenCalledWith('user_leaves', {
      room: mockChatRoom.name,
      username: mockSocket.id,
      userCount: originalMockChatRoom.users - 1,
      usernames: mockChatRoom.usernames
    });
  });

  // it('should delete the room if no users are left', async () => {
  //   mockChatRoom.users = 1;
  //   await handleLeaveRoom(mockChatRoom.name, mockSocket as Socket);
  //   // expect(db.deleteChatroom).toHaveBeenCalledWith(mockChatRoom.name);
  //   expect(io.emit).toHaveBeenCalledWith('update_chatrooms', mockChatRoomsArray.filter(room => room.name !== mockChatRoom.name));
  //   // expect(io.emit).toHaveBeenCalledWith('update_chatrooms', []);
  // });

});


describe('Test function \'handleDisconnect\'', () => {

  // let mockSocket: any;

  // beforeEach(() => {
  //   mockSocket = createMockClientSocket('test_socket_123');
  //   jest.clearAllMocks();
  //   db.findChatroomsBySocketId = jest.fn().mockResolvedValue(mockChatRoomsArray);
  //   db.updateChatroom = jest.fn().mockResolvedValue(null);
  //   io.emit = jest.fn();
  //   io.to = jest.fn().mockReturnValue({ emit: jest.fn() });
  //   mockSocket.to = jest.fn().mockReturnThis();
  //   mockSocket.emit = jest.fn();
  //   jest.spyOn(db, 'deleteChatroom').mockImplementation(async () => {});
  // });

  // it('should handle socket disconnecting correctly', async () => {
  //   await handleDisconnect(mockSocket as Socket);
  //   mockChatRoomsArray.forEach(chatroom => {
  //     expect(chatroom.users).toBeLessThan(3);
  //     expect(chatroom.usernames).not.toContain(mockSocket.id);
  //   });
  //   console.log(mockChatRoomsArray)
  //   // expect(db.updateChatroom).toHaveBeenCalledTimes(mockChatRoomsArray.length);
  //   // expect(mockSocket.to).toHaveBeenCalledTimes(mockChatRoomsArray.length);
  //   // expect(mockSocket.emit).toHaveBeenCalledWith('user_geht', expect.anything());
  //   // expect(db.deleteChatroom).toHaveBeenCalledWith(mockChatRoom.name);
  //   // expect(mockSocket.emit).toHaveBeenCalledWith('update_chatrooms', expect.anything());
  // });

});

