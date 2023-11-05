const formatMessage = require('format-message');
const Buffer = require('buffer').Buffer;

const Serialport = require('../../io/serialport');
const Base64Util = require('../../util/base64-util');

const Firmata = require('../../lib/firmata/firmata');

/**
 * A string to report connect firmata timeout.
 * @type {formatMessage}
 */
const ConnectFirmataTimeout = formatMessage({
    id: 'arduinoPeripheral.connection.connectFirmataTimeout',
    default: 'Timeout when try to connect firmata, please download the firmware first',
    description: 'label for connect firmata timeout'
});

/**
 * A time interval to send firmata heartbeat(in milliseconds).
 */
const FrimataHeartbeatInterval = 2000;

/**
 * A time interval to wait (in milliseconds) before reporting to the serialport socket
 * that heartbeat has stopped coming from the peripheral.
 */
const FrimataHeartbeatTimeout = 5000;

/**
 * A time interval to wait deivce report data.
 */
const FrimataReadTimeout = 2000;

const Level = {
    High: 'HIGH',
    Low: 'LOW'
};

const Mode = {
    Input: 'INPUT',
    Output: 'OUTPUT',
    InputPullup: 'INPUT_PULLUP'
};

// sesor id
const Sensors = {
    LightSensor: 14,
    Accelerometer: 18,
    Temperature: 21,
    Buzzer: 3,
    IRdistance: 5,
    Linetracer: 7,
    IR: 9,
    RGBled: 25,
    Motor: 26,
    LedMatrix: 27 // 0x1b
};

const Directions = {
    Both: 0, Left: 1, Right: 2, Forward: 3, Backward: 4
};

const Colors = {
    Black: 0, White: 1,
    Red: 2, Green: 3, Blue: 4, Yellow: 5, Cyan: 6, Magenta: 7
};

/**
 * Manage communication with a Arduino peripheral over a Scratch Arduino Link client socket.
 */
class CoconutPeripheral{

    /**
     * Construct a Arduino communication object.
     * @param {Runtime} runtime - the Scratch Arduino runtime
     * @param {string} deviceId - the id of the peripheral
     * @param {string} originalDeviceId - the original id of the peripheral, like xxx_arduinoUno
     * @param {object} pnpidList - the pnp id of the peripheral
     * @param {object} serialConfig - the serial config of the peripheral
     * @param {object} diveceOpt - the device optione of the peripheral
     */
    constructor (runtime, deviceId, originalDeviceId, pnpidList, serialConfig, diveceOpt) {
        /**
         * The Scratch Arduino runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;

        this.pnpidList = pnpidList;
        this.serialConfig = serialConfig;
        this.diveceOpt = diveceOpt;

        /**
         * The serialport connection socket for reading/writing peripheral data.
         * @type {SERIALPORT}
         * @private
         */
        this._serialport = null;
        this._runtime.registerPeripheralExtension(deviceId, this);
        this._runtime.setRealtimeBaudrate(this.serialConfig.baudRate);

        /**
         * The id of the peripheral this peripheral belongs to.
         */
        this._deviceId = deviceId;

        this._originalDeviceId = originalDeviceId;

        /**
        * Pending data list. If busy is set when send, the data will push into this array to
        * waitting to be sended.
        */
        this._pendingData = [];

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);

        /**
         * Firmata connection.
         * @type {?Firmata}
         * @private
         */
        this._firmata = null;

        /**
         * Timeout ID for firmata get heartbeat timeout.
         * @type {number}
         * @private
         */
        this._firmataTimeoutID = null;

        /**
         * Interval ID for firmata send heartbeat.
         * @type {number}
         * @private
         */
        this._firmataIntervelID = null;

        /**
         * A flag that is true while firmata is conncted.
         * @type {boolean}
         * @private
         */
        this._isFirmataConnected = false;

