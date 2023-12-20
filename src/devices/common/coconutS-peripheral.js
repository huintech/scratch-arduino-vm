const formatMessage = require('format-message');
const Buffer = require('buffer').Buffer;
const Cast = require('../../util/cast');

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
const FirmataReadTimeout = 2000;

const Level = {
    High: 'HIGH',
    Low: 'LOW'
};

const Mode = {
    Input: 'INPUT',
    Output: 'OUTPUT',
    InputPullup: 'INPUT_PULLUP'
};

/**
 * sensor ID in Coconut
 * @type {{IRdistance: number, LineTracer: number, Temperature: number, Motor: number, LedMatrix: number, Accelerometer: number, Buzzer: number, IR: number, RGBled: number, LightSensor: number}}
 */
const Sensors = {
    RemoteControl: 2,
    Buzzer: 3,
    IRdistance: 5,
    LineTracer: 7,
    IR: 9,
    LightSensor: 14,
    Accelerometer: 18,
    Temperature: 21,
    RGBled: 25,
    Motor: 26,
    LedMatrix: 27, // 0x1b
    Speaker: 41,
    ExtIR: 42,
    ServoMotor: 43,
    ExtLed: 44,
    ExtCds: 45,
    ExtMotor: 46,
    Touch: 47,
    Mike: 48
};

/**
 * Motor command
 * @type {{MOVE: number, STOP: number, CM: number, DEGREE: number, RGB: number}}
 */
const MOTOR_CMD = {
    MOVE: 0x00,
    STOP: 0x01,
    TIME: 0x03,
    RGB: 0x05,
    CM: 0x0A,
    DEGREE: 0x0B
};

/**
 * motor default speed
 * @type {number}
 */
const MotorSpeed = 60;

/**
 * Direction values
 * @type {{Left: number, Backward: number, Right: number, Forward: number, Both: number}}
 */
const Directions = {
    Both: 0, Left: 1, Right: 2, Forward: 3, Backward: 4
};

/**
 * color values
 * @type {{Red: number, White: number, Cyan: number, Blue: number, Yellow: number, Magenta: number, Black: number, Green: number}}
 */
const Colors = {
    Black: 0,
    White: 1,
    Red: 2,
    Green: 3,
    Blue: 4,
    Yellow: 5,
    Cyan: 6,
    Magenta: 7
};

/**
 * 박자: 음표, 쉼표 동일
 * @type {{Zero: number, original: number, "Dotted eighth": number, "Dotted half": number, "Dotted sixteenth": number, Whole: number, Double: number, Eighth: number, "Thirty-second": number, Half: number, "Dotted quarter": number, "Dotted thirty-second": number, Quater: number, Sixteenth: number}}
 */
const Beats = {
    'Half': 500,
    'Quarter': 250,
    'Eighth': 125,
    'Sixteenth': 63,
    'Thirty-second': 32,
    'Whole': 1000,
    'Dotted half': 750,
    'Dotted quarter': 375,
    'Dotted eighth': 188,
    'Dotted sixteenth': 95,
    'Dotted thirty-second': 48,
    'Double': 2000,
    'Zero': 0,
    'original': 0
};

/**
 * check if detected
 * @type {{No: number, Yes: number}}
 */
const Detects = {Yes: 1, No: 0};

/**
 * line-tracer commands
 * @type {{"Turn left": number, "Turn right": number}}
 */
const Commands = {'Turn left': 3, 'Turn right': 4};

/**
 * led matrix on/off values
 * @type {{Off: number, On: number}}
 */
const OnOffs = {On: 1, Off: 0};

/**
 * english small letter
 * @type {{a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number, u: number, v: number, w: number, x: number, y: number, z: number}}
 */
const SmallLetters = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
    j: 9,
    k: 10,
    l: 11,
    m: 12,
    n: 13,
    o: 14,
    p: 15,
    q: 16,
    r: 17,
    s: 18,
    t: 19,
    u: 20,
    v: 21,
    w: 22,
    x: 23,
    y: 24,
    z: 25
};

/**
 * english capital letter
 * @type {{A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, I: number, J: number, K: number, L: number, M: number, N: number, O: number, P: number, Q: number, R: number, S: number, T: number, U: number, V: number, W: number, X: number, Y: number, Z: number}}
 */
