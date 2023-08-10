import {
  isUserAlreadyInTheRoom,
  createNewRoom,
  getChatroomFromChatrooms,
  removeRoomFromUserRoomListState,
  addRoomToUserRoomListState,
  updateChatrooms,
} from '../context/helper';
const mockChatrooms = [
  {
    name: 'Testing1',
    usernames: ['user1, user2, user3'],
    users: 3,
    creator: 'user1',
  },
  {
    name: 'Testing2',
    usernames: ['user4, user2, user6'],
    users: 3,
    creator: 'user6',
  },
];

const mockUserRoomList = {
  rooms: mockChatrooms,
  socketId: '__socket1',
};
const mockCreator = 'user5';

const mockRoomName1 = 'Testing2';
const mockRoomName2 = 'Testing5';

describe('Helper functions', () => {
  test('if user is already in the room', () => {
    const found = isUserAlreadyInTheRoom(mockUserRoomList, mockRoomName1);
    const notFound = isUserAlreadyInTheRoom(mockUserRoomList, mockRoomName2);

    expect(found).toBeTruthy();
    expect(notFound).toBeFalsy();
  });
  test('Create new room', () => {
    const result = createNewRoom(mockRoomName1, mockCreator);
    expect(result).toStrictEqual({
      name: mockRoomName1,
      usernames: [],
      users: 0,
      creator: mockCreator,
    });
  });
  test('get Chatroom From Chatrooms', () => {
    const result = getChatroomFromChatrooms(mockChatrooms, 'Testing1');
    expect(result).toBeTruthy();
  });
  test('remove Room From User Room List State', () => {
    const result = removeRoomFromUserRoomListState(
      mockUserRoomList,
      'Testing1'
    );
    expect(result).toStrictEqual({
      rooms: [
        {
          name: 'Testing2',
          usernames: ['user4, user2, user6'],
          users: 3,
          creator: 'user6',
        },
      ],
      socketId: '__socket1',
    });
  });
  test('add Room To User Room List State', () => {
    const mockNewChatroom = {
      name: 'Testing10',
      usernames: ['user6', 'user7'],
      users: 2,
      creator: 'user6',
    };
    const result = addRoomToUserRoomListState(
      mockUserRoomList,
      mockNewChatroom
    );
    expect(result.rooms).toContain(mockNewChatroom);
    expect(result).not.toBe(mockUserRoomList);
  });
  test('update Chatrooms', () => {
    const mockUserData = {
      username: 'user12',
      usernames: [
        'user1',
        'user2',
        'user3',
        'user4',
        'user5',
        'user6',
        'user7',
        'user8',
      ],
      userCount: 8,
      room: 'Testing2',
    };
    const updatedChatrooms = updateChatrooms(mockChatrooms, mockUserData);

    // Assert that the chatroom with the specified name is updated correctly
    const updatedChatroom = updatedChatrooms.find(
      (chatroom) => chatroom.name === mockUserData.room
    );
    expect(updatedChatroom).toBeDefined();
    expect(updatedChatroom?.users).toBe(mockUserData.userCount);
    expect(updatedChatroom?.usernames).toEqual(mockUserData.usernames);

    // Assert that the other chatrooms remain unchanged
    const otherChatrooms = updatedChatrooms.filter(
      (chatroom) => chatroom.name !== mockUserData.room
    );
    expect(otherChatrooms).toEqual(
      mockChatrooms.filter((chatroom) => chatroom.name !== mockUserData.room)
    );
  });
});