        this._startHeartbeat = this._startHeartbeat.bind(this);
        this._listenHeartbeat = this._listenHeartbeat.bind(this);
        this._handleProgramModeUpdate = this._handleProgramModeUpdate.bind(this);
    }

    /**
     * Called by the runtime when user wants to upload code to a peripheral.
     * @param {string} code - the code want to upload.
     */
    upload (code) {
        const base64Str = Buffer.from(code).toString('base64');
        this._serialport.upload(base64Str, this.diveceOpt, 'base64');
    }

    /**
     * Called by the runtime when user wants to upload realtime firmware to a peripheral.
     */
    uploadFirmware () {
        this._stopHeartbeat();
        this._serialport.uploadFirmware(this.diveceOpt);
    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     * @param {Array.<string>} pnpidList - the array of pnp id list
     * @param {bool} listAll - wether list all connectable device
     */
    scan (pnpidList, listAll) {
        if (this._serialport) {
            this._serialport.disconnect();
        }
        this._serialport = new Serialport(this._runtime, this._originalDeviceId, {
            filters: {
                pnpid: listAll ? ['*'] : (pnpidList ? pnpidList : this.pnpidList)
            }
        }, this._onConnect, this.reset);
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     * @param {?number} baudrate - the baudrate.
     */
    connect (id, baudrate = null) {
        const config = Object.assign({}, this.serialConfig);
        if (baudrate) {
            config.baudRate = baudrate;
        }
        if (this._serialport) {
            this._serialport.connectPeripheral(id, {config: config});
        }
    }

    /**
     * Disconnect from the peripheral.
     */
    disconnect () {
        if (this._serialport) {
            this._serialport.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset () {
        if (this._firmata) {
            this._firmata.removeListener('reportversion', this._listenHeartbeat);
            delete this._firmata;
        }
        this._stopHeartbeat();
        this._runtime.removeListener(this._runtime.constructor.PROGRAM_MODE_UPDATE, this._handleProgramModeUpdate);
        this._runtime.removeListener(this._runtime.constructor.PERIPHERAL_UPLOAD_SUCCESS, this._startHeartbeat);

        this._isFirmataConnected = false;
    }

    /**
     * Return true if connected to the peripheral.
     * @return {boolean} - whether the peripheral is connected.
     */
    isConnected () {
        let connected = false;
        if (this._serialport) {
            connected = this._serialport.isConnected();
        }
        return connected;
    }

    /**
     * Set baudrate of the peripheral serialport.
     * @param {number} baudrate - the baudrate.
     */
    setBaudrate (baudrate) {
        this._serialport.setBaudrate(baudrate);
    }

    /**
     * Write data to the peripheral serialport.
     * @param {string} data - the data to write.
     */
    write (data) {
        if (!this.isConnected()) return;

        const base64Str = Buffer.from(data).toString('base64');
        this._serialport.write(base64Str, 'base64');
    }

    /**
     * Send a message to the peripheral Serialport socket.
     * @param {Uint8Array} message - the message to write
     */
    send (message) {
        if (!this.isConnected()) return;

        console.log(`send to coconut: heartbeat ${JSON.stringify(message)}`);

        // const data = Base64Util.uint8ArrayToBase64(message);
        // this._serialport.write(data);

        // send byte array
        this._serialport.write(message);
    }

    /**
     * Start send/recive heartbeat timer.
     * @private
     */
    _startHeartbeat () {
        if (this._runtime.getCurrentIsRealtimeMode()) {
            // eslint-disable-next-line no-negated-condition
            if (!this._firmata) {
                this._firmata = new Firmata(this.send.bind(this));
                this._firmata.on('ready', () => {
                    // Start the heartbeat listener.
                    this._firmata.on('reportversion', this._listenHeartbeat);

                    this._firmataIntervelID = window.setInterval(() => {
                        // Send reportVersion request as heartbeat.
                        this._firmata.reportVersion(() => { });
                    }, FrimataHeartbeatInterval);

                    // Start a timer if heartbeat timeout means failed to connect firmata.
                    this._firmataTimeoutID = window.setTimeout(() => {
                        this._isFirmataConnected = false;
                        this._serialport.handleRealtimeDisconnectError(ConnectFirmataTimeout);
                    }, FrimataHeartbeatTimeout);
                });
            } else {
                this._stopHeartbeat();

                this._firmataIntervelID = window.setInterval(() => {
                    // Send reportVersion request as heartbeat.
                    this._firmata.reportVersion(() => { });
                }, FrimataHeartbeatInterval);

                // Start a timer if heartbeat timeout means failed to connect firmata.
                this._firmataTimeoutID = window.setTimeout(() => {
                    this._isFirmataConnected = false;
                    this._serialport.handleRealtimeDisconnectError(ConnectFirmataTimeout);
                }, FrimataHeartbeatTimeout);
            }
        }
    }

    /**
     * Stop send/recive heartbeat timer.
     * @private
     */
    _stopHeartbeat () {
        if (this._firmataTimeoutID) {
            window.clearTimeout(this._firmataTimeoutID);
            this._firmataTimeoutID = null;
        }
        if (this._firmataIntervelID) {
            window.clearInterval(this._firmataIntervelID);
            this._firmataIntervelID = null;
        }
        this._isFirmataConnected = false;
    }

    /**
     * Listen the heartbeat and emit connection state event.
     * @private
     */
    _listenHeartbeat () {
        if (!this._isFirmataConnected) {
            this._isFirmataConnected = true;
            this._serialport.handleRealtimeConnectSucess();
        }
        // Reset the timeout timer
        window.clearTimeout(this._firmataTimeoutID);
        this._firmataTimeoutID = window.setTimeout(() => {
            this._isFirmataConnected = false;
            this._serialport.handleRealtimeDisconnectError(ConnectFirmataTimeout);
        }, FrimataHeartbeatTimeout);
    }

    /**
     * Handle the program mode update event. If in realtime mode start the heartbeat else stop.
     */
    _handleProgramModeUpdate () {
        if (this._runtime.getCurrentIsRealtimeMode()) {
            this._startHeartbeat();
        } else {
            this._stopHeartbeat();
        }
    }

    /**
     * Starts reading data from peripheral after serialport has connected to it.
     * @private
     */
    _onConnect () {
        console.log(`_onMessage`);
        this._serialport.read(this._onMessage);

        console.log(`write reset protocol : ff 55 02 00 04`);
        this._serialport.write([0xff, 0x55, 0x02, 0x00, 0x04]);

	    console.log(`_startHeartbeat`);
        this._startHeartbeat();

        this._runtime.on(this._runtime.constructor.PROGRAM_MODE_UPDATE, this._handleProgramModeUpdate);
        this._runtime.on(this._runtime.constructor.PERIPHERAL_UPLOAD_SUCCESS, this._startHeartbeat);
    }

    /**
     * Process the sensor data from the incoming serialport characteristic.
     * @param {object} base64 - the incoming serialport data.
     * @private
     */
    _onMessage (base64) {
        // parse data
        const data = Base64Util.base64ToUint8Array(base64);
        this._firmata.onReciveData(data);
    }

    /**
     * Return true if peripheral has connected to firmata and program mode is realtime.
     * @return {boolean} - whether the peripheral is ready for realtime mode communication.
     */
    isReady () {
        // TODO: for debug, delete after
        console.log(`is realtimemode :  ${this._runtime.getCurrentIsRealtimeMode()}`);
        console.log(`is firmata connected :  ${this._isFirmataConnected}`);

        if (this._runtime.getCurrentIsRealtimeMode() && this._isFirmataConnected) {
            return true;
        }
        return false;
    }

    /**
     * @param {PIN} pin - the pin string to parse.
     * @return {number} - the pin number.
     */
    parsePin (pin) {
        if (pin.charAt(0) === 'A') {
            return parseInt(pin.slice(1), 10) + 14;
        }
        return parseInt(pin, 10);
    }

    /**
     * @param {LEVEL} level - the level string to parse.
     * @return {number} - the level in number.
     */
    parseLevel (level) {
        if (level === Level.High) {
            return 1;
        }
        return 0;
    }

    /**
     * @param {PIN} pin - the pin to set.
     * @param {MODE} mode - the pin mode to set.
     */
    setPinMode (pin, mode) {
        if (this.isReady()) {
            pin = this.parsePin(pin);
            switch (mode) {
            case Mode.Input:
                mode = this._firmata.MODES.INPUT;
                break;
            case Mode.Output:
                mode = this._firmata.MODES.OUTPUT;
                break;
            case Mode.InputPullup:
                mode = this._firmata.MODES.PULLUP;
                break;
            }
            this._firmata.pinMode(pin, mode);
        }
    }

    /**
     * @param {PIN} pin - the pin to set.
     * @param {LEVEL} level - the pin level to set.
     */
    setDigitalOutput (pin, level) {
        if (this.isReady()) {
            pin = this.parsePin(pin);
            level = this.parseLevel(level);
            this._firmata.digitalWrite(pin, level);
        }
    }

    /**
     * @param {PIN} pin - the pin to set.
     * @param {VALUE} value - the pwm value to set.
     */
    setPwmOutput (pin, value) {
        if (this.isReady()) {
            pin = this.parsePin(pin);
            if (value < 0) {
                value = 0;
            }
            if (value > 255) {
                value = 255;
            }
            this._firmata.pinMode(pin, this._firmata.MODES.PWM);
            this._firmata.pwmWrite(pin, value);
        }
    }

    /**
     * @param {PIN} pin - the pin to read.
     * @return {Promise} - a Promise that resolves when read from peripheral.
     */
    readDigitalPin (pin) {
        if (this.isReady()) {
            pin = this.parsePin(pin);
            return new Promise(resolve => {
                this._firmata.digitalRead(pin, value => {
                    resolve(value);
                });
                window.setTimeout(() => {
                    resolve();
                }, FrimataReadTimeout);
            });
        }
    }

    /**
     * @param {PIN} pin - the pin to read.
     * @return {Promise} - a Promise that resolves when read from peripheral.
     */
    readAnalogPin (pin) {
        if (this.isReady()) {
            pin = this.parsePin(pin);
            // Shifting to analog pin number.
            pin = pin - 14;
            this._firmata.pinMode(pin, this._firmata.MODES.ANALOG);
            return new Promise(resolve => {
                this._firmata.analogRead(pin, value => {
                    resolve(value);
                });
                window.setTimeout(() => {
                    resolve();
                }, FrimataReadTimeout);
            });
        }
    }

    /**
     * @param {PIN} pin - the pin to set.
     * @param {VALUE} value - the degree to set.
     */
    setServoOutput (pin, value) {
        if (this.isReady()) {
            pin = this.parsePin(pin);
            if (value < 0) {
                value = 0;
            }
            if (value > 180) {
                value = 180;
            }
            this._firmata.pinMode(pin, this._firmata.MODES.PWM);
            this._firmata.pwmWrite(pin, value);

            this._firmata.servoConfig(pin, 600, 2400);
            this._firmata.servoWrite(pin, value);
        }
    }

    // ---- coconut -----
    /**
     * @brief 모듈 실행
     */
    coconutRunPackage () {
        let bytes = [0xff, 0x55, 0, 0, 2];

        for (let i = 0; i < arguments.length; i++) {
            // console.log(`type: ${arguments[i].constructor}, val= ${arguments[i]}`);
            // console.log(`type: ${(typeof arguments[i])}, val= ${arguments[i]}`);
            // if (arguments[i].constructor == '[class Array]') {
            if (typeof arguments[i] == 'object') {
                bytes = bytes.concat(arguments[i]);
            } else {
                bytes.push(arguments[i]);
            }
        } // for

        bytes[2] = bytes.length - 3; // data length
        // console.log(`package bytes array: ${bytes}, length ${bytes.length}`);
        // 장치에 ArrayBuffer data 전송
        // device.send(bytes);
        return bytes;
    } // function

    /**
     * move motors for coconut
     * @param direction
     * @returns {Promise<unknown>}
     */
    coconutMoveMotors (direction) {
        if (typeof direction === 'string') direction = Directions[direction];
        const speed = 60;

        // const {
        //     Sensors.Motor,
        //     0,
        //     direction,
        //     speed
        // } = options;

        // const options = {
        //     sensor: Sensors.Motor,
        //     index: 0,
        //     direction: direction,
        //     speed: 60
        // };

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);
        console.log(`isConnected : ${this.isConnected()}`);

        if (this.isConnected()) {
            const datas = this.coconutRunPackage(Sensors.Motor, 0, direction, speed);

            console.log(`move motors datas : ${datas}`);

            this.send(datas);
        }

        // if (this.isReady()) {
        //     // const speed = 60;
        //     return new Promise(resolve => {
        //         // this._firmata.coconutMoveMotors(Sensors.Motor, direction, speed => {
        //         this._firmata.coconutMoveMotors(options => {
        //             resolve(value);
        //         });
        //         window.setTimeout(() => {
        //             resolve();
        //         }, FrimataReadTimeout);
        //     });
        // }
    }

    /**
     * coconut turn motor
     * @param direction left or right
     */
    coconutTurnMotors (direction) {
        if (typeof direction === 'string') direction = Directions[direction];
        const speed = 60;

        console.log(`isReady : ${this.isReady()}`);
        console.log(`isConnected : ${this.isConnected()}`);

        if (this.isConnected()) {
            const datas = this.coconutRunPackage(Sensors.Motor, 0, direction, speed);

            console.log(`turn motors datas : ${datas}`);

            this.send(datas);
        }
    }

    /**
     *
     * @param direction
     * @param sec
     */
    coconutMoveGoTimes (direction, sec) {
        if (typeof direction === 'string') direction = Directions[direction];
        // let sec = args.TIME_SEC;

        // 시간이 0보다 작으면 양수로 변환
        if (sec < 0) sec = -sec;
        sec = 1000 * sec; // ms 변환

        const speed = 60;

        if (this.isConnected()) {
            // sensor, seq, dir, speed, degree, time
            const datas = this.coconutRunPackage(Sensors.Motor, 3, direction, speed, this.short2array(sec));

            console.log(`move motors datas : ${datas}`);

            this.send(datas);
        }

        // seq, direction, speed, degree, time
        // runPackage(devices["Motor"], 3, direction, speed, short2array(sec));
    }

    /**
     *
     * @param direction
     * @param sec
     */
    coconutTurnMotorTimes (direction, sec) {
        if (typeof direction === 'string') direction = Directions[direction];
        // let sec = args.TIME_SEC;

        // 시간이 0보다 작으면 양수로 변환
        if (sec < 0) sec = -sec;
        sec = 1000 * sec; // ms 변환

        const speed = 60;

        if (this.isConnected()) {
            // sensor, seq, dir, speed, degree, time
            const datas = this.coconutRunPackage(Sensors.Motor, 3, direction, speed, this.short2array(sec));

            console.log(`turn motors datas : ${datas}`);

            this.send(datas);
        }
    }

    short2array (short) {
        // Create a 2-byte array (16 bits) using an Int16Array
        const byteArray = new Int16Array(1);
        byteArray[0] = short;

        // Convert the Int16Array to a regular byte array (Uint8Array)
        const byteView = new Uint8Array(byteArray.buffer);

        console.log(`short ${short} => bytes ${JSON.stringify(byteView)}`);

        return Array.from(byteView);
    }

    /**
     * stop coconut motor
     */
    coconutStopMotor () {
        const datas = this.coconutRunPackage(Sensors.Motor, 1);

        console.log(`stop motors datas : ${datas}`);

        // const options = {
        //     sensor: Sensors.Motor,
        //     index: 0,
        //     direction: direction,
        //     speed: 60
        // };

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * Rotate the motor while turning on the RGB LED
     * @param direction LEFT, RIGHT
     * @param color Red, Blue, Green, Yellow, Cyan, Magenta, White
     */
    coconutMoveMotorColors (direction, color) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];
        const speed = 60;

        // deviceid, seq, direction, speed, color
        const datas = this.coconutRunPackage(Sensors.Motor, 5, direction, speed, color);

        console.log(`moveMotorColors datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * Move by the entered distance
     * @param direction
     * @param cm
     */
    coconutMoveGoCm (direction, cm) {
        if (typeof direction === 'string') direction = Directions[direction];

        // runPackage(devices["Motor"], 10, direction, cm);
        const datas = this.coconutRunPackage(Sensors.Motor, 10, direction, cm);

        console.log(`moveGoCm datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * turn motor by degree
     * @param direction
     * @param degree
     */
    coconutTurnMotorDegrees (direction, degree) {
        if (typeof direction === 'string') direction = Directions[direction];
        // if (typeof direction === 'string') direction = Directions[direction];

        // runPackage(devices["Motor"], 11, direction, short2array(degree));
        const datas = this.coconutRunPackage(Sensors.Motor, 11, direction, this.short2array(degree));

        console.log(`TurnMotorDegrees datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * turn on RGB LED
     * @param direction
     * @param color
     */
    coconutRGBOns (direction, color) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];

        // runPackage(devices["RGBled"], 0, direction, color);
        const datas = this.coconutRunPackage(Sensors.RGBled, 0, direction, color);

        console.log(`RGBon datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * turn off RGB LED direction
     * @param direction
     */
    coconutRGBOffs (direction) {
        if (typeof direction === 'string') direction = Directions[direction];

        // runPackage(devices["RGBled"], 1, direction, 0);
        const datas = this.coconutRunPackage(Sensors.RGBled, 1, direction);

        console.log(`RGBoff datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * turn off RGB LED
     * @param direction
     * @param color
     */
    coconutRGBOffColors (direction, color) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];

        // runPackage(devices["RGBled"], 1, direction, color);
        const datas = this.coconutRunPackage(Sensors.RGBled, 1, direction, color);

        console.log(`RGBoffColor datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }

    /**
     * turn on RGB LED
     * @param direction
     * @param color
     * @param sec
     */
    coconutRGBOnTimes (direction, color, sec) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];

        console.log(`typeof sec ${typeof sec}`);

        // 시간이 정수가 아니거나 0보다 작을 경우 0으로 변경
        if (typeof sec !== 'number') sec = 0;
        else if (sec < 0) sec = 0;
        else sec *= 1000; // ms 변환

        // runPackage(devices["RGBled"], 3, direction, color, short2array(sec));
        const datas = this.coconutRunPackage(Sensors.RGBled, 3, direction, color, this.short2array(sec));

        console.log(`RGBonTime datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        console.log(`isReady : ${this.isReady()}`);

        if (this.isConnected()) {
            this.send(datas);
        }
    }
}

module.exports = CoconutPeripheral;
