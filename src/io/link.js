const JSONRPC = require('../util/jsonrpc');

const linkHeartbeatInterval = 2000;

class Link extends JSONRPC {
    /**
     * A serialport peripheral socket object.  It handles connecting, over web sockets, to
     * serialport peripherals, and reading and writing data to them.
     * @param {Runtime} runtime - the Runtime for sending/receiving GUI update events.
     * @param {object} connectCallback - a callback for connection.
     * @param {object} resetCallback - a callback for resetting extension state.
     */
    constructor (runtime, connectCallback = null, resetCallback = null) {
        super();

        this._socket = runtime.getScratchLinkSocket('STATUS');
        this._socket.setOnOpen(this.getLinkStatus.bind(this));
        this._socket.setOnClose(this.handleDisconnectError.bind(this));
        this._socket.setOnError(this._handleRequestError.bind(this));
        this._socket.setHandleMessage(this._handleMessage.bind(this));

        this._sendMessage = this._socket.sendMessage.bind(this._socket);

        this._connectCallback = connectCallback;
        this._connected = false;
        this._onMessage = null;
        this._resetCallback = resetCallback;
        this._getLinkStatusIntervalID = null;
        this._reconnectedIntervalID = null;
        this._runtime = runtime;

        this.connect();
    }

    /**
     * Request connection to the Scratch Arduino Link.
     * If the web socket is not yet open, request when the socket promise resolves.
     */
    getLinkStatus () {
        if (this._connected) {
            window.clearInterval(this._reconnectedIntervalID);
            this._getLinkStatusIntervalID = window.setInterval(() => {
                this.sendRemoteRequest('status')
                    .catch(e => {
                        this._handleRequestError(e);
                    });
            }, linkHeartbeatInterval);
        }
    }

    /**
     * Handle a received call from the socket.
     * @return {object} - optional return value.
     */
    didReceiveCall (method, params) {
        switch (method) {
            case 'status':
                if (params.result == 'ok') {
                    this._runtime.emit(
                        this._runtime.constructor.LINK_CONNECTED,
                    );
                }
                break;
            default:
                this._runtime.emit(
                    this._runtime.constructor.LINK_DISCONNECTED,
                );
        }
    }

    connect () {
        this._reconnectedIntervalID = window.setInterval(() => {
            if (!this._connected) {
                this._socket.open();
                this._connected = true;
            }
        }, linkHeartbeatInterval);
    }

    /**
     * Close the websocket and call connect()
     */
    disconnect () {
        window.clearInterval(this._getLinkStatusIntervalID);
        this._connected = false;

        this._runtime.emit(this._runtime.constructor.LINK_DISCONNECTED);
        this.connect();
    }

    /**
     * Handle an error resulting from losing connection to socket.
     * reset callback, call it. Finally, emit an link disconnected to the runtime.
     */
    handleDisconnectError (/* e */) {
        this.disconnect();
    }

    _handleRequestError (/* e */) {
        this.disconnect();
    }

    _handleDiscoverTimeout () {
        this.disconnect();
    }
}

module.exports = Link;
