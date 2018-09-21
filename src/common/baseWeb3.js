import Web3Service from 'communicationServices/web3';
import EventBus from 'common/EventBus';

const IPC_CONNECTION_CLOSED = 'Error: IPC socket connection closed';
const IPC_COULD_NOT_CONNECT = 'Error: CONNECTION ERROR: Couldn\'t connect to node on IPC.';
const CONNECTION_ERRORS = [IPC_CONNECTION_CLOSED, IPC_COULD_NOT_CONNECT];

let webServices = null;

export default class BaseWeb3 {

    constructor() {
        this.connectionStatus = false;
    }

    initWeb3Services() {
        return new Promise((resolve) => {
           this.connectToIPC(resolve);
        });
    }

    connectToIPC(resolve) {
        webServices = new Web3Service();

        const subscription = this.eth.subscribe('newBlockHeaders', (error, data) => {
            if (!error) {
                resolve();
                EventBus.emit('Web3ConnectionStatus', true);
                EventBus.emit('Web3NewBlockHeaders', data);
            } else {
                this.connectionErrorHandling(subscription, error.toString(), resolve);
            }
        });
    }

    connectionErrorHandling(subscription, error, resolve) {
        if (CONNECTION_ERRORS.values(error)) {
            EventBus.emit('Web3ConnectionStatus', false);
            if (IPC_COULD_NOT_CONNECT === error) {
                setTimeout(() => {
                    subscription.unsubscribe(function(error, success) {
                        if (success) {
                            console.log('Successfully unsubscribed!');
                        }
                    });
                    this.connectToIPC(resolve);
                }, 5000);
            }
        }
    }

    get eth() {
        return webServices.web3.eth;
    }

    get web3() {
        return webServices.web3;
    }

    get utils() {
        return webServices.web3.utils;
    }

}