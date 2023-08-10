import { ClientSocketType } from '../models/types';


const createMockClientSocket = (id: string): ClientSocketType => {
  return {
    id: id,
    connected: false,
    listeners: {},
    on: function (event: string, callback: Function) {
      if (event === 'connect') {
        this.connected = true;
        callback();
      }
      this.listeners[event] = callback;
    },
    emit: jest.fn(),
    join: jest.fn(),
    disconnect: function () {
      if (this.connected) {
        this.connected = false;
        if (this.listeners['disconnect']) {
          this.listeners['disconnect']();
        }
      }
    },
    close: function() {
      this.connected = false;
    }
  };
};

export { createMockClientSocket };
