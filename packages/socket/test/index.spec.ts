import * as tape from 'tape';
import { EmSocket } from '../src';

type CallbackOptions = {
  action: 'OPEN' | 'ERROR' | 'CLOSE' | 'MESSAGE';
  emSocket: EmSocket;
  event: any;
};

type ConnectOptions = {
  network: string;
  callback?: ({ action, event }: CallbackOptions) => void;
};

type ConnectResult = {
  _result: number;
  emSocket: EmSocket;
  event: any;
};

function connect({ network, callback }: ConnectOptions): Promise<ConnectResult> {
  let isInit = false;
  return new Promise((resolve) => {
    const emSocket = new EmSocket({ url: network });
    emSocket.setOpenListener((event: any) => {
      if (!isInit) {
        isInit = true;
        resolve({ _result: 0, emSocket, event });
      } else {
        typeof callback === 'function' && callback({ action: 'OPEN', emSocket, event });
      }
    });
    emSocket.setErrorListener((event: any) => {
      if (!isInit) {
        isInit = true;
        resolve({ _result: 1, emSocket, event });
      } else {
        typeof callback === 'function' && callback({ action: 'ERROR', emSocket, event });
      }
    });
    emSocket.setCloseListener((event: any) => {
      //closed
      typeof callback === 'function' && callback({ action: 'CLOSE', emSocket, event });
    });
    emSocket.addMessageListener((event: any) => {
      //received message evt.data
      typeof callback === 'function' && callback({ action: 'MESSAGE', emSocket, event });
    });
    emSocket.connect();
  });
}

async function initConnect() {
  const network = 'wss://oregon.edgematrix.xyz/edge_ws';
  const callback = ({ action, event }: CallbackOptions) => {
    //something for action
  };
  const { _result, emSocket, event } = await connect({ network, callback });
  return _result === 0 ? emSocket : null;
}

tape('EmSocket', function (t) {
  t.test('emSocket.connect()', async function (st) {
    const emSocket = await initConnect();
    emSocket && emSocket.close();
    st.isNotEqual(emSocket, null, 'connect is success');
    st.end();
  });
});