const CapitalLetters = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7,
    I: 8,
    J: 9,
    K: 10,
    L: 11,
    M: 12,
    N: 13,
    O: 14,
    P: 15,
    Q: 16,
    R: 17,
    S: 18,
    T: 19,
    U: 20,
    V: 21,
    W: 22,
    X: 23,
    Y: 24,
    Z: 25
};

/**
 * Korean letter
 * @type {{aa: number, ta: number, sa: number, pa: number, na: number, ma: number, la: number, ka: number, ja: number, ha: number, ga: number, da: number, cha: number, ba: number}}
 */
const KoreanLetters = {
    ga: 0,
    na: 1,
    da: 2,
    la: 3,
    ma: 4,
    ba: 5,
    sa: 6,
    aa: 7,
    ja: 8,
    cha: 9,
    ka: 10,
    ta: 11,
    pa: 12,
    ha: 13
};

/**
 * 3-Axis Accelerometer
 * @type {{"X-Axis": number, "Z-Axis": number, "Y-Axis": number}}
 */
const Axises = {'X-Axis': 1, 'Y-Axis': 2, 'Z-Axis': 3};

/**
 * melodys
 * @type {{Butterfly: number, "Three bears": number, "Mozart's Lullaby": number, "Do-Re-Mi": number, "Twinkle Twinkle little star": number}}
 */
const Melodys = {
    'Twinkle Twinkle little star': 1,
    'Three bears': 2,
    "Mozart's Lullaby": 3,
    'Do-Re-Mi': 4,
    'Butterfly': 5
};

/**
 * Manage communication with a Arduino peripheral over a Scratch Arduino Link client socket.
 */
class CoconutSPeripheral {

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
        // TODO: stop-all, coconut stop all
        this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

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
        console.log(`reset`);

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

        console.log(`send to coconut: ${JSON.stringify(message)}`);

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
        console.log(`_startHeartbeat realtimemode= ${this._runtime.getCurrentIsRealtimeMode()} firmata= ${this._firmata}`);

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

