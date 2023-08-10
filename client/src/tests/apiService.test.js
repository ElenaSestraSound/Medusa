import { setupServer } from 'msw/node';
import fetchMock from 'jest-fetch-mock';

// Configure fetchMock to mock the fetch function
import { http } from '../apiService';

fetchMock.enableMocks();
const server = setupServer();
beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  fetchMock.enableMocks();
});

test('getChatRooms should return an array of chatrooms', async () => {
  // Mock the API response with a sample array of chatrooms
  const mockChatrooms = [
    { id: 1, name: 'Chatroom 1' },
    { id: 2, name: 'Chatroom 2' },
    { id: 3, name: 'Chatroom 3' },
  ];

  // Mock the fetch function to return the mockChatrooms
  fetchMock.mockResponse(JSON.stringify(mockChatrooms));

  // Call the function under test
  const result = await http.getChatRooms();

  // Assert that the result matches the expected mock chatrooms
  expect(result).toEqual(mockChatrooms);
});

test('getChatRooms should handle API errors and return an empty array', async () => {
  // Mock the API response with an error status code
  fetchMock.mockResponse('', { status: 500 });

  // Call the function under test
  const result = await http.getChatRooms();

  // Assert that the result is an empty array
  expect(result).toEqual([]);
});
