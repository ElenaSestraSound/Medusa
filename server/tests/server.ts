import request from 'supertest';
import mongoose, { Document } from 'mongoose';
import { io, app } from '../server';
import { connectToDatabase } from '../models/index';
import { Chatroom } from '../models/ChatroomSchema';
import { mockChatRoom, mockChatRoomsArray } from './mocks';
import { db } from '../models/chatroomModel';
import { handleCreateRoom } from '../controllers/socketHandlers';


beforeAll((done) => {
  connectToDatabase()
    .then(() => {
      console.log('database connected');
      done();
    })
    .catch((error: Error) => {
      console.error('MongoDB connection error:', error);
      done(error);
    });
});

afterAll((done) => {
  mongoose.disconnect()
    .then(() => {
      console.log('database disconnected');
      io.close();
      done();
    })
    .catch((error) => {
      console.error('Failed to disconnect from database:', error);
      io.close();
      done(error);
    });
});


describe('Test server connection', () => {

  it('should return 404, when accessing an unknown endpoint', async () => {
    const response = await request(app).get('/unknown');
    expect(response.statusCode).toBe(404);
  });

  it('should return 200, when accessing /chatrooms endpoint', async () => {
    const response = await request(app).get('/chatrooms');
    expect(response.statusCode).toBe(200);
  })

});


describe('Test database connection', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should establish a connection to the MongoDB database', (done) => {
    if (mongoose.connection.readyState === 1) {
      expect(mongoose.connection.readyState).toBe(1);
      done();
    } else {
      mongoose.connection.on('connected', () => {
        expect(mongoose.connection.readyState).toBe(1);
        done();
      });
      mongoose.connection.on('error', (error) => {
        done(error);
      });
    }
  });

  it('should handle a MongoDB connection error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('Mock error'));
    await expect(connectToDatabase()).rejects.toThrow('Mock error');
    expect(errorSpy).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
  });

});


describe('Test router endpoints', () => {

  it('should create a new chatroom', async () => {
      const response = await request(app)
        .post('/chatrooms')
        .send({ name: mockChatRoom.name })
        .expect(201);
      expect(response.body.name).toEqual(mockChatRoom.name);
      if (response.body._id) {
        await Chatroom.findByIdAndDelete(response.body._id);
      }
  });
  
  it('should fetch all chatrooms', async () => {
    const response = await request(app)
      .get('/chatrooms')
      .expect(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should handle errors when creating a chatroom', async () => {
    const saveMock = jest.spyOn(Chatroom.prototype, 'save').mockRejectedValue(new Error('Database error'));
    const response = await request(app)
      .post('/chatrooms')
      .send({ name: mockChatRoom.name })
      .expect(500);
    expect(response.body.success).toBe(false);
    expect(response.body.status).toBe(500);
    expect(response.body.message).toBe('Database error');
    saveMock.mockRestore();
  });

  it('should handle errors when fetching chatrooms', async () => {
    const findMock = jest.spyOn(Chatroom, 'find').mockRejectedValue(new Error('Database error'));
    const response = await request(app)
      .get('/chatrooms')
      .expect(500);
    expect(response.body.success).toBe(false);
    expect(response.body.status).toBe(500);
    expect(response.body.message).toBe('Database error');
    findMock.mockRestore();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

});


describe('Test chatroom model', () => {

  it('should match chatroom schema', async () => {
    let savedChatroom: Document | null = null;
  
    try {
      const validChatroom = new Chatroom(mockChatRoom);
      savedChatroom = await validChatroom.save();
  
      expect(savedChatroom._id).toBeDefined();
      expect(savedChatroom.get('name')).toBe(mockChatRoom.name);
      expect(savedChatroom.get('users')).toBe(mockChatRoom.users);
      expect(savedChatroom.get('usernames')).toStrictEqual(mockChatRoom.usernames);
      expect(savedChatroom.get('creator')).toBe(mockChatRoom.creator);
    }
    finally {
      if (savedChatroom?._id) {
        await Chatroom.findByIdAndDelete(savedChatroom._id);
      }
    }
  });
});
  

describe('Test database functions', () => {

  it('should find chatrooms by socket id', async () => {
    jest.spyOn(Chatroom, 'find').mockResolvedValueOnce(mockChatRoomsArray);
    const socketId = 'test_socketId_1';
    const foundRooms = await db.findChatroomsBySocketId(socketId);
    expect(Chatroom.find).toHaveBeenCalledWith({ usernames: socketId });
    expect(foundRooms).toEqual(mockChatRoomsArray);
  });

  it('should create a chatroom', async () => {
    let createdRoom = null;
    try {
      await db.createChatroom(mockChatRoom);
      createdRoom = await Chatroom.findOne({ name: mockChatRoom.name });
      expect(createdRoom).not.toBeNull();    
    } catch (err) {
      throw err;
    }
  });

  it('should find a chatroom by name', async () => {
    let foundRoom = null;
    try {
      foundRoom = await db.findChatroom(mockChatRoom.name);
      expect(foundRoom).toMatchObject(mockChatRoom);
    } catch (err) {
      throw err;
    }
  });

  it('should update a chatroom', async () => {
    let updatedRoom = null;
    try {
      await db.updateChatroom(mockChatRoom.name, { users: 4 });
      updatedRoom = await Chatroom.findOne({ name: mockChatRoom.name });
      expect(updatedRoom?.users).toBe(4);
    } catch (err) {
      throw err;
    }
  });

  it('should delete a chatroom by name', async () => {
    let deletedRoom = null;
    try {
      await db.deleteChatroom(mockChatRoom.name);
      deletedRoom = await Chatroom.findOne({ name: mockChatRoom.name });
      expect(deletedRoom).toBeNull();
    } catch (err) {
      throw err;
    }
  });

});


describe('Test socket handler functions', () => {

  it('should create a new chatroom and emit \'update_chatrooms\'', async () => {
    const emitSpy = jest.spyOn(io, 'emit');
    try {
      await handleCreateRoom(mockChatRoom);
      expect(emitSpy).toHaveBeenCalledWith('update_chatrooms', expect.arrayContaining([
        expect.objectContaining(mockChatRoom)
      ]));
    }
    finally {
      const createdRoom = await Chatroom.findOne({ name: mockChatRoom.name });
      if (createdRoom?._id) {
        await Chatroom.findByIdAndDelete(createdRoom._id);
      }
      emitSpy.mockRestore();
    }
  });
  
});