	    // console.log(`_startHeartbeat`);
        this._startHeartbeat();
        // TODO: heart beat 추후 삭제, firmata connection 은 시리얼포트 연결되면 true 로 반환
        this._isFirmataConnected = true;

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
        console.log(`_onMessage: data = ${data}`);
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
                }, FirmataReadTimeout);
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
                }, FirmataReadTimeout);
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

    // ---- coconutS -----
    /**
     * @brief 모듈 실행
     */
    _runPackage () {
        let bytes = [0xff, 0x55, 0, 0, 2];

        for (let i = 0; i < arguments.length; i++) {
            // console.log(`type: ${arguments[i].constructor}, val= ${arguments[i]}`);
            // console.log(`type: ${(typeof arguments[i])}, val= ${arguments[i]}`);
            // if (arguments[i].constructor == '[class Array]') {
            if (typeof arguments[i] === 'object') {
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
     * move motors for coconut-s
     * @param direction
     * @returns {Promise<unknown>}
     */
    moveMotor (direction) {
        if (typeof direction === 'string') direction = Directions[direction];

        const options = [Sensors.Motor, 0, direction, MotorSpeed];

        if (this.isConnected()) {
            return new Promise(resolve => {
                this._firmata.moveMotor(...options, value => {
                    if (value === true) resolve();
                    else resolve(value);
                    console.log(`resolve : ${value}`);
                });
                // window.setTimeout(() => {
                //     resolve();
                // }, FirmataReadTimeout);
            });
        }
    }

    /**
     * coconutS turn motor
     * @param direction left or right
     */
    turnMotor (direction) {
        if (typeof direction === 'string') direction = Directions[direction];
        // const speed = 60;

        // console.log(`isReady : ${this.isReady()}`);
        // console.log(`isConnected : ${this.isConnected()}`);

        // if (this.isConnected()) {
        //     const datas = this._runPackage(Sensors.Motor, 0, direction, speed);
        //
        //     console.log(`turn motors datas : ${datas}`);
        //
        //     this.send(datas);
        // }

        const options = [Sensors.Motor, 0, direction, MotorSpeed];

        return new Promise(resolve => {
            this._firmata.turnMotor(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    /**
     * stop coconutS motor
     */
    stopMotor () {
        // const datas = this._runPackage(Sensors.Motor, 1);
        //
        // console.log(`stop motors datas : ${datas}`);
        //
        // // console.log(`_peripheral : ${JSON.stringify(options)}`);
        // console.log(`isReady : ${this.isReady()}`);

        // if (this.isConnected()) {
        //     this.send(datas);
        // }

        const options = [Sensors.Motor, 1];

        // TODO: promise 추가
        return new Promise(resolve => {
            this._firmata.stopMotor(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    _short2array (short) {
        // Create a 2-byte array (16 bits) using an Int16Array
        const byteArray = new Int16Array(1);
        byteArray[0] = short;

        // Convert the Int16Array to a regular byte array (Uint8Array)
        const byteView = new Uint8Array(byteArray.buffer);

        console.log(`short ${short} => bytes ${JSON.stringify(byteView)}`);

        return Array.from(byteView);
    }

    /**
     * Move the motor for the entered time
     * @param direction
     * @param sec
     */
    moveGoTime (direction, sec) {
        if (typeof direction === 'string') direction = Directions[direction];
        // let sec = args.TIME_SEC;

        // 시간이 0보다 작으면 양수로 변환
        if (sec < 0) sec = -sec;
        sec = 1000 * sec; // ms 변환

        // if (this.isConnected()) {
        //     // sensor, seq, dir, speed, degree, time
        //     const datas = this._runPackage(Sensors.Motor, 3, direction, speed, this._short2array(sec));
        //     console.log(`move motors datas : ${datas}`);
        //     this.send(datas);
        // }

        const options = [Sensors.Motor, MOTOR_CMD.TIME, direction, MotorSpeed, sec];

        return new Promise(resolve => {
            this._firmata.moveGoTime(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
        });
            // window.setTimeout(() => {
            //      resolve();
            // }, sec);
        // }).then(result => {
        //     // console.log(result);
        //     console.log(`resolve : ${result}`);
        // });
    }

    /**
     * Turn motor for the entered time
     * @param direction
     * @param sec
     */
    // turnMotorTime (direction, sec) {
    //     if (typeof direction === 'string') direction = Directions[direction];
    //     // let sec = args.TIME_SEC;
    //
    //     // 시간이 0보다 작으면 양수로 변환
    //     if (sec < 0) sec = -sec;
    //     sec = 1000 * sec; // ms 변환
    //
    //     const speed = 60;
    //
    //     // if (this.isConnected()) {
    //     //     // sensor, seq, dir, speed, degree, time
    //     //     const datas = this._runPackage(Sensors.Motor, 3, direction, speed, this._short2array(sec));
    //     //
    //     //     console.log(`turn motors datas : ${datas}`);
    //     //
    //     //     this.send(datas);
    //     // }
    //
    //     return new Promise(resolve => {
    //         this._firmata.moveGoTime(Sensors.Motor, MOTOR_CMD.TIME, direction, speed, sec, value => {
    //             resolve(value);
    //             console.log(`resolve : ${value}`);
    //         });
    //         // window.setTimeout(() => {
    //         //     resolve();
    //         // }, FrimataReadTimeout);
    //     });
    // }

    /**
     * Turn on RGB LED while rotating the motor
     * @param direction LEFT, RIGHT
     * @param color Red, Blue, Green, Yellow, Cyan, Magenta, White
     */
    moveMotorColor (direction, color) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];
        // const speed = 60;

        // deviceid, seq, direction, speed, color
        // const datas = this._runPackage(Sensors.Motor, 5, direction, MotorSpeed, color);
        //
        // console.log(`moveMotorColors datas : ${datas}`);

        // console.log(`_peripheral : ${JSON.stringify(options)}`);
        // console.log(`isReady : ${this.isReady()}`);

        // if (this.isConnected()) {
        //     this.send(datas);
        // }

        const options = [Sensors.Motor, MOTOR_CMD.RGB, direction, MotorSpeed, color];

        return new Promise(resolve => {
            this._firmata.moveMotorColor(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    /**
     * Move by the entered distance
     * @param direction
     * @param cm
     */
    moveGoCm (direction, cm) {
        if (typeof direction === 'string') direction = Directions[direction];

        // console.log(`isReady : ${this.isReady()}`);

        const options = [Sensors.Motor, MOTOR_CMD.CM, direction, cm];

        return new Promise(resolve => {
            this._firmata.moveGoCm(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
            // .then(result => {
        //     // console.log(result);
        //     console.log(`resolve : ${result}`);
        // });
    }

    /**
     * turn motor by the entered angle
     * @param direction
     * @param degree
     */
    turnMotorDegree (direction, degree) {
        if (typeof direction === 'string') direction = Directions[direction];

        const options = [Sensors.Motor, MOTOR_CMD.DEGREE, direction, degree];

        return new Promise(resolve => {
            this._firmata.turnMotorDegree(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    /**
     * turn on RGB LED
     * @param direction
     * @param color
     */
    rgbOn (direction, color) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];

        // runPackage(devices["RGBled"], 0, direction, color);
        // const datas = this._runPackage(Sensors.RGBled, 0, direction, color);
        // console.log(`rgbOn datas : ${datas}`);

        const options = [Sensors.RGBled, 0, direction, color];

        return new Promise(resolve => {
            this._firmata.rgbOn(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    /**
     * turn off RGB LED direction
     * @param direction
     */
    rgbOff (direction) {
        if (typeof direction === 'string') direction = Directions[direction];

        const options = [Sensors.RGBled, 1, direction, 0]; // color=0

        return new Promise(resolve => {
            this._firmata.rgbOff(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    /**
     * turn off selected RGB LED
     * @param direction
     * @param color
     */
    rgbOffColor (direction, color) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];

        const options = [Sensors.RGBled, 1, direction, color];

        return new Promise(resolve => {
            this._firmata.rgbOff(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
    }

    /**
     * turn on RGB LED for entered time
     * @param direction
     * @param color
     * @param sec
     */
    rgbOnTime (direction, color, sec) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];

        // console.log(`typeof sec ${typeof sec}`);

        // 시간이 정수가 아니거나 0보다 작을 경우 0으로 변경
        if (typeof sec === 'string') sec = Number(sec);
        if (typeof sec !== 'number') sec = 0;
        if (sec < 0) sec = 0;

        const ms = sec * 1000; // ms 변환

        // runPackage(devices["RGBled"], 3, direction, color, short2array(sec));
        // const datas = this._runPackage(Sensors.RGBled, 3, direction, color, this._short2array(sec));

        // console.log(`RGBonTime datas : ${datas}`);

        // console.log(`isReady : ${this.isReady()}`);
        // if (this.isConnected()) {
        //     this.send(datas);
        // }

        const options = [Sensors.RGBled, 3, direction, color, ms];

        return new Promise(resolve => {
            this._firmata.rgbOnTime(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FrimataReadTimeout);
        });
        //     .then(result => {
        //     if (result !== true) {
        //         resolve();
        //     }
        //     console.log(`resolve : ${result}`);
        // });
    }

    /**
     * @brief   버저 제어
     * @details
     * @param   seq     순번 (0: 연주, 1: 박자쉬기, 2: 음표 연주)
     * @param   tone    주파수
     * @param   beat    박자
     */
    _buzzerControl (seq, tone, beat) {
        // if (typeof tone == "string") tone = tones[tone];
        if (typeof beat === 'string') beat = Beats[beat];

        return this._runPackage(Sensors.Buzzer, seq, this._short2array(tone), this._short2array(beat));
    }

    /**
     * buzzer on
     */
    beep () {
        // const datas = this._buzzerControl(0, 262, 50);

        // if (this.isConnected()) {
        //     this.send(datas);
        // }

        // sensor, cmd, tone, beat
        const options = [Sensors.Buzzer, 0, 262, 50];

        return new Promise(resolve => {
            this._firmata.beep(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(result => {
            //     resolve();
            //     console.log(`resolve : ${result}`);
            // }, 50);
        });
    }

    /**
     * The buzzer sounds at the entered frequency for the entered time.
     * @param sec
     */
    playBuzzerTime (sec) {
        // 시간이 정수가 아니거나 0보다 작을 경우 0으로 변경
        if (typeof sec !== 'number') sec = 0.6;
        if (sec < 0) sec = 0.6;

        const ms = sec * 1000; // ms 변환

        // sensor, cmd, tone, beat
        const options = [Sensors.Buzzer, 0, 262, ms];

        return new Promise(resolve => {
            this._firmata.playBuzzerTime(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(result => {
            //     resolve();
            //     console.log(`resolve : ${result}`);
            // }, sec);
        });
    }

    /**
     * buzzer on frequency for some seconds
     * @param freq frequency
     * @param sec seconds
     */
    playBuzzerFreq (freq, sec) {
        // 시간이 정수가 아니거나 0보다 작을 경우 0으로 변경
        if (typeof sec === 'string') sec = Number(sec);
        if (typeof sec !== 'number') sec = 0.6;
        if (sec < 0) sec = 0.6;

        const ms = 1000 * sec; // milliseconds 변환

        // 주파수가 숫자가 아니거나 0보다 작을 경우 300hz로 고정
        if (typeof freq === 'string') freq = Number(freq);
        if (typeof freq !== 'number') freq = 300;
        if (freq < 0) freq = 300;

        const options = [Sensors.Buzzer, 0, freq, ms];

        return new Promise(resolve => {
            this._firmata.playBuzzerFreq(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve : ${value}`);
            });
            // window.setTimeout(result => {
            //     resolve();
            //     console.log(`resolve : ${result}`);
            // }, sec);
        });
    }

    /**
     * buzzer off
     */
    buzzerOff () {
        const options = [Sensors.Buzzer, 0, 0, 0];

        return new Promise(resolve => {
            this._firmata.buzzerOff(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(result => {
            //     resolve();
            //     console.log(`resolve : ${result}`);
            // }, sec);
        });
    }

    /**
     * play note
     * @param note
     * @param octave
     * @param sharp
     * @param beat
     */
    playNote (note, octave, sharp, beat) {
        if (typeof note === 'string') {
            // note 에서 `NOTE_` 다음 문자열만 추출
            note = this._getNote(note);
            note = note.charCodeAt(0)
        }

        if (typeof sharp === 'string') {
            sharp = sharp.charCodeAt(0);
        }

        if (typeof beat === 'string') beat = Beats[beat];

        // const options = [Sensors.Buzzer, 4, note.charCodeAt(0), octave, sharp.charCodeAt(0), beat];
        const options = [Sensors.Buzzer, 4, note, octave, sharp, beat];

        return new Promise(resolve => {
            this._firmata.playNote(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(result => {
            //     resolve();
            //     console.log(`resolve : ${result}`);
            // }, sec);
        });
    }

    /**
     * @brief   음계 문자 추출
     * @param   note    음계 (eg. NOTE_C)
     */
    _getNote (note) {
        // note 에서 `NOTE_` 다음 문자열만 추출
        const arrNote = note.split('_');

        return arrNote[1];
    }

    /**
     * beat rest
     * @param beat
     */
    restBeat (beat) {
        if (typeof beat === 'string') {
            // Half_rest 에서 `_` 앞 문자열만 추출하여 박자 설정
            const arrBeat = beat.split('_', 1);
            beat = Beats[arrBeat[0]];
        }

        // sensor, cmd, tone, beat
	    const options = [Sensors.Buzzer, 1, 0, beat];

	    return new Promise(resolve => {
		    this._firmata.restBeat(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
		    });
		    // window.setTimeout(result => {
		    //     resolve();
		    //     console.log(`resolve : ${result}`);
		    // }, sec);
	    });
    }

    /**
     * @brief   버저 tone+octave 음을 beat 박자로 실행시 LED 켜기
     * @param   note
     * @param   octave
     * @param   sharp       올림표/내림표 (-:0, #:1, b:2)
     * @param   beat
     * @param   direction   Left:1, Right:2, All: 0
     * @param   color       1: Red, 2: Green, 3: Blue, default: Red
     */
    playNoteColor (note, octave, sharp, beat, direction, color) {
        if (typeof note === 'string') {
            // note 에서 `NOTE_` 다음 문자열만 추출
            note = this._getNote(note);
            note = note.charCodeAt(0);
        }

        if (typeof sharp === 'string') sharp = sharp.charCodeAt(0);
        if (typeof beat === 'string') beat = Beats[beat];
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof color === 'string') color = Colors[color];
        if (typeof octave === 'string') octave = Number(octave);

	    const options = [Sensors.Buzzer, 5, note, octave, sharp, beat, direction, color];

        return new Promise(resolve => {
            this._firmata.playNoteColor(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(result => {
            //     resolve();
            //     console.log(`resolve : ${result}`);
            // }, sec);
        });
    }

    /**
     * change beat
     * @param beat
     */
    changeBeat (beat) {
        if (typeof beat === 'string') beat = Beats[beat];
        // console.log(`beat= ${beat}`);

        const options = [Sensors.Buzzer, 7, beat];

        return new Promise(resolve => {
            this._firmata.changeBeat(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(result => {
            //     // resolve();
            //     if (result !== true) {
            //         resolve(result);
            //     } else {
            //         resolve();
            //     }
            //     console.log(`resolve : ${result}`);
            // }, beat);
        });
    }

    /**
     * @brief   센서값 읽기
     *
     */
    _getPackage () {
        // var nextID = arguments[0];
        const len = arguments.length;

        console.log(`len = ${arguments.length}`);

        const bytes = [0xff, 0x55];
        bytes.push(len + 2);
        bytes.push(0);
        bytes.push(1);

        for (let i = 0; i < len; i++) {
            bytes.push(arguments[i]);
        }// for

        // device.send(bytes);
        return bytes;
    } // function getPackage

    /**
     * read line tracer
     * @param direction
     */
    getLineTracer (direction) {
        if (typeof direction === 'string') direction = Directions[direction];

        // const datas = this._getPackage(Sensors.Linetracer, 0, direction);
        //
        // if (this.isConnected()) {
        //     this.send(datas);
        // }

        const options = [Sensors.LineTracer, 0, direction];

        return new Promise(resolve => {
            this._firmata.getLineTracer(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * line tracer detection check
     * @param direction
     * @param detect
     */
    isLineDetected (direction, detect) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof detect === 'string') detect = Detects[detect];

        const options = [Sensors.LineTracer, 1, direction, detect];

        return new Promise(resolve => {
            this._firmata.isLineDetected(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * get line tracers detection
     */
    getLineTracerDetectAll () {
        const options = [Sensors.LineTracer, 4];

        return new Promise(resolve => {
            this._firmata.getLineTracerDetectAll(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * run command until line-tracer detect black line
     * @param cmd
     */
    lineTracerCmd (cmd) {
        if (typeof cmd === 'string') cmd = Commands[cmd];

        const options = [Sensors.LineTracer, 5, cmd];

        return new Promise(resolve => {
            this._firmata.lineTracerCmd(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * read IR Distance sensor
     * @param direction
     */
    getDistance (direction) {
        if (typeof direction === 'string') direction = Directions[direction];

        const options = [Sensors.IRdistance, 0, direction];

        return new Promise(resolve => {
            this._firmata.getDistance(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * IR distance sensor detecting check
     * @param direction
     * @param detect
     */
    isDetectObstacle (direction, detect) {
        if (typeof direction === 'string') direction = Directions[direction];
        if (typeof detect === 'string') detect = Detects[detect];

        const options = [Sensors.IRdistance, 1, direction, detect];

        return new Promise(resolve => {
            this._firmata.isDetectObstacle(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * all IR distance sensor detecting check
     * return boolean
     */
    isDetectObstacleAll () {
        const options = [Sensors.IRdistance, 2];

        return new Promise(resolve => {
            this._firmata.isDetectObstacleAll(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * led matrix on
     * @param on
     * @param row
     * @param col
     */
    ledMatrixOn (on, row, col) {
        if (typeof on === 'string') on = OnOffs[on];
        if ((typeof row === 'string') && (row === 'Both')) row = 0;
        if ((typeof col === 'string') && (col === 'Both')) col = 0;

        const options = [Sensors.LedMatrix, 0, row, col, on];

        return new Promise(resolve => {
            this._firmata.ledMatrixOn(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * turn on all LED Matrix
     */
    ledMatrixOnAll () {
        const options = [Sensors.LedMatrix, 6];

        return new Promise(resolve => {
            this._firmata.ledMatrixOnAll(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * LED Matrix clear all
     */
    ledMatrixClear () {
        const options = [Sensors.LedMatrix, 5];

        return new Promise(resolve => {
            this._firmata.ledMatrixClear(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * show number on LED Matrix
     * @param num
     */
    showLedMatrixNumber (num) {
        const options = [Sensors.LedMatrix, 1, num];

        return new Promise(resolve => {
            this._firmata.showLedMatrixNumber(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * show english small letter
     * @param letter
     */
    showLedMatrixSmall (letter) {
        if (typeof letter === 'string') letter = SmallLetters[letter];

        const options = [Sensors.LedMatrix, 2, letter];

        return new Promise(resolve => {
            this._firmata.showLedMatrixSmall(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * show english capital letter
     * @param letter
     */
    showLedMatrixCapital (letter) {
        if (typeof letter === 'string') letter = CapitalLetters[letter];

        const options = [Sensors.LedMatrix, 3, letter];

        return new Promise(resolve => {
            this._firmata.showLedMatrixCapital(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * show korean letter on LED Matrix
     * @param letter
     */
    showLedMatrixKorean (letter) {
        if (typeof letter === 'string') letter = KoreanLetters[letter];

        const options = [Sensors.LedMatrix, 4, letter];

        return new Promise(resolve => {
            this._firmata.showLedMatrixKorean(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * read light sensor
     */
    getLightSensor () {
        const options = [Sensors.LightSensor, 0];

        return new Promise(resolve => {
            this._firmata.getLightSensor(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * read temperature sensor
     */
    getTemperature () {
        const options = [Sensors.Temperature, 0];

        return new Promise(resolve => {
            this._firmata.getTemperature(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * read 3-Axis Accelerometer sensor
     * @param axis
     */
    getAccelerometer (axis) {
        if (typeof axis === 'string') axis = Number(axis);

        const options = [Sensors.Accelerometer, 0, axis];

        return new Promise(resolve => {
            this._firmata.getAccelerometer(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * forced stop all block
     */
    stopAll () {
        new Promise(resolve => {
            this._firmata.stopAll(value => {
                if (value === true) resolve();
                else resolve(value);

                console.log(`resolve= ${value}`);
            });
        });
        // return Promise.resolve();
    }

    playMelody (melody) {
        if (typeof melody === 'string') melody = Melodys[melody];

        const options = [Sensors.Buzzer, 6, Cast.toNumber(melody)];

        return new Promise(resolve => {
            this._firmata.playMelody(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    /**
     * follow the line
     */
    followLine () {
        const options = [Sensors.LineTracer, 3, MotorSpeed];

        return new Promise(resolve => {
            this._firmata.followLine(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
            // window.setTimeout(() => {
            //     resolve();
            // }, FirmataReadTimeout);
        });
    }

    // followLine () {
    //
    //     const options = [Sensors.LineTracer, 3, MotorSpeed];
    //
    //     const jobDurationMS = 3000;
    //     const timeoutMS = 2000;
    //
    //     const job = new Promise(resolve => {
    //         this._firmata.followLine(...options, value => {
    //             resolve(value);
    //
    //             console.log(`resolve= ${value}`);
    //         });
    //     });
    //     let timer;
    //     Promise.race([
    //         job,
    //         new Promise(resolve => {
    //             timer = setTimeout(() => resolve('timeout'), FirmataReadTimeout);
    //         })
    //     ])
    //         .then(result => {
    //             if (result === 'timeout') {
    //                 console.log('시간이 초과되었습니다!');
    //             } else {
    //                 console.log('시간 내에 작업을 완료하였습니다.');
    //             }
    //         })
    //         .finally(() => clearTimeout(timer));
    // }

    /**
     * avoid mode
     */
    avoidMode () {
        const options = [Sensors.IRdistance, 3];

        return new Promise(resolve => {
            this._firmata.avoidMode(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * Move external motor
     * @param direction
     * @param speed
     */
    moveExtMotors (direction, speed) {
        if (typeof direction === 'string') direction = Directions[direction];
        const options = [Sensors.ExtMotor, 2, direction, speed];

        return new Promise(resolve => {
            this._firmata.moveExtMotors(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * set speed to selected external motor
     * @param direction
     * @param speed
     */
    moveExtMotorSingle (direction, speed) {
        if (typeof direction === 'string') direction = Directions[direction];

        const options = [Sensors.ExtMotor, 1, direction, speed];

        return new Promise(resolve => {
            this._firmata.moveExtMotorSingle(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * set servo motor
     * @param pin
     * @param angle
     */
    runExtServo (pin, angle) {
        const options = [Sensors.ServoMotor, pin, angle];

        return new Promise(resolve => {
            this._firmata.runExtServo(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * external LED on
     * @param pin
     * @param sec
     */
    extLedOn (pin, sec) {
        if (sec < 0) sec = -sec;
        const ms = 1000 * sec; // ms 변환

        const options = [Sensors.ExtLed, pin, ms];

        return new Promise(resolve => {
            this._firmata.extLedOn(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * external speaker sensor on
     * @param pin
     * @param frequency
     * @param sec
     */
    extSpeakerOn (pin, frequency, sec) {
        if (sec < 0) sec = -sec;
        sec = 1000 * sec; // ms 변환

        const options = [Sensors.Speaker, pin, frequency, sec];

        return new Promise(resolve => {
            this._firmata.extSpeakerOn(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * external speaker sensor off
     * @param pin
     */
    extSpeakerOff (pin) {
        const options = [Sensors.Speaker, pin, 0, 0];

        return new Promise(resolve => {
            this._firmata.extSpeakerOn(...options, value => {
                if (value === true) resolve();
                else resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * read external touch sensor pressed
     * @param pin
     */
    getTouchSensor (pin) {
        const options = [Sensors.Touch, 1, pin];

        return new Promise(resolve => {
            this._firmata.getTouchSensor(...options, value => {
                resolve(value);
                console.log(`resolve= ${value}`);
            });
        });
    }

    /**
     * read external touch sensor
     * @param pin
     */
    getTouchPressed (pin) {
        const options = [Sensors.Touch, pin];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.getTouchPressed(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * read mike sensor
     * @param pin
     */
    getMikeSensor (pin) {
        const options = [Sensors.Mike, pin];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.getMikeSensor(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    getExtIR (pin) {
        const options = [Sensors.ExtIR, pin];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.getExtIR(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });

        });
    }

    getExtCds (pin) {
        const options = [Sensors.ExtCds, pin];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.getExtCds(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * read channel of MRT remote control
     * @returns {Promise<unknown>}
     */
    getRemoteChannel () {
        const options = [Sensors.RemoteControl, 3];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.getRemoteChannel(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * save selected channel of MRT Remote control
     * @param channel
     * @returns {Promise<unknown>}
     */
    saveRemoteChannel (channel) {
        const options = [Sensors.RemoteControl, 4, channel];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.saveRemoteChannel(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * receive value from saved channel of MRT Remote control
     * @returns {Promise<unknown>}
     */
    receiveRemoteControlSavedChannel () {
        const options = [Sensors.RemoteControl, 5];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.receiveRemoteControlSavedChannel(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * key pressed from saved channel of MRT Remote control
     * @param button
     * @returns {Promise<unknown>}
     */
    detectRemoteControlSavedChannel (button) {
        const options = [Sensors.RemoteControl, 6, button];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.detectRemoteControlSavedChannel(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * key released from MRT Remote control
     * @returns {Promise<unknown>}
     */
    getRemoteOff () {
        const options = [Sensors.RemoteControl, 7];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.getRemoteOff(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * receive the data from selected channel of MRT Remote control
     * @param channel
     * @returns {Promise<unknown>}
     */
    receiveRemoteControl (channel) {
        const options = [Sensors.RemoteControl, 2, channel];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.receiveRemoteControl(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }

    /**
     * key pressed from selected channel of MRT Remote control
     * @param button
     * @param channel
     * @returns {Promise<unknown>}
     */
    detectRemoteControl (button, channel) {
        const options = [Sensors.RemoteControl, 1, button, channel];

        return new Promise(resolve => {
            setTimeout(() => {
                this._firmata.detectRemoteControl(...options, value => {
                    resolve(value);
                    console.log(`resolve= ${value}`);
                });
            });
        });
    }
}

module.exports = CoconutSPeripheral;
