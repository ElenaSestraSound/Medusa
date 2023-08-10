import { Socket } from 'socket.io';
import { io } from '../server';

import { ChatRoom, UserData } from '../models/types';

import { db } from '../models/chatroomModel';

async function handleCreateRoom(chatroom: ChatRoom) {
  const existingRoom = await db.findChatroom(chatroom.name);
  if (!existingRoom) {
    await db.createChatroom(chatroom);
  }

  const chatrooms = await db.getAllChatrooms();
  io.emit('update_chatrooms', chatrooms);

  return chatrooms;
}

async function handleJoinRoom(roomName: string, socket: Socket) {
  const chatroom = await db.findChatroom(roomName);
  if (!chatroom) return;

  socket.join(chatroom.name);
  chatroom.users += 1;
  chatroom.usernames.push(socket.id);
  await db.updateChatroom(roomName, chatroom);

  io.emit('user_join', {
    room: chatroom.name,
    username: socket.id,
    userCount: chatroom.users,
    usernames: chatroom.usernames,
  } as UserData);

  if (chatroom.users <= 1) {
    io.emit('joined_empty_room', {
      room: chatroom.name,
    });
  }
}

async function handleLeaveRoom(roomName: string, socket: Socket) {
  socket.leave(roomName);

  const chatroom = await db.findChatroom(roomName);
  if (!chatroom) return;

  chatroom.users--;
  chatroom.usernames = chatroom.usernames.filter(
    (username: string) => username !== socket.id
  );
  await db.updateChatroom(roomName, chatroom);

  io.emit('user_leaves', {
    room: chatroom.name,
    username: socket.id,
    userCount: chatroom.users,
    usernames: chatroom.usernames,
  });
  const messageDetails = {
    room: roomName,
    user: socket.id,
  };
  io.to(roomName).emit('notify_user_left', messageDetails);

  if (chatroom.users < 1) {
    await db.deleteChatroom(chatroom.name);

    io.emit('update_chatrooms', await db.getAllChatrooms());
  }
}

async function handleDisconnect(socket: Socket) {
  const chatrooms = await db.findChatroomsBySocketId(socket.id);
  for (const chatroom of chatrooms) {
    chatroom.users--;
    chatroom.usernames = chatroom.usernames.filter(
      (username: string) => username !== socket.id
    );
    await db.updateChatroom(chatroom.name, chatroom);

    socket.to(chatroom.name).emit('user_geht', {
      room: chatroom.name,
      username: socket.id,
      userCount: chatroom.users,
      usernames: chatroom.usernames,
    });

    if (chatroom.users < 1) {
      await db.deleteChatroom(chatroom.name);
      socket.emit('update_chatrooms', await db.getAllChatrooms());
    }
  }
}

export { handleCreateRoom, handleJoinRoom, handleLeaveRoom, handleDisconnect };
