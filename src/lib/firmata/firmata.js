// Built-in Dependencies
const Emitter = require('events');
const Buffer = require('buffer').Buffer;

// Internal Dependencies
const Encoder7Bit = require('./encoder7bit');
const OneWire = require('./onewireutils');

// Program specifics
const i2cActive = new Map();

/**
 * constants
 */

const ANALOG_MAPPING_QUERY = 0x69;
const ANALOG_MAPPING_RESPONSE = 0x6A;
const ANALOG_MESSAGE = 0xE0;
const CAPABILITY_QUERY = 0x6B;
const CAPABILITY_RESPONSE = 0x6C;
const DIGITAL_MESSAGE = 0x90;
const END_SYSEX = 0xF7; // 0x0A;
const EXTENDED_ANALOG = 0x6F;
const I2C_CONFIG = 0x78;
const I2C_REPLY = 0x77;
const I2C_REQUEST = 0x76;
const I2C_READ_MASK = 0x18; // 0b00011000
// const I2C_END_TX_MASK = 0x40; // 0b01000000
const ONEWIRE_CONFIG_REQUEST = 0x41;
const ONEWIRE_DATA = 0x73;
const ONEWIRE_DELAY_REQUEST_BIT = 0x10;
const ONEWIRE_READ_REPLY = 0x43;
const ONEWIRE_READ_REQUEST_BIT = 0x08;
const ONEWIRE_RESET_REQUEST_BIT = 0x01;
const ONEWIRE_SEARCH_ALARMS_REPLY = 0x45;
const ONEWIRE_SEARCH_ALARMS_REQUEST = 0x44;
const ONEWIRE_SEARCH_REPLY = 0x42;
const ONEWIRE_SEARCH_REQUEST = 0x40;
const ONEWIRE_WITHDATA_REQUEST_BITS = 0x3C;
const ONEWIRE_WRITE_REQUEST_BIT = 0x20;
const PIN_MODE = 0xF4;
const PIN_STATE_QUERY = 0x6D;
const PIN_STATE_RESPONSE = 0x6E;
const PING_READ = 0x75;
// const PULSE_IN = 0x74;
// const PULSE_OUT = 0x73;
const QUERY_FIRMWARE = 0x79;
const REPORT_ANALOG = 0xC0;
const REPORT_DIGITAL = 0xD0;
const REPORT_VERSION = 0xF9;
const SAMPLING_INTERVAL = 0x7A;
const SERVO_CONFIG = 0x70;
const SERIAL_MESSAGE = 0x60;
const SERIAL_CONFIG = 0x10;
// const SERIAL_WRITE = 0x20;
// const SERIAL_READ = 0x30;
const SERIAL_REPLY = 0x40;
// const SERIAL_CLOSE = 0x50;
// const SERIAL_FLUSH = 0x60;
// const SERIAL_LISTEN = 0x70;
const START_SYSEX = 0xF0; // 0xFF; //
const STEPPER = 0x72;
const ACCELSTEPPER = 0x62;
const STRING_DATA = 0x71;
const SYSTEM_RESET = 0xFF;

const MAX_PIN_COUNT = 128;

// coconutS protocol
// const DEV_MOTOR = 0x1a;
// const MOTOR_CMD_0 = 0x00;

/**
 * coconutS response ID
 * @type {number}
 */
const RESET_RESPONSE = 0x04;

const BUZZER = 0x03;
const BUZZER_RESPONSE = 0x03;
const DISTANCE_RESPONSE = 0x05;
const LINE_TRACER_RESPONSE = 0x07;
const LIGHT_RESPONSE = 0x0E;
const ACCELEROMETER_RESPONSE = 0x12;
const TEMPERATURE_RESPONSE = 0x15;
const RGB_RESPONSE = 0x19;
const MOTOR_RESPONSE = 0x1A;
const MATRIX_RESPONSE = 0x1B;
const SPEAKER = 0x29;       // 41
const SERVO_MOTOR = 0x2B;   // 43
const EXT_LED = 0x2C;       // 44
const EXT_MOTOR = 0x2E;     // 46
const TOUCH_SENSOR = 0x2F;  // 47
const MIKE_SENSOR = 0x30;   // 48

/**
 * action type
 * @type {{GET: number, RUN: number, RESET: number}}
 */
const ACTION = {
    GET: 0x01,
    RUN: 0x02,
    RESET: 0x04
};

/**
 * sensor ID in Coconut
 * @type {{IRdistance: number, LineTracer: number, Temperature: number, Motor: number, LedMatrix: number, Accelerometer: number, Buzzer: number, IR: number, RGBled: number, LightSensor: number}}
 */
// const SENSOR = {
//     LightSensor: 14,
//     Accelerometer: 18,
//     Temperature: 21,
//     Buzzer: 3,
//     IRdistance: 5,
//     LineTracer: 7,
//     IR: 9,
//     RGBled: 25,
//     Motor: 26,
//     LedMatrix: 27 // 0x1b
// };

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
 * RGB LED command
 * @type {{ON_TIME: number, RAINBOW: number, ON_COLOR: number, OFF: number}}
 */
const RGB_CMD = {
    ON_COLOR: 0x00,
    OFF: 0x01,
    ON_TIME: 0x03,
    RAINBOW: 0x04
};

/**
 * Buzzer command
 * @type {{}}
 */
const BUZZER_CMD = {
    ON: 0x00,
    REST_BEAT: 0x01,
    NOTE: 0x02,
    NOTE_RGB: 0x03,
    NOTE_BEAT: 0x04,
    NOTE_BEAT_RGB: 0x05,
    MELODY: 0x06,
    CHANGE_BEAT: 0x08
};

/**
 * LineTracer command
 * @type {{MOVE: number, STOP: number, CM: number, DEGREE: number, RGB: number}}
 */
const LINE_TRACER_CMD = {
    GET_RAW: 0x00,
    DETECT_SINGLE: 0x01,
    FOLLOW: 0x03,
    DETECT_INT: 0x04,
    TURN_BLACK: 0x05,
    DETECT_NONE: 0x06
};

/**
 * IR Distance sensor command
 * @type {{DETECT_ALL: number, AVOID: number, GET_RAW: number, DETECT: number, OFF: number}}
 */
const DISTANCE_CMD = {
    GET_RAW: 0x00,
    DETECT: 0x01,
    DETECT_ALL: 0x02,
    AVOID: 0x03,
    OFF: 0x04
};

/**
 * LED Matrix command
 * @type {{NUMBER: number, EN_LARGE: number, OFF_ALL: number, ON_ALL: number, EN_SMALL: number, FREE: number, ON: number, KOREAN: number}}
 */
const MATRIX_CMD = {
    ON: 0x00,
    NUMBER: 0x01,
    EN_SMALL: 0x02,
    EN_CAPITAL: 0x03,
    KOREAN: 0x04,
    OFF_ALL: 0x05,
    ON_ALL: 0x06,
    FREE: 0x07
};

/**
 * External motor command
 * @type {{SET_SPEED: number, MOVE: number}}
 */
const EXT_MOTOR_CMD = {
    SET_SPEED: 0x01,
    MOVE: 0x02
};

const symbolSendOneWireSearch = Symbol('sendOneWireSearch');
const symbolSendOneWireRequest = Symbol('sendOneWireRequest');

const decode32BitSignedInteger = function (bytes) {
    let result = (bytes[0] & 0x7F) |
        ((bytes[1] & 0x7F) << 7) |
        ((bytes[2] & 0x7F) << 14) |
        ((bytes[3] & 0x7F) << 21) |
        ((bytes[4] & 0x07) << 28);

    if (bytes[4] >> 3) {
        result *= -1;
    }
    return result;
};

/**
 * writeToTransport Due to the non-blocking behaviour of transport write
 *                   operations, dependent programs need a way to know
 *                   when all writes are complete. Every write increments
 *                   a `pending` value, when the write operation has
 *                   completed, the `pending` value is decremented.
 *
 * @param  {Board} board An active Board instance
 * @param  {Array} data  An array of 8 and 7 bit values that will be
 *                       wrapped in a Buffer and written to the transport.
 */
const writeToTransport = function (board, data) {
    board.transportWrite(data);
};

const encode32BitSignedInteger = function (data) {
    const negative = data < 0;

    data = Math.abs(data);

    const encoded = [
        data & 0x7F,
        (data >> 7) & 0x7F,
        (data >> 14) & 0x7F,
        (data >> 21) & 0x7F,
        (data >> 28) & 0x07
    ];

    if (negative) {
        encoded[encoded.length - 1] |= 0x08;
    }

    return encoded;
};

const MAX_SIGNIFICAND = Math.pow(2, 23);

const encodeCustomFloat = function (input) {
    const sign = input < 0 ? 1 : 0;

    input = Math.abs(input);

    const base10 = Math.floor(Math.log10(input));
    // Shift decimal to start of significand
    let exponent = 0 + base10;
    input /= Math.pow(10, base10);

    // Shift decimal to the right as far as we can
    while (!Number.isInteger(input) && input < MAX_SIGNIFICAND) {
        exponent -= 1;
        input *= 10;
    }

    // Reduce precision if necessary
    while (input > MAX_SIGNIFICAND) {
        exponent += 1;
        input /= 10;
    }

    input = Math.trunc(input);
    exponent += 11;

    const encoded = [
        input & 0x7F,
        (input >> 7) & 0x7F,
        (input >> 14) & 0x7F,
        ((input >> 21) & 0x03) | ((exponent & 0x0F) << 2) | ((sign & 0x01) << 6)
    ];

    return encoded;
};

const i2cRequest = function (board, bytes) {
    const active = i2cActive.get(board);

    if (!active) {
        throw new Error('I2C is not enabled for this board. To enable, call the i2cConfig() method.');
    }

    // Do not tamper with I2C_CONFIG messages
    if (bytes[1] === I2C_REQUEST) {
        const address = bytes[2];

        // If no peripheral settings exist, make them.
        if (!active[address]) {
            active[address] = {
                stopTX: true
            };
        }

        // READ (8) or CONTINUOUS_READ (16)
        // value & 0b00011000
        if (bytes[3] & I2C_READ_MASK) {
            // Invert logic to accomodate default = true,
            // which is actually stopTX = 0
            bytes[3] |= Number(!active[address].stopTX) << 6;
        }
    }

    writeToTransport(board, bytes);
};

/**
 * MIDI_RESPONSE contains functions to be called when we receive a MIDI message from the arduino.
 * used as a switch object as seen here http://james.padolsey.com/javascript/how-to-avoid-switch-case-syndrome/
 * @private
 */

const MIDI_RESPONSE = {

    /**
     * Handles a REPORT_VERSION response and emits the reportversion event.
     * @private
     * @param {Board} board the current arduino board we are working with.
     */
    [REPORT_VERSION] (board) {
        board.version.major = board.buffer[1];
        board.version.minor = board.buffer[2];
        board.emit('reportversion');
    },

    /**
     * Handles a ANALOG_MESSAGE response and emits "analog-read" and "analog-read-"+n events where n is the pin number.
     * @private
     * @param {Board} board the current arduino board we are working with.
     */
    [ANALOG_MESSAGE] (board) {
        const pin = board.buffer[0] & 0x0F;
        const value = board.buffer[1] | (board.buffer[2] << 7);

        /* istanbul ignore else */
        if (board.pins[board.analogPins[pin]]) {
            board.pins[board.analogPins[pin]].value = value;
        }

        board.emit(`analog-read-${pin}`, value);
        board.emit('analog-read', {
            pin,
            value
        });
    },

    /**
     * Handles a DIGITAL_MESSAGE response and emits:
     * "digital-read"
     * "digital-read-"+n
     *
     * Where n is the pin number.
     *
     * @private
     * @param {Board} board the current arduino board we are working with.
     */
    [DIGITAL_MESSAGE] (board) {
        const port = board.buffer[0] & 0x0F;
        const portValue = board.buffer[1] | (board.buffer[2] << 7);

        for (let i = 0; i < 8; i++) {
            const pin = (8 * port) + i;
            const pinRec = board.pins[pin];
            const bit = 1 << i;

            if (pinRec && (pinRec.mode === board.MODES.INPUT || pinRec.mode === board.MODES.PULLUP)) {
                pinRec.value = (portValue >> (i & 0x07)) & 0x01;

                if (pinRec.value) {
                    board.ports[port] |= bit;
                } else {
                    board.ports[port] &= ~bit;
                }

                const {value} = pinRec;

                board.emit(`digital-read-${pin}`, value);
                board.emit('digital-read', {
                    pin,
                    value
                });
            }
        }
    }
};

/**
 * SYSEX_RESPONSE contains functions to be called when we receive a SYSEX message from the arduino.
 * used as a switch object as seen here http://james.padolsey.com/javascript/how-to-avoid-switch-case-syndrome/
 * @private
 */
const SYSEX_RESPONSE = {

    /**
     * Handles a QUERY_FIRMWARE response and emits the "queryfirmware" event
     * @private
     * @param {Board} board the current arduino board we are working with.
     */
    [QUERY_FIRMWARE] (board) {
        const length = board.buffer.length - 2;
        const buffer = Buffer.alloc(Math.round((length - 4) / 2));
        let byte = 0;
        let offset = 0;

        for (let i = 4; i < length; i += 2) {
            byte = ((board.buffer[i] & 0x7F) | ((board.buffer[i + 1] & 0x7F) << 7)) & 0xFF;
            buffer.writeUInt8(byte, offset++);
        }

        board.firmware = {
            name: buffer.toString(),
            version: {
                major: board.buffer[2],
                minor: board.buffer[3]
            }
        };

        board.emit('queryfirmware');
    },

    /**
     * Handles a CAPABILITY_RESPONSE response and emits the "capability-query" event
     * @private
     * @param {Board} board the current arduino board we are working with.
     */
    [CAPABILITY_RESPONSE] (board) {
        const modes = Object.keys(board.MODES).map(key => board.MODES[key]);
        let mode; let resolution;
        let capability = 0;

        const supportedModes = function (_capability) {
            return modes.reduce((accum, _mode) => {
                if (_capability & (1 << _mode)) {
                    accum.push(_mode);
                }
                return accum;
            }, []);
        };

        // Only create pins if none have been previously created on the instance.
        if (!board.pins.length) {
            for (let i = 2, n = 0; i < board.buffer.length - 1; i++) {
                if (board.buffer[i] === 0x7F) {
                    board.pins.push({
                        supportedModes: supportedModes(capability),
                        mode: null,
                        value: 0,
                        report: 1
                    });
                    capability = 0;
                    n = 0;
                    continue;
                }
                if (n === 0) {
                    mode = board.buffer[i];
                    resolution = (1 << board.buffer[i + 1]) - 1;
                    capability |= (1 << mode);

                    // ADC Resolution of Analog Inputs
                    if (mode === board.MODES.ANALOG && board.RESOLUTION.ADC === null) {
                        board.RESOLUTION.ADC = resolution;
                    }

                    // PWM Resolution of PWM Outputs
                    if (mode === board.MODES.PWM && board.RESOLUTION.PWM === null) {
                        board.RESOLUTION.PWM = resolution;
                    }

                    // DAC Resolution of DAC Outputs
                    // if (mode === board.MODES.DAC && board.RESOLUTION.DAC === null) {
                    //   board.RESOLUTION.DAC = resolution;
                    // }
                }
                n ^= 1;
            }
        }

        board.emit('capability-query');
    },

    /**
     * Handles a PIN_STATE response and emits the 'pin-state-'+n event where n is the pin number.
     *
     * Note about pin state: For output modes, the state is any value that has been
     * previously written to the pin. For input modes, the state is the status of
     * the pullup resistor.
     * @private
     * @param {Board} board the current arduino board we are working with.
     */

    [PIN_STATE_RESPONSE] (board) {
        const pin = board.buffer[2];
        board.pins[pin].mode = board.buffer[3];
        board.pins[pin].state = board.buffer[4];
        if (board.buffer.length > 6) {
            board.pins[pin].state |= (board.buffer[5] << 7);
        }
        if (board.buffer.length > 7) {
            board.pins[pin].state |= (board.buffer[6] << 14);
        }
        board.emit(`pin-state-${pin}`);
    },

    /**
     * Handles a ANALOG_MAPPING_RESPONSE response and emits the "analog-mapping-query" event.
     * @private
     * @param {Board} board the current arduino board we are working with.
     */

    [ANALOG_MAPPING_RESPONSE] (board) {
        let pin = 0;
        let currentValue;
        for (let i = 2; i < board.buffer.length - 1; i++) {
            currentValue = board.buffer[i];
            board.pins[pin].analogChannel = currentValue;
            if (currentValue !== 127) {
                board.analogPins.push(pin);
            }
            pin++;
        }
        board.emit('analog-mapping-query');
    },

    /**
     * Handles a I2C_REPLY response and emits the "I2C-reply-"+n event where n is the slave address of the I2C device.
     * The event is passed the buffer of data sent from the I2C Device
     * @private
     * @param {Board} board the current arduino board we are working with.
     */

    [I2C_REPLY] (board) {
        const reply = [];
        const address = (board.buffer[2] & 0x7F) | ((board.buffer[3] & 0x7F) << 7);
        const register = (board.buffer[4] & 0x7F) | ((board.buffer[5] & 0x7F) << 7);

        for (let i = 6, length = board.buffer.length - 1; i < length; i += 2) {
            reply.push(board.buffer[i] | (board.buffer[i + 1] << 7));
        }

        board.emit(`I2C-reply-${address}-${register}`, reply);
    },

    [ONEWIRE_DATA] (board) {
        const subCommand = board.buffer[2];

        if (!SYSEX_RESPONSE[subCommand]) {
            return;
        }

        SYSEX_RESPONSE[subCommand](board);
    },

    [ONEWIRE_SEARCH_REPLY] (board) {
        const pin = board.buffer[3];
        const buffer = board.buffer.slice(4, board.buffer.length - 1);

        board.emit(`1-wire-search-reply-${pin}`, OneWire.readDevices(buffer));
    },

    [ONEWIRE_SEARCH_ALARMS_REPLY] (board) {
        const pin = board.buffer[3];
        const buffer = board.buffer.slice(4, board.buffer.length - 1);

        board.emit(`1-wire-search-alarms-reply-${pin}`, OneWire.readDevices(buffer));
    },

    [ONEWIRE_READ_REPLY] (board) {
        const encoded = board.buffer.slice(4, board.buffer.length - 1);
        const decoded = Encoder7Bit.from7BitArray(encoded);
        const correlationId = (decoded[1] << 8) | decoded[0];

        board.emit(`1-wire-read-reply-${correlationId}`, decoded.slice(2));
    },

    /**
     * Handles a STRING_DATA response and logs the string to the console.
     * @private
     * @param {Board} board the current arduino board we are working with.
     */

    [STRING_DATA] (board) {
        board.emit('string', Buffer.from(board.buffer.slice(2, -1)).toString()
            .replace(/\0/g, ''));
    },

    /**
     * Response from pingRead
     */

    [PING_READ] (board) {
        const pin = (board.buffer[2] & 0x7F) | ((board.buffer[3] & 0x7F) << 7);
        const durationBuffer = [
            (board.buffer[4] & 0x7F) | ((board.buffer[5] & 0x7F) << 7),
            (board.buffer[6] & 0x7F) | ((board.buffer[7] & 0x7F) << 7),
            (board.buffer[8] & 0x7F) | ((board.buffer[9] & 0x7F) << 7),
            (board.buffer[10] & 0x7F) | ((board.buffer[11] & 0x7F) << 7)
        ];
        const duration = ((durationBuffer[0] << 24) +
            (durationBuffer[1] << 16) +
            (durationBuffer[2] << 8) +
            (durationBuffer[3]));
        board.emit(`ping-read-${pin}`, duration);
    },

    /**
     * Handles the message from a stepper completing move
     * @param {Board} board
     */

    [STEPPER] (board) {
        const deviceNum = board.buffer[2];
        board.emit(`stepper-done-${deviceNum}`, true);
    },

    /**
     * Handles the message from a stepper or group of steppers completing move
     * @param {Board} board
     */

    [ACCELSTEPPER] (board) {
        const command = board.buffer[2];
        const deviceNum = board.buffer[3];
        const value = command === 0x06 || command === 0x0A ?
            decode32BitSignedInteger(board.buffer.slice(4, 9)) : null;

        if (command === 0x06) {
            board.emit(`stepper-position-${deviceNum}`, value);
        }
        if (command === 0x0A) {
            board.emit(`stepper-done-${deviceNum}`, value);
        }
        if (command === 0x24) {
            board.emit(`multi-stepper-done-${deviceNum}`);
        }
    },

    /**
     * Handles a SERIAL_REPLY response and emits the "serial-data-"+n event where n is the id of the
     * serial port.
     * The event is passed the buffer of data sent from the serial device
     * @private
     * @param {Board} board the current arduino board we are working with.
     */

    [SERIAL_MESSAGE] (board) {
        const command = board.buffer[2] & START_SYSEX;
        const portId = board.buffer[2] & 0x0F;
        const reply = [];

        /* istanbul ignore else */
        if (command === SERIAL_REPLY) {
            for (let i = 3, len = board.buffer.length; i < len - 1; i += 2) {
                reply.push((board.buffer[i + 1] << 7) | board.buffer[i]);
            }
            board.emit(`serial-data-${portId}`, reply);
        }
    },
    /**
     * stop all blocks
     * remove all event listeners, stop all
      * @param board
     */
    [RESET_RESPONSE] (board) {
        console.log(`EVENT : STOP ALL`);
        board.emit(`stop-all`, true);
    },
    /**
     * Handles a Motor response and emits the 'coconut-motor-move-' + n event where n is command of the block parameter
     * @param board
     */
    [MOTOR_RESPONSE] (board) {
        // console.log(`EVENT : motor response...`);
        console.log(`EVENT : send buffer= ${board._sendBuffer}`);
        // console.log(`typeof cmd ${typeof board._sendBuffer[6]}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;

        // ff 55 06 00 02 1a(26) 0 03 3c(60) / move motor forward/backward
        // ff 55 04 00 02 1a(26) 01 / stop motor
        switch (command) {
        // 전/후진, 좌/우회전
        case MOTOR_CMD.MOVE:
            direction = board._sendBuffer[7];
            console.log(`handler : move-motor-${direction}`);
            // board.emit(`move-motor-${_direction}`, true);
            board.emit(`move-motor-${direction}`);
            break;
            // 정지
        case MOTOR_CMD.STOP:
            console.log(`handler : stop-motor`);
            board.emit('stop-motor');
            break;
            // 전/후진/좌/우회전 + 시간
        case MOTOR_CMD.TIME:
            direction = board._sendBuffer[7];
            console.log(`handler : move-motor-time-${direction}`);
            board.emit(`move-motor-time-${direction}`, true);
            break;
            // 전/후진/좌/우회전 + RGB
        case MOTOR_CMD.RGB:
            console.log(`handler : motor-rgb-{direction}-{rgb}`);
            direction = board._sendBuffer[7];
            const color = board._sendBuffer[9];
            board.emit(`motor-rgb-${direction}-${color}`);
            break;
        case MOTOR_CMD.CM:
            console.log(`handler : motor-cm-{direction}`);
            direction = board._sendBuffer[7];
            board.emit(`motor-cm-${direction}`, true);
            break;
        case MOTOR_CMD.DEGREE:
            direction = board._sendBuffer[7];
            console.log(`handler : motor-degree-${direction}`);
            board.emit(`motor-degree-${direction}`, true);
            break;
        }

    },
    /**
     * Handles a RGB LED response and emits the 'rgb-' + n event where n is command of the block parameter
     * @param board
     */
    [RGB_RESPONSE] (board) {
        console.log(`EVENT : RGB`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];
        let direction;
        let color;
        let error;

        if (action !== 0x02) {
            error = `Error: invalid response`;
        }

        // ff 55 06 00 02 1a(26) 0 03 3c(60) / move motor forward/backward
        // ff 55 04 00 02 1a(26) 01 / stop motor
        switch (command) {
        // RGB on
        case RGB_CMD.ON_COLOR:
            direction = board._sendBuffer[7];
            color = board._sendBuffer[8];
            console.log(`handler : rgb-on-${direction}-${color}`);
            // board.emit(`move-motor-${_direction}`, true);

            if (error) {
                board.emit(`rgb-on-${direction}-${color}`, error);
            } else {
                board.emit(`rgb-on-${direction}-${color}`);
            }
            break;
            // RGB off
        case RGB_CMD.OFF:
            direction = board._sendBuffer[7];
            color = board._sendBuffer[8];
            console.log(`handler : rgb-off-${direction}-${color}`);

            if (error) {
                board.emit(`rgb-off-${direction}-${color}`, error);
            } else {
                board.emit(`rgb-off-${direction}-${color}`);
            }
            break;
        case RGB_CMD.ON_TIME:
            direction = board._sendBuffer[7];
            color = board._sendBuffer[8];
            console.log(`handler : rgb-time-${direction}-${color}`);

            const msg = (error) ? error : true;
            board.emit(`rgb-time-${direction}-${color}`, msg);
            break;
        }
    },
    /**
     * Handles a Buzzer response and emits the 'buzzer-' + n event where n is command of the block parameter
     * @param board
     */
    [BUZZER_RESPONSE] (board) {
        console.log(`EVENT : BUZZER`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];
        let direction;
        let color;
        let error;

        if (action !== ACTION.RUN) {
            error = `Error: invalid response`;
        }

        // ff 55 06 00 02 1a(26) 0 03 3c(60) / move motor forward/backward
        // ff 55 04 00 02 1a(26) 01 / stop motor
        switch (command) {
        // buzzer on
        case BUZZER_CMD.ON: {
            // direction = board._sendBuffer[7];
            // color = board._sendBuffer[8];
            console.log(`handler : buzzer-{on|time|freq|off}`);
            // board.emit(`move-motor-${_direction}`, true);

            const freq = `${board._sendBuffer[7]}${board._sendBuffer[8]}`;
            const duration = `${board._sendBuffer[9]}${board._sendBuffer[10]}`;

            const msg = (error) ? error : true;
            board.emit(`buzzer-on`, msg);
            board.emit(`buzzer-time-${freq}-${duration}`, msg); // buzzer + frequency + duration
            board.emit(`buzzer-freq-${freq}-${duration}`, msg); // buzzer + frequency + duration
            board.emit(`buzzer-off-${freq}-${duration}`, msg); // buzzer + frequency + duration
            break;
        }
        case BUZZER_CMD.NOTE_BEAT: {
            // direction = board._sendBuffer[7];
            // color = board._sendBuffer[8];
            console.log(`handler : buzzer-note-{note}-{octave}-{sharp}`);
            const note = board._sendBuffer[7];
            const octave = board._sendBuffer[8];
            const sharp = board._sendBuffer[9];

            const msg = (error) ? error : true;
            board.emit(`buzzer-note-${note}-${octave}-${sharp}`, msg);
            break;
        }
        case BUZZER_CMD.REST_BEAT: {
	            console.log(`handler : buzzer-rest-{duration}`);
	            // const freq = `${board._sendBuffer[7]}${board._sendBuffer[8]}`;
	            const duration = `${board._sendBuffer[9]}${board._sendBuffer[10]}`;

	            const msg = (error) ? error : true;
	            board.emit(`buzzer-rest-${duration}`, msg);
	            break;
        }
        case BUZZER_CMD.NOTE_BEAT_RGB: {
            console.log(`handler : buzzer-note-color-{note}{octave}{sharp}-{beat}-{direction}-{color}`);
            // const freq = `${board._sendBuffer[7]}${board._sendBuffer[8]}`;
            const note = board._sendBuffer[7];
            const octave = board._sendBuffer[8];
            const sharp = board._sendBuffer[9];
            const beat = `${board._sendBuffer[10]}${board._sendBuffer[11]}`;
            const direction = board._sendBuffer[12];
            const color = board._sendBuffer[13];

            const msg = (error) ? error : true;
            board.emit(`buzzer-note-color-${note}${octave}${sharp}-${beat}-${direction}-${color}`, msg);
            break;
        }
        case BUZZER_CMD.CHANGE_BEAT: {
            console.log(`handler : buzzer-change-{beat}`);
            const beat = `${board._sendBuffer[7]}${board._sendBuffer[8]}`;

            const msg = (error) ? error : true;
            board.emit(`buzzer-change-${beat}`, msg);
            break;
        }
        }
    },
    /**
     * Handles a Line-tracer response and emits the 'line-tracer-' + n event where n is command of the block parameter
     * @param board
     */
    [LINE_TRACER_RESPONSE] (board) {
        // console.log(`EVENT : motor response...`);
        console.log(`EVENT : Line Tracer`);
        console.log(`send buffer= ${board._sendBuffer}`);
        // console.log(`typeof cmd ${typeof board._sendBuffer[6]}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case LINE_TRACER_CMD.GET_RAW:
            direction = board._sendBuffer[7];
            console.log(`handler : line-tracer-read-${direction}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`line-tracer-read-${direction}`, value);
            break;
        case LINE_TRACER_CMD.DETECT_SINGLE:
            direction = board._sendBuffer[7];
            const detect = board._sendBuffer[8];

            console.log(`handler : line-tracer-detect-${direction}-${detect}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                console.log(`value= ${value}`);
                value = (value === 1);
            } else {
                value = error;
            }

            board.emit(`line-tracer-detect-${direction}-${detect}`, value);
            break;
        case LINE_TRACER_CMD.FOLLOW:
            _direction = board._sendBuffer[7];
            console.log(`handler : move-motor-time-${_direction}`);
            board.emit(`move-motor-time-${_direction}`, true);
            break;
        case LINE_TRACER_CMD.DETECT_INT:
            console.log(`handler : line-tracer-detects`);

            // direction = board._sendBuffer[7];
            // const detect = board._sendBuffer[8];

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                console.log(`value= ${value}`);
                // value = (value === 1);
            } else {
                value = error;
            }

            board.emit('line-tracer-detects', value);
            break;
        case LINE_TRACER_CMD.TURN_BLACK:
            const exCmd = board._sendBuffer[7];
            console.log(`handler : line-tracer-command-${exCmd}`);

            if (action === ACTION.RUN) {
                value = true;
                // console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`line-tracer-command-${exCmd}`, value);
            break;
            // case LINE_TRACER_CMD.DETECT_NONE:
            //     console.log(`handler : move-motor-degree`);
            //     board.emit('move-motor-degree');
            //     break;
        case LINE_TRACER_CMD.FOLLOW: {
            const exCmd = board._sendBuffer[7];
            console.log(`handler : follow-line`);

            if (action === ACTION.RUN) {
                value = true;
                // console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`follow-line`, value);
            break;

        }
        }
    },
    /**
     * Handles a IR Distance sensor response and emits the 'distance-' + n event where n is command of the block parameter
     * @param board
     */
    [DISTANCE_RESPONSE] (board) {
        console.log(`EVENT : IR Distance`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case DISTANCE_CMD.GET_RAW:
            direction = board._sendBuffer[7];
            console.log(`handler : distance-read-${direction}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`distance-read-${direction}`, value);
            break;
        case DISTANCE_CMD.DETECT: {
            direction = board._sendBuffer[7];
            const detect = board._sendBuffer[8];
            console.log(`handler : distance-detect-${direction}-${detect}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                value = (value === 1);
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`distance-detect-${direction}-${detect}`, value);
            break;
        }
        case DISTANCE_CMD.DETECT_ALL: {
            console.log(`handler : distance-detect-all`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                value = (value === 1); // return boolean
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`distance-detect-all`, value);
            break;
        }
        case DISTANCE_CMD.AVOID: {
            console.log(`handler : avoid-mode`);

            if (action === ACTION.RUN) {
                value = true;
            } else {
                value = error;
            }

            board.emit(`avoid-mode`, value);
            break;
        }
        }
    },
    /**
     * Handles a LED Matrix response and emits the 'matrix-' + n event where n is command of the block parameter
     * @param board
     */
    [MATRIX_RESPONSE] (board) {
        console.log(`EVENT : LED Matrix`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case MATRIX_CMD.ON: {
            const row = board._sendBuffer[7];
            const col = board._sendBuffer[8];
            const on = board._sendBuffer[9];

            console.log(`handler : matrix-${row}-${col}-${on}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-${row}-${col}-${on}`, value);
            break;
        }
        case MATRIX_CMD.ON_ALL: {
            console.log(`handler : matrix-on-all`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-on-all`, value);
            break;
        }
        case MATRIX_CMD.OFF_ALL: {
            console.log(`handler : matrix-off-all`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-off-all`, value);
            break;
        }
        case MATRIX_CMD.NUMBER: {
            const num = board._sendBuffer[7];
            console.log(`handler : matrix-num-${num}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-num-${num}`, value);
            break;
        }
        case MATRIX_CMD.EN_SMALL: {
            const letter = board._sendBuffer[7];
            console.log(`handler : matrix-small-${letter}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-small-${letter}`, value);
            break;
        }
        case MATRIX_CMD.EN_CAPITAL: {
            const letter = board._sendBuffer[7];
            console.log(`handler : matrix-capital-${letter}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-capital-${letter}`, value);
            break;
        }
        case MATRIX_CMD.KOREAN: {
            const letter = board._sendBuffer[7];
            console.log(`handler : matrix-kr-${letter}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`matrix-kr-${letter}`, value);
            break;
        }
        }
    },
    /**
     * Handles a Light sensor response and emits the 'light-' + n event where n is command of the block parameter
     * @param board
     */
    [LIGHT_RESPONSE] (board) {
        console.log(`EVENT : Light`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case 0: {
            const letter = board._sendBuffer[7];
            console.log(`handler : light`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                // value = (value === 1); // return boolean
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            // value = (action === ACTION.RUN) ? true : error;
            board.emit(`light`, value);
            break;
        }
        }
    },
    /**
     * Handles a Temperature sensor response and emits the 'temperature-' + n event where n is command of the block parameter
     * @param board
     */
    [TEMPERATURE_RESPONSE] (board) {
        console.log(`EVENT : Temperature`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case 0: {
            console.log(`handler : temperature`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                // value = (value === 1); // return boolean
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            // value = (action === ACTION.RUN) ? true : error;
            board.emit(`temperature`, value);
            break;
        }
        }
    },
    /**
     * Handles a Accelerometer sensor response and emits the 'acc-' + n event where n is command of the block parameter
     * @param board
     */
    [ACCELEROMETER_RESPONSE] (board) {
        console.log(`EVENT : Accelerometer`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case 0: {
            const axis = board._sendBuffer[7];
            console.log(`handler : acc-${axis}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                // value = (value === 1); // return boolean
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            // value = (action === ACTION.RUN) ? true : error;
            board.emit(`acc-${axis}`, value);
            break;
        }
        }
    },
    /**
     * Handles a External motor response and emits the 'ext-motor-' + n event where n is command of the block parameter
     * @param board
     */
    [EXT_MOTOR] (board) {
        console.log(`EVENT : External Motor`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const command = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        switch (command) {
        case EXT_MOTOR_CMD.MOVE: {
            direction = board._sendBuffer[7];
            console.log(`handler : ext-motor-${direction}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`ext-motor-${direction}`, value);
            break;
        }
        case EXT_MOTOR_CMD.SET_SPEED: {
            direction = board._sendBuffer[7];
            console.log(`handler : ext-motor-set-${direction}`);

            value = (action === ACTION.RUN) ? true : error;
            board.emit(`ext-motor-set-${direction}`, value);
            break;
        }
        }
    },
    /**
     * Handles a servo motor response and emits the 'servo-motor-' + n event where n is command of the block parameter
     // eslint-disable-next-line valid-jsdoc
     * @param board
     */
    [SERVO_MOTOR] (board) {
        console.log(`EVENT : Servo Motor`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const pin = board._sendBuffer[6];
        const angle = board._sendBuffer[7];

        const error = `Error: invalid response`;

        console.log(`handler : servo-motor-${pin}-${angle}`);

        const value = (action === ACTION.RUN) ? true : error;
        board.emit(`servo-motor-${pin}-${angle}`, value);
    },
    /**
     * Handles a external LED sensor response and emits the 'ext-led-' + n event where n is command of the block parameter
     * @param board
     */
    [EXT_LED] (board) {
        console.log(`EVENT : External Led`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const pin = board._sendBuffer[6];

        const error = `Error: invalid response`;

        console.log(`handler : ext-led-${pin}`);

        const value = (action === ACTION.RUN) ? true : error;
        board.emit(`ext-led-${pin}`, value);
    },
    /**
     * Handles a external Speaker sensor response and emits the 'speaker-' + n event where n is command of the block parameter
     * @param board
     */
    [SPEAKER] (board) {
        console.log(`EVENT : External Speaker`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const pin = board._sendBuffer[6];

        const error = `Error: invalid response`;

        console.log(`handler : speaker-${pin}`);

        const value = (action === ACTION.RUN) ? true : error;
        board.emit(`speaker-${pin}`, value);
    },
    /**
     * Handles a external Touch sensor response and emits the 'touch-' + n event where n is command of the block parameter
     * @param board
     */
    [TOUCH_SENSOR] (board) {
        console.log(`EVENT : External Touch`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const len = board._sendBuffer[2];
        const action = board._sendBuffer[4];
        const pin = board._sendBuffer[6];

        let direction;
        const error = `Error: invalid response`;
        let value;

        // read touch sensor
        if (len === 4) {
            const pin = board._sendBuffer[6];
            console.log(`handler : touch-pressed-${pin}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                value = (value === 1); // return boolean
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`touch-pressed-${pin}`, value);
        }
        // read touch sensor pressed
        else if (len === 5) {
            const pin = board._sendBuffer[7];
            console.log(`handler : touch-${pin}`);

            if (action === ACTION.GET) {
                value = getSensorValue(board.buffer);
                // value = (value === 1); // return boolean
                console.log(`value= ${value}`);
            } else {
                value = error;
            }

            board.emit(`touch-${pin}`, value);
        }
    },
    /**
     * Handles a external Mike sensor response and emits the 'mike-' + n event where n is command of the block parameter
     * @param board
     */
    [MIKE_SENSOR] (board) {
        console.log(`EVENT : External Mike sensor`);
        console.log(`send buffer= ${board._sendBuffer}`);

        const action = board._sendBuffer[4];
        const pin = board._sendBuffer[6];

        const error = `Error: invalid response`;

        console.log(`handler : mike-${pin}`);

        let value;
        if (action === ACTION.GET) {
            value = getSensorValue(board.buffer);
            // value = (value === 1); // return boolean
            console.log(`value= ${value}`);
        }
        else {
            value = error;
        }

        board.emit(`mike-${pin}`, value);
    }
};

const parseShort = (a, b) => (a << 8) | (b << 0);

// const readShort = function (arr, position) {
const readShort = (arr, position) => {
    const s = [arr[position + 1], arr[position]];
    console.log(`${JSON.stringify(s)}`);
    return parseShort(...s);
}; // function

/**
 * convert byte array (4 bytes) to float
 * @param data
 * @returns {number}
 */
const parseFloat = function (data) {
    // var data =  [64, 226, 157, 10];

    // Create a buffer
    const buf = new ArrayBuffer(4);
    // Create a data view of it
    const view = new DataView(buf);

    // set bytes
    data.forEach((b, i) => {
        view.setUint8(i, b);
    });

    // Read the bits as a float; note that by doing this, we're implicitly
    // converting it from a 32-bit float into JavaScript's native 64-bit double
    const num = view.getFloat32(0);
    // Done
    console.log(`float = ${num}`);
    return num;
};

const readFloat = function (arr, position) {
    // const f = [arr[position], arr[position + 1], arr[position + 2], arr[position + 3]];
    const f = [arr[position + 3], arr[position + 2], arr[position + 1], arr[position]];
    return parseFloat(f);
}; // function


const readDouble = function (arr, position) {
    return readFloat(arr, position);
};// function

const readString = function (arr, position, len) {
    let value = '';
    for (let ii = 0; ii < len; ii++) {
        value += String.fromCharCode(arr[ii + position]);
    }// for

    return value;
};// function

/**
 * read sensor value
 * @param data
 * @returns {number}
 */
// const getSensorValue = function (data) {
const getSensorValue = data => {
    let position = 2;
    const extId = data[position];
    position++;
    const type = data[position];
    position++;

    // data type check
    let value;
    switch (type) {
    case 1:
        value = data[position];
        position++;
        break;
    case 2:
        value = readFloat(data, position);
        position += 4;
        if ((value < -255) || (value > 1023)) value = 0;
        break;
    case 3:
        value = readShort(data, position);
        position += 2;
        break;
    case 4:
        const lv = data[position];
        position++;
        value = readString(data, position, lv);
        break;
    case 5:
        value = readDouble(data, position);
        position += 4;
        break;
    }

    console.log(`type= ${type} value=${value}`);

    return value;
};


/**
 * @class The Board object represents an arduino board.
 * @augments EventEmitter
 * @param {String} port This is the serial port the arduino is connected to.
 * @param {function} function A function to be called when the arduino is ready to communicate.
 * @property MODES All the modes available for pins on this arduino board.
 * @property I2C_MODES All the I2C modes available.
 * @property SERIAL_MODES All the Serial modes available.
 * @property SERIAL_PORT_ID ID values to pass as the portId parameter when calling serialConfig.
 * @property HIGH A constant to set a pins value to HIGH when the pin is set to an output.
 * @property LOW A constant to set a pins value to LOW when the pin is set to an output.
 * @property pins An array of pin object literals.
 * @property analogPins An array of analog pins and their corresponding indexes in the pins array.
 * @property version An object indicating the major and minor version of the firmware currently running.
 * @property firmware An object indicating the name, major and minor version of the firmware currently running.
 * @property buffer An array holding the current bytes received from the arduino.
 * @property {SerialPort} sp The serial port object used to communicate with the arduino.
 */

/**
 *
 */
class Firmata extends Emitter {
    constructor (transportWrite, options) {
        super();

        if (typeof options === 'function' || typeof options === 'undefined') {
            options = {};
        }

        this.transportWrite = transportWrite;

        const board = this;
        const defaults = {
            reportVersionTimeout: 5000,
            samplingInterval: 19
        };

        const settings = Object.assign({}, defaults, options);

        this.isReady = false;

        this.MODES = {
            INPUT: 0x00,
            OUTPUT: 0x01,
            ANALOG: 0x02,
            PWM: 0x03,
            SERVO: 0x04,
            SHIFT: 0x05,
            I2C: 0x06,
            ONEWIRE: 0x07,
            STEPPER: 0x08,
            SERIAL: 0x0A,
            PULLUP: 0x0B,
            IGNORE: 0x7F,
            PING_READ: 0x75,
            UNKOWN: 0x10
        };

        this.I2C_MODES = {
            WRITE: 0,
            READ: 1,
            CONTINUOUS_READ: 2,
            STOP_READING: 3
        };

        this.STEPPER = {
            TYPE: {
                DRIVER: 1,
                TWO_WIRE: 2,
                THREE_WIRE: 3,
                FOUR_WIRE: 4
            },
            STEP_SIZE: {
                WHOLE: 0,
                HALF: 1
            },
            RUN_STATE: {
                STOP: 0,
                ACCEL: 1,
                DECEL: 2,
                RUN: 3
            },
            DIRECTION: {
                CCW: 0,
                CW: 1
            }
        };

        this.SERIAL_MODES = {
            CONTINUOUS_READ: 0x00,
            STOP_READING: 0x01
        };

        // ids for hardware and software serial ports on the board
        this.SERIAL_PORT_IDs = {
            HW_SERIAL0: 0x00,
            HW_SERIAL1: 0x01,
            HW_SERIAL2: 0x02,
            HW_SERIAL3: 0x03,
            SW_SERIAL0: 0x08,
            SW_SERIAL1: 0x09,
            SW_SERIAL2: 0x10,
            SW_SERIAL3: 0x11,

            // Default can be used by dependant libraries to key on a
            // single property name when negotiating ports.
            //
            // Firmata elects SW_SERIAL0: 0x08 as its DEFAULT
            DEFAULT: 0x08
        };

        // map to the pin resolution value in the capability query response
        this.SERIAL_PIN_TYPES = {
            RES_RX0: 0x00,
            RES_TX0: 0x01,
            RES_RX1: 0x02,
            RES_TX1: 0x03,
            RES_RX2: 0x04,
            RES_TX2: 0x05,
            RES_RX3: 0x06,
            RES_TX3: 0x07
        };

        this.RESOLUTION = {
            ADC: null,
            DAC: null,
            PWM: null
        };

        this.HIGH = 1;
        this.LOW = 0;
        this.pins = [];
        this.ports = Array(16).fill(0);
        this.analogPins = [];
        this.version = {};
        this.firmware = {};
        this.buffer = [];
        // this.versionReceived = false;
        this.versionReceived = true;
        this.name = 'Firmata';
        this.settings = settings;
        this.digitalPortQueue = 0x0000;

        // 수신 데이터 처리
        this._isParseStart = false;
        this._isParseStartIndex = 0;
        this._sendBuffer = [];

        // if we have not received the version within the allotted
        // time specified by the reportVersionTimeout (user or default),
        // then send an explicit request for it.
        this.reportVersionTimeoutId = setTimeout(() => {
            /* istanbul ignore else */
            if (this.versionReceived === false) {
                this.reportVersion(() => { });
                this.queryFirmware(() => { });
            }
        }, settings.reportVersionTimeout);

        const ready = function () {
            board.isReady = true;
            board.emit('ready');
        };

        // Await the reported version.
        this.once('reportversion', () => {
            clearTimeout(this.reportVersionTimeoutId);
            this.versionReceived = true;
            this.once('queryfirmware', () => {
                // Only preemptively set the sampling interval if `samplingInterval`
                // property was _explicitly_ set as a constructor option.
                if (typeof options.samplingInterval !== 'undefined') {
                    this.setSamplingInterval(options.samplingInterval);
                }
                if (settings.skipCapabilities) {
                    this.analogPins = settings.analogPins || this.analogPins;
                    this.pins = settings.pins || this.pins;
                    /* istanbul ignore else */
                    if (!this.pins.length) {
                        for (let i = 0; i < (settings.pinCount || MAX_PIN_COUNT); i++) {
                            const supportedModes = [];
                            let analogChannel = this.analogPins.indexOf(i);

                            if (analogChannel < 0) {
                                analogChannel = 127;
                            }
                            this.pins.push({supportedModes, analogChannel});
                        }
                    }

                    // If the capabilities query is skipped,
                    // default resolution values will be used.
                    //
                    // Based on ATmega328/P
                    //
                    this.RESOLUTION.ADC = 0x3FF;
                    this.RESOLUTION.PWM = 0x0FF;

                    ready();
                } else {
                    this.queryCapabilities(() => {
                        this.queryAnalogMapping(ready);
                    });
                }
            });
        });
    }

    /**
     * receive data event handler
     * @param data
     */
    onReciveData (data) {
        // eslint-disable-next-line no-console
        console.log(`onreciveData data= ${data} len= ${data.length}`);
        // console.log(`typeof data ${typeof data}`);
        // console.log(`${[...data]}`);
        // console.log(`buffer len= ${this.buffer.length}`);

        if (this.buffer.length > 30) this.buffer.length = 0;

        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            this.buffer.push(byte);

            if (this.buffer.length >= 2) {
                const start1 = this.buffer[this.buffer.length - 2];
                const start2 = this.buffer[this.buffer.length - 1];

                // start bit is 0xff55
                if (!this._isParseStart) {
                    if ((start1 === 0xff) && (start2 === 0x55)) {
                        this._isParseStart = true;
                        this._isParseStartIndex = this.buffer.length - 2;
                        this.buffer.length = 0;
                        this.buffer[0] = start1;
                        this.buffer[1] = start2;
                    }
                    // else {
                    //     this.buffer.length = 0;
                    // }
                }

                // console.log(`this.buffer= ${this.buffer}`);

                // end bit is 0x0d0a
                if (this._isParseStart && (start1 === 0xd) && (start2 === 0xa)) {
                    this._isParseStart = false;

                    // console.log(`len= ${this.buffer.length} this.buffer= ${this.buffer}`);

                    // run type response [ff, 55, 0d, 0a]
                    if ((this.buffer.length === 4) && (this.buffer[0] === 0xff && this.buffer[1] === 0x55)) {
                        // console.log(`RUN type..`);
                        console.log(`send buffer= ${this._sendBuffer}`);

                        // const handler = SYSEX_RESPONSE[this._sendBuffer[5]];
                        // if (handler) handler(this);
                        // console.log(`handler = ${handler}`);

                        // this.buffer.length = 0;
                    }
                    // get type response
                    else {
                        // console.log(`GET type...`);

                        // let position = this._isParseStartIndex + 2;
                        // const extId = this.buffer[position];
                        // position++;
                        // const type = this.buffer[position];
                        // position++;

                        // data type check
                        // let value;
                        // switch (type) {
                        // case 1:
                        //     value = this.buffer[position];
                        //     position++;
                        //     break;
                        // case 2:
                        //     value = this._readFloat(this.buffer, position);
                        //     position += 4;
                        //     if ((value < -255) || (value > 1023)) value = 0;
                        //     break;
                        // case 3:
                        //     value = this._readShort(this.buffer, position);
                        //     position += 2;
                        //     break;
                        // case 4:
                        //     const lv = this.buffer[position];
                        //     position++;
                        //     value = this._readString(this.buffer, position, lv);
                        //     break;
                        // case 5:
                        //     value = this._readDouble(this.buffer, position);
                        //     position += 4;
                        //     break;
                        // }
                        //
                        // console.log(`type= ${type} value=${value}`);

                        // const handler = SYSEX_RESPONSE[this._sendBuffer[5]];
                        // if (handler) handler(this);
                    }

                    let handler;
                    // stop all
                    if (this._sendBuffer[4] === 0x04) {
                        handler = SYSEX_RESPONSE[this._sendBuffer[4]];
                    } else {
                        handler = SYSEX_RESPONSE[this._sendBuffer[5]];
                    }

                    if (handler) handler(this);

                    console.log(`this.buffer= ${this.buffer}`);

                    // if (type <= 5) {
                    //     if (values[extId] != undefined) {
                    //
                    //     }
                    // }

                    // 보드에 다음 중 하나가 활성화된 이전 실행의 기존 활동이 있을 수 있습니다.
                    //
                    //    - ANALOG_MESSAGE
                    //    - SERIAL_READ
                    //    - I2C_REQUEST, CONTINUOUS_READ
                    //
                    // 이는 핸드셰이크가 발생하기 전에 전송 "open"에서 이러한 메시지를 수신한다는 의미입니다.
                    // REPORT_VERSION 메시지가 수신된 후에만 이 버퍼를 처리할 것이라고 주장해야 합니다.
                    // 그렇지 않으면 프로그램이 "hanging 멈추는" 모습을 보일 것입니다.
                    //
                    // _after_REPORT_VERSION까지 이 데이터로 아무 것도 할 수 없으므로 삭제합니다.
                    this.buffer.length = 0;
                }


            }

            // const first = this.buffer[0];
            // const last = this.buffer[this.buffer.length - 1];
            //
            // // [START_SYSEX, ... END_SYSEX]
            // if (first === START_SYSEX && last === END_SYSEX) {
            //
            //     const handler = SYSEX_RESPONSE[this.buffer[1]];
            //     console.log(`handler = ${handler}`);
            //
            //     // Ensure a valid SYSEX_RESPONSE handler exists
            //     // Only process these AFTER the REPORT_VERSION
            //     // message has been received and processed.
            //     if (handler && this.versionReceived) {
            //         handler(this);
            //     }
            //
            //     // 보드에 다음 중 하나가 활성화된 이전 실행의 기존 활동이 있을 수 있습니다.
            //     //
            //     //    - ANALOG_MESSAGE
            //     //    - SERIAL_READ
            //     //    - I2C_REQUEST, CONTINUOUS_READ
            //     //
            //     // 이는 핸드셰이크가 발생하기 전에 전송 "open"에서 이러한 메시지를 수신한다는 의미입니다.
            //     // REPORT_VERSION 메시지가 수신된 후에만 이 버퍼를 처리할 것이라고 주장해야 합니다.
            //     // 그렇지 않으면 프로그램이 "hanging 멈추는" 모습을 보일 것입니다.
            //     //
            //     // _after_REPORT_VERSION까지 이 데이터로 아무 것도 할 수 없으므로 삭제합니다.
            //     this.buffer.length = 0;
            //
            // } else if (first === START_SYSEX && (this.buffer.length > 0)) {
            //     // we have a new command after an incomplete sysex command
            //     const currByte = data[i];
            //     if (currByte > 0x7F) {
            //         this.buffer.length = 0;
            //         this.buffer.push(currByte);
            //     }
            // } else {
            //     // eslint-disable-next-line no-lonely-if
            //     if (first !== START_SYSEX) {
            //         // Check if data gets out of sync: first byte in buffer
            //         // must be a valid response if not START_SYSEX
            //         // Identify response on first byte
            //         const response = first < START_SYSEX ? (first & START_SYSEX) : first;
            //
            //         // Check if the first byte is possibly
            //         // a valid MIDI_RESPONSE (handler)
            //         /* istanbul ignore else */
            //         if (response !== REPORT_VERSION &&
            //             response !== ANALOG_MESSAGE &&
            //             response !== DIGITAL_MESSAGE) {
            //             // If not valid, then we received garbage and can discard
            //             // whatever bytes have been been queued.
            //             this.buffer.length = 0;
            //         }
            //     }
            // }
            //
            // // There are 3 bytes in the buffer and the first is not START_SYSEX:
            // // Might have a MIDI Command
            // if (this.buffer.length === 3 && first !== START_SYSEX) {
            //     // response bytes under 0xF0 we have a multi byte operation
            //     const response = first < START_SYSEX ? (first & START_SYSEX) : first;
            //
            //     /* istanbul ignore else */
            //     if (MIDI_RESPONSE[response]) {
            //         // It's ok that this.versionReceived will be set to
            //         // true every time a valid MIDI_RESPONSE is received.
            //         // This condition is necessary to ensure that REPORT_VERSION
            //         // is called first.
            //         if (this.versionReceived || first === REPORT_VERSION) {
            //             this.versionReceived = true;
            //             MIDI_RESPONSE[response](this);
            //         }
            //         this.buffer.length = 0;
            //     } else {
            //         // A bad serial read must have happened.
            //         // Reseting the buffer will allow recovery.
            //         this.buffer.length = 0;
            //     }
            // }
        }
        // }

    }

    /**
     * receive data handler backup
     * @param data
     */
    onReciveDataBak (data) {
        console.log(`recv : ${data}`);
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            // we dont want to push 0 as the first byte on our buffer
            if (this.buffer.length === 0 && byte === 0) {
                continue;
            } else {
                this.buffer.push(byte);

                const first = this.buffer[0];
                const last = this.buffer[this.buffer.length - 1];

                // [START_SYSEX, ... END_SYSEX]
                if (first === 0xff && last === 0x0a) {
                    // if (first === START_SYSEX && last === END_SYSEX) {

                    const handler = SYSEX_RESPONSE[this.buffer[1]];
                    console.log(`handler = ${handler}`);

                    // Ensure a valid SYSEX_RESPONSE handler exists
                    // Only process these AFTER the REPORT_VERSION
                    // message has been received and processed.
                    if (handler && this.versionReceived) {
                        handler(this);
                    }

                    // It is possible for the board to have
                    // existing activity from a previous run
                    // that will leave any of the following
                    // active:
                    //
                    //    - ANALOG_MESSAGE
                    //    - SERIAL_READ
                    //    - I2C_REQUEST, CONTINUOUS_READ
                    //
                    // This means that we will receive these
                    // messages on transport "open", before any
                    // handshake can occur. We MUST assert
                    // that we will only process this buffer
                    // AFTER the REPORT_VERSION message has
                    // been received. Not doing so will result
                    // in the appearance of the program "hanging".
                    //
                    // Since we cannot do anything with this data
                    // until _after_ REPORT_VERSION, discard it.
                    //
                    this.buffer.length = 0;

                } else if (first === START_SYSEX && (this.buffer.length > 0)) {
                    // we have a new command after an incomplete sysex command
                    const currByte = data[i];
                    if (currByte > 0x7F) {
                        this.buffer.length = 0;
                        this.buffer.push(currByte);
                    }
                } else {
                    // eslint-disable-next-line no-lonely-if
                    if (first !== START_SYSEX) {
                        // Check if data gets out of sync: first byte in buffer
                        // must be a valid response if not START_SYSEX
                        // Identify response on first byte
                        const response = first < START_SYSEX ? (first & START_SYSEX) : first;

                        // Check if the first byte is possibly
                        // a valid MIDI_RESPONSE (handler)
                        /* istanbul ignore else */
                        if (response !== REPORT_VERSION &&
                            response !== ANALOG_MESSAGE &&
                            response !== DIGITAL_MESSAGE) {
                            // If not valid, then we received garbage and can discard
                            // whatever bytes have been been queued.
                            this.buffer.length = 0;
                        }
                    }
                }

                // There are 3 bytes in the buffer and the first is not START_SYSEX:
                // Might have a MIDI Command
                if (this.buffer.length === 3 && first !== START_SYSEX) {
                    // response bytes under 0xF0 we have a multi byte operation
                    const response = first < START_SYSEX ? (first & START_SYSEX) : first;

                    /* istanbul ignore else */
                    if (MIDI_RESPONSE[response]) {
                        // It's ok that this.versionReceived will be set to
                        // true every time a valid MIDI_RESPONSE is received.
                        // This condition is necessary to ensure that REPORT_VERSION
                        // is called first.
                        if (this.versionReceived || first === REPORT_VERSION) {
                            this.versionReceived = true;
                            MIDI_RESPONSE[response](this);
                        }
                        this.buffer.length = 0;
                    } else {
                        // A bad serial read must have happened.
                        // Reseting the buffer will allow recovery.
                        this.buffer.length = 0;
                    }
                }
            }
        }
    }

    /**
     * Asks the arduino to tell us its version.
     * @param {function} callback A function to be called when the arduino has reported its version.
     */
    reportVersion (callback) {
        this.once('reportversion', callback);
        writeToTransport(this, [REPORT_VERSION]);
    }

    /**
     * Asks the arduino to tell us its firmware version.
     * @param {function} callback A function to be called when the arduino has reported its firmware version.
     */
    queryFirmware (callback) {
        this.once('queryfirmware', callback);
        writeToTransport(this, [
            START_SYSEX,
            QUERY_FIRMWARE,
            END_SYSEX
        ]);
    }


    /**
     * Asks the arduino to read analog data. Turn on reporting for this pin.
     * @param {number} pin The pin to read analog data
     * @param {function} callback A function to call when we have the analag data.
     */

    analogRead (pin, callback) {
        this.reportAnalogPin(pin, 1);
        this.removeAllListeners(`analog-read-${pin}`);
        this.once(`analog-read-${pin}`, callback);
    }

    /**
     * Write a PWM value Asks the arduino to write an analog message.
     * @param {number} pin The pin to write analog data to.
     * @param {number} value The data to write to the pin between 0 and this.RESOLUTION.PWM.
     */

    pwmWrite (pin, value) {
        let data;

        this.pins[pin].value = value;

        if (pin > 15) {
            data = [
                START_SYSEX,
                EXTENDED_ANALOG,
                pin,
                value & 0x7F,
                (value >> 7) & 0x7F
            ];

            if (value > 0x00004000) {
                data[data.length] = (value >> 14) & 0x7F;
            }

            if (value > 0x00200000) {
                data[data.length] = (value >> 21) & 0x7F;
            }

            if (value > 0x10000000) {
                data[data.length] = (value >> 28) & 0x7F;
            }

            data[data.length] = END_SYSEX;
        } else {
            data = [
                ANALOG_MESSAGE | pin,
                value & 0x7F,
                (value >> 7) & 0x7F
            ];
        }

        writeToTransport(this, data);
    }

    /**
     * Set a pin to SERVO mode with an explicit PWM range.
     *
     * @param {number} pin The pin the servo is connected to
     * @param {number} min A 14-bit signed int.
     * @param {number} max A 14-bit signed int.
     */

    servoConfig (pin, min, max) {
        if (typeof pin === 'object' && pin !== null) {
            const temp = pin;
            pin = temp.pin;
            min = temp.min;
            max = temp.max;
        }

        if (typeof pin === 'undefined') {
            throw new Error('servoConfig: pin must be specified');
        }

        if (typeof min === 'undefined') {
            throw new Error('servoConfig: min must be specified');
        }

        if (typeof max === 'undefined') {
            throw new Error('servoConfig: max must be specified');
        }

        // [0]  START_SYSEX  (0xF0)
        // [1]  SERVO_CONFIG (0x70)
        // [2]  pin number   (0-127)
        // [3]  minPulse LSB (0-6)
        // [4]  minPulse MSB (7-13)
        // [5]  maxPulse LSB (0-6)
        // [6]  maxPulse MSB (7-13)
        // [7]  END_SYSEX    (0xF7)

        this.pins[pin].mode = this.MODES.SERVO;

        writeToTransport(this, [
            START_SYSEX,
            SERVO_CONFIG,
            pin,
            min & 0x7F,
            (min >> 7) & 0x7F,
            max & 0x7F,
            (max >> 7) & 0x7F,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to move a servo
     * @param {number} pin The pin the servo is connected to
     * @param {number} value The degrees to move the servo to.
     */

    servoWrite (...args) {
        // Values less than 544 will be treated as angles in degrees
        // (valid values in microseconds are handled as microseconds)
        this.analogWrite(...args);
    }

    /**
     * Asks the arduino to set the pin to a certain mode.
     * @param {number} pin The pin you want to change the mode of.
     * @param {number} mode The mode you want to set. Must be one of board.MODES
     */

    pinMode (pin, mode) {
        if (mode === this.MODES.ANALOG) {
            // Because pinMode may be called before analogRead(pin, () => {}), but isn't
            // necessary to initiate an analog read on an analog pin, we'll assign the
            // mode here, but do nothing further. In analogRead(), the call to
            // reportAnalogPin(pin, 1) is all that's needed to turn on analog input
            // reading.
            //
            // reportAnalogPin(...) will reconcile the pin number as well, the
            // same operation we use here to assign a "mode":
            this.pins[this.analogPins[pin]].mode = mode;
        } else {
            this.pins[pin].mode = mode;
            writeToTransport(this, [
                PIN_MODE,
                pin,
                mode
            ]);
        }
    }

    /**
     * Asks the arduino to write a value to a digital pin
     * @param {number} pin The pin you want to write a value to.
     * @param {number} value The value you want to write. Must be board.HIGH or board.LOW
     * @param {boolean} enqueue When true, the local state is updated but the command is not sent to the Arduino
     */

    digitalWrite (pin, value, enqueue) {
        const port = this.updateDigitalPort(pin, value);

        if (enqueue) {
            this.digitalPortQueue |= 1 << port;
        } else {
            this.writeDigitalPort(port);
        }
    }

    /**
     * Update local store of digital port state
     * @param {number} pin The pin you want to write a value to.
     * @param {number} value The value you want to write. Must be board.HIGH or board.LOW
     */

    updateDigitalPort (pin, value) {
        const port = pin >> 3;
        const bit = 1 << (pin & 0x07);

        this.pins[pin].value = value;

        if (value) {
            this.ports[port] |= bit;
        } else {
            this.ports[port] &= ~bit;
        }

        return port;
    }

    /**
     * Write queued digital ports
     */

    flushDigitalPorts () {
        for (let i = 0; i < this.ports.length; i++) {
            if (this.digitalPortQueue >> i) {
                this.writeDigitalPort(i);
            }
        }
        this.digitalPortQueue = 0x0000;
    }

    /**
     * Update a digital port (group of 8 digital pins) on the Arduino
     * @param {number} port The port you want to update.
     */

    writeDigitalPort (port) {
        writeToTransport(this, [
            DIGITAL_MESSAGE | port,
            this.ports[port] & 0x7F,
            (this.ports[port] >> 7) & 0x7F
        ]);
    }

    /**
     * Asks the arduino to read digital data. Turn on reporting for this pin's port.
     *
     * @param {number} pin The pin to read data from
     * @param {function} callback The function to call when data has been received
     */

    digitalRead (pin, callback) {
        this.reportDigitalPin(pin, 1);
        this.removeAllListeners(`digital-read-${pin}`);
        this.once(`digital-read-${pin}`, callback);
    }

    /**
     * Asks the arduino to tell us its capabilities
     * @param {function} callback A function to call when we receive the capabilities
     */

    queryCapabilities (callback) {
        this.once('capability-query', callback);
        writeToTransport(this, [
            START_SYSEX,
            CAPABILITY_QUERY,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to tell us its analog pin mapping
     * @param {function} callback A function to call when we receive the pin mappings.
     */

    queryAnalogMapping (callback) {
        this.once('analog-mapping-query', callback);
        writeToTransport(this, [
            START_SYSEX,
            ANALOG_MAPPING_QUERY,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to tell us the current state of a pin
     * @param {number} pin The pin we want to the know the state of
     * @param {function} callback A function to call when we receive the pin state.
     */

    queryPinState (pin, callback) {
        this.once(`pin-state-${pin}`, callback);
        writeToTransport(this, [
            START_SYSEX,
            PIN_STATE_QUERY,
            pin,
            END_SYSEX
        ]);
    }

    /**
     * Sends a string to the arduino
     * @param {String} string to send to the device
     */

    sendString (string) {
        const bytes = Buffer.from(`${string}\0`, 'utf8');
        const data = [];

        data.push(START_SYSEX, STRING_DATA);
        for (let i = 0, length = bytes.length; i < length; i++) {
            data.push(
                bytes[i] & 0x7F,
                (bytes[i] >> 7) & 0x7F
            );
        }
        data.push(END_SYSEX);

        writeToTransport(this, data);
    }

    /**
     * Sends a I2C config request to the arduino board with an optional
     * value in microseconds to delay an I2C Read.  Must be called before
     * an I2C Read or Write
     * @param {number} delay in microseconds to set for I2C Read
     */

    sendI2CConfig (delay) {
        return this.i2cConfig(delay);
    }

    /**
     * Enable I2C with an optional read delay. Must be called before
     * an I2C Read or Write
     *
     * Supersedes sendI2CConfig
     *
     * @param {number} delay in microseconds to set for I2C Read
     *
     * or
     *
     * @param {object} with a single property `delay`
     */

    i2cConfig (options) {
        let settings = i2cActive.get(this);
        let delay;

        if (!settings) {
            settings = {
                /*
                  Keys will be I2C peripheral addresses
                 */
            };
            i2cActive.set(this, settings);
        }

        if (typeof options === 'number') {
            delay = options;
        } else if (typeof options === 'object' && options !== null) {
            delay = Number(options.delay);

            // When an address was explicitly specified, there may also be
            // peripheral specific instructions in the config.
            if (typeof options.address !== 'undefined') {
                if (!settings[options.address]) {
                    settings[options.address] = {
                        stopTX: true
                    };
                }
            }

            // When settings have been explicitly provided, just bulk assign
            // them to the existing settings, even if that's empty. This
            // allows for reconfiguration as needed.
            if (typeof options.settings !== 'undefined') {
                Object.assign(settings[options.address], options.settings);
                /*
                      - stopTX: true | false
                          Set `stopTX` to `false` if this peripheral
                          expects Wire to keep the transmission connection alive between
                          setting a register and requesting bytes.

                          Defaults to `true`.
                     */
            }
        }

        settings.delay = delay = delay || 0;

        i2cRequest(this, [
            START_SYSEX,
            I2C_CONFIG,
            delay & 0xFF,
            (delay >> 8) & 0xFF,
            END_SYSEX
        ]);

        return this;
    }

    /**
     * Asks the arduino to send an I2C request to a device
     * @param {number} slaveAddress The address of the I2C device
     * @param {Array} bytes The bytes to send to the device
     */

    sendI2CWriteRequest (slaveAddress, bytes) {
        const data = [];
        /* istanbul ignore next */
        bytes = bytes || [];

        data.push(
            START_SYSEX,
            I2C_REQUEST,
            slaveAddress,
            this.I2C_MODES.WRITE << 3
        );

        for (let i = 0, length = bytes.length; i < length; i++) {
            data.push(
                bytes[i] & 0x7F,
                (bytes[i] >> 7) & 0x7F
            );
        }

        data.push(END_SYSEX);

        i2cRequest(this, data);
    }

    /**
     * Write data to a register
     *
     * @param {number} address      The address of the I2C device.
     * @param {Array} cmdRegOrData  An array of bytes
     *
     * Write a command to a register
     *
     * @param {number} address      The address of the I2C device.
     * @param {number} cmdRegOrData The register
     * @param {Array} inBytes       An array of bytes
     *
     */

    i2cWrite (address, registerOrData, inBytes) {
        /**
         * registerOrData:
         * [... arbitrary bytes]
         *
         * or
         *
         * registerOrData, inBytes:
         * command [, ...]
         *
         */
        const data = [
            START_SYSEX,
            I2C_REQUEST,
            address,
            this.I2C_MODES.WRITE << 3
        ];

        // If i2cWrite was used for an i2cWriteReg call...
        if (arguments.length === 3 &&
            !Array.isArray(registerOrData) &&
            !Array.isArray(inBytes)) {

            return this.i2cWriteReg(address, registerOrData, inBytes);
        }

        // Fix arguments if called with Firmata.js API
        if (arguments.length === 2) {
            if (Array.isArray(registerOrData)) {
                inBytes = registerOrData.slice();
                registerOrData = inBytes.shift();
            } else {
                inBytes = [];
            }
        }

        const bytes = Buffer.from([registerOrData].concat(inBytes));

        for (let i = 0, length = bytes.length; i < length; i++) {
            data.push(
                bytes[i] & 0x7F,
                (bytes[i] >> 7) & 0x7F
            );
        }

        data.push(END_SYSEX);

        i2cRequest(this, data);

        return this;
    }

    /**
     * Write data to a register
     *
     * @param {number} address    The address of the I2C device.
     * @param {number} register   The register.
     * @param {number} byte       The byte value to write.
     *
     */

    i2cWriteReg (address, register, byte) {
        i2cRequest(this, [
            START_SYSEX,
            I2C_REQUEST,
            address,
            this.I2C_MODES.WRITE << 3,
            // register
            register & 0x7F,
            (register >> 7) & 0x7F,
            // byte
            byte & 0x7F,
            (byte >> 7) & 0x7F,
            END_SYSEX
        ]);

        return this;
    }

    /**
     * Asks the arduino to request bytes from an I2C device
     * @param {number} slaveAddress The address of the I2C device
     * @param {number} numBytes The number of bytes to receive.
     * @param {function} callback A function to call when we have received the bytes.
     */

    sendI2CReadRequest (address, numBytes, callback) {
        i2cRequest(this, [
            START_SYSEX,
            I2C_REQUEST,
            address,
            this.I2C_MODES.READ << 3,
            numBytes & 0x7F,
            (numBytes >> 7) & 0x7F,
            END_SYSEX
        ]);
        this.once(`I2C-reply-${address}-0`, callback);
    }

    // TODO: Refactor i2cRead and i2cReadOnce
    //      to share most operations.

    /**
     * Initialize a continuous I2C read.
     *
     * @param {number} address    The address of the I2C device
     * @param {number} register   Optionally set the register to read from.
     * @param {number} numBytes   The number of bytes to receive.
     * @param {function} callback A function to call when we have received the bytes.
     */

    i2cRead (address, register, bytesToRead, callback) {

        if (arguments.length === 3 &&
            typeof register === 'number' &&
            typeof bytesToRead === 'function') {
            callback = bytesToRead;
            bytesToRead = register;
            register = null;
        }

        const data = [
            START_SYSEX,
            I2C_REQUEST,
            address,
            this.I2C_MODES.CONTINUOUS_READ << 3
        ];
        let event = `I2C-reply-${address}-`;

        // eslint-disable-next-line no-negated-condition
        if (register !== null) {
            data.push(
                register & 0x7F,
                (register >> 7) & 0x7F
            );
        } else {
            register = 0;
        }

        event += register;

        data.push(
            bytesToRead & 0x7F,
            (bytesToRead >> 7) & 0x7F,
            END_SYSEX
        );

        this.on(event, callback);

        i2cRequest(this, data);

        return this;
    }

    /**
     * Stop continuous reading of the specified I2C address or register.
     *
     * @param {object} options Options:
     *   bus {number} The I2C bus (on supported platforms)
     *   address {number} The I2C peripheral address to stop reading.
     *
     * @param {number} address The I2C peripheral address to stop reading.
     */

    i2cStop (options) {
        // There may be more values in the future
        // var options = {};

        // null or undefined? Do nothing.
        if (options === null) {
            return;
        }

        if (typeof options === 'number') {
            options = {
                address: options
            };
        }

        writeToTransport(this, [
            START_SYSEX,
            I2C_REQUEST,
            options.address,
            this.I2C_MODES.STOP_READING << 3,
            END_SYSEX
        ]);

        Object.keys(this._events).forEach(event => {
            if (event.startsWith(`I2C-reply-${options.address}`)) {
                this.removeAllListeners(event);
            }
        });
    }

    /**
     * Perform a single I2C read
     *
     * Supersedes sendI2CReadRequest
     *
     * Read bytes from address
     *
     * @param {number} address    The address of the I2C device
     * @param {number} register   Optionally set the register to read from.
     * @param {number} numBytes   The number of bytes to receive.
     * @param {function} callback A function to call when we have received the bytes.
     *
     */


    i2cReadOnce (address, register, bytesToRead, callback) {

        if (arguments.length === 3 &&
            typeof register === 'number' &&
            typeof bytesToRead === 'function') {
            callback = bytesToRead;
            bytesToRead = register;
            register = null;
        }

        const data = [
            START_SYSEX,
            I2C_REQUEST,
            address,
            this.I2C_MODES.READ << 3
        ];
        let event = `I2C-reply-${address}-`;

        // eslint-disable-next-line no-negated-condition
        if (register !== null) {
            data.push(
                register & 0x7F,
                (register >> 7) & 0x7F
            );
        } else {
            register = 0;
        }

        event += register;

        data.push(
            bytesToRead & 0x7F,
            (bytesToRead >> 7) & 0x7F,
            END_SYSEX
        );

        this.once(event, callback);

        i2cRequest(this, data);

        return this;
    }

    /**
     * Configure the passed pin as the controller in a 1-wire bus.
     * Pass as enableParasiticPower true if you want the data pin to power the bus.
     * @param pin
     * @param enableParasiticPower
     */

    sendOneWireConfig (pin, enableParasiticPower) {
        writeToTransport(this, [
            START_SYSEX,
            ONEWIRE_DATA,
            ONEWIRE_CONFIG_REQUEST,
            pin,
            enableParasiticPower ? 0x01 : 0x00,
            END_SYSEX
        ]);
    }

    /**
     * Searches for 1-wire devices on the bus.  The passed callback should accept
     * and error argument and an array of device identifiers.
     * @param pin
     * @param callback
     */

    sendOneWireSearch (pin, callback) {
        this[symbolSendOneWireSearch](
            ONEWIRE_SEARCH_REQUEST,
            `1-wire-search-reply-${pin}`,
            pin,
            callback
        );
    }

    /**
     * Searches for 1-wire devices on the bus in an alarmed state.  The passed callback
     * should accept and error argument and an array of device identifiers.
     * @param pin
     * @param callback
     */

    sendOneWireAlarmsSearch (pin, callback) {
        this[symbolSendOneWireSearch](
            ONEWIRE_SEARCH_ALARMS_REQUEST,
            `1-wire-search-alarms-reply-${pin}`,
            pin,
            callback
        );
    }

    [symbolSendOneWireSearch] (type, event, pin, callback) {
        writeToTransport(this, [
            START_SYSEX,
            ONEWIRE_DATA,
            type,
            pin,
            END_SYSEX
        ]);

        const timeout = setTimeout(() => {
            /* istanbul ignore next */
            callback(new Error('1-Wire device search timeout - are you running ConfigurableFirmata?'));
        }, 5000);
        this.once(event, devices => {
            clearTimeout(timeout);
            callback(null, devices);
        });
    }

    /**
     * Reads data from a device on the bus and invokes the passed callback.
     *
     * N.b. ConfigurableFirmata will issue the 1-wire select command internally.
     * @param pin
     * @param device
     * @param numBytesToRead
     * @param callback
     */

    sendOneWireRead (pin, device, numBytesToRead, callback) {
        const correlationId = Math.floor(Math.random() * 255);
        /* istanbul ignore next */
        const timeout = setTimeout(() => {
            /* istanbul ignore next */
            callback(new Error('1-Wire device read timeout - are you running ConfigurableFirmata?'));
        }, 5000);
        this[symbolSendOneWireRequest](
            pin,
            ONEWIRE_READ_REQUEST_BIT,
            device,
            numBytesToRead,
            correlationId,
            null,
            null,
            `1-wire-read-reply-${correlationId}`,
            data => {
                clearTimeout(timeout);
                callback(null, data);
            }
        );
    }

    /**
     * Resets all devices on the bus.
     * @param pin
     */

    sendOneWireReset (pin) {
        this[symbolSendOneWireRequest](
            pin,
            ONEWIRE_RESET_REQUEST_BIT
        );
    }

    /**
     * Writes data to the bus to be received by the passed device.  The device
     * should be obtained from a previous call to sendOneWireSearch.
     *
     * N.b. ConfigurableFirmata will issue the 1-wire select command internally.
     * @param pin
     * @param device
     * @param data
     */

    sendOneWireWrite (pin, device, data) {
        this[symbolSendOneWireRequest](
            pin,
            ONEWIRE_WRITE_REQUEST_BIT,
            device,
            null,
            null,
            null,
            Array.isArray(data) ? data : [data]
        );
    }

    /**
     * Tells firmata to not do anything for the passed amount of ms.  For when you
     * need to give a device attached to the bus time to do a calculation.
     * @param pin
     */

    sendOneWireDelay (pin, delay) {
        this[symbolSendOneWireRequest](
            pin,
            ONEWIRE_DELAY_REQUEST_BIT,
            null,
            null,
            null,
            delay
        );
    }

    /**
     * Sends the passed data to the passed device on the bus, reads the specified
     * number of bytes and invokes the passed callback.
     *
     * N.b. ConfigurableFirmata will issue the 1-wire select command internally.
     * @param pin
     * @param device
     * @param data
     * @param numBytesToRead
     * @param callback
     */

    sendOneWireWriteAndRead (pin, device, data, numBytesToRead, callback) {
        const correlationId = Math.floor(Math.random() * 255);
        /* istanbul ignore next */
        const timeout = setTimeout(() => {
            /* istanbul ignore next */
            callback(new Error('1-Wire device read timeout - are you running ConfigurableFirmata?'));
        }, 5000);
        this[symbolSendOneWireRequest](
            pin,
            ONEWIRE_WRITE_REQUEST_BIT | ONEWIRE_READ_REQUEST_BIT,
            device,
            numBytesToRead,
            correlationId,
            null,
            Array.isArray(data) ? data : [data],
            `1-wire-read-reply-${correlationId}`,
            _data => {
                clearTimeout(timeout);
                callback(null, _data);
            }
        );
    }

    // see http://firmata.org/wiki/Proposals#OneWire_Proposal
    [symbolSendOneWireRequest] (pin, subcommand, device, numBytesToRead, correlationId,
        delay, dataToWrite, event, callback) {
        const bytes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (device || numBytesToRead || correlationId || delay || dataToWrite) {
            subcommand = subcommand | ONEWIRE_WITHDATA_REQUEST_BITS;
        }

        if (device) {
            bytes.splice(...[0, 8].concat(device));
        }

        if (numBytesToRead) {
            bytes[8] = numBytesToRead & 0xFF;
            bytes[9] = (numBytesToRead >> 8) & 0xFF;
        }

        if (correlationId) {
            bytes[10] = correlationId & 0xFF;
            bytes[11] = (correlationId >> 8) & 0xFF;
        }

        if (delay) {
            bytes[12] = delay & 0xFF;
            bytes[13] = (delay >> 8) & 0xFF;
            bytes[14] = (delay >> 16) & 0xFF;
            bytes[15] = (delay >> 24) & 0xFF;
        }

        if (dataToWrite) {
            bytes.push(...dataToWrite);
        }

        const output = [
            START_SYSEX,
            ONEWIRE_DATA,
            subcommand,
            pin,
            ...Encoder7Bit.to7BitArray(bytes),
            END_SYSEX
        ];

        writeToTransport(this, output);

        if (event && callback) {
            this.once(event, callback);
        }
    }

    /**
     * Set sampling interval in millis. Default is 19 ms
     * @param {number} interval The sampling interval in ms > 10
     */

    setSamplingInterval (interval) {
        const safeint = interval < 10 ? 10 : (interval > 65535 ? 65535 : interval);
        this.settings.samplingInterval = safeint;
        writeToTransport(this, [
            START_SYSEX,
            SAMPLING_INTERVAL,
            (safeint & 0x7F),
            ((safeint >> 7) & 0x7F),
            END_SYSEX
        ]);
    }

    /**
     * Get sampling interval in millis. Default is 19 ms
     *
     * @return {number} samplingInterval
     */

    getSamplingInterval () {
        return this.settings.samplingInterval;
    }

    /**
     * Set reporting on pin
     * @param {number} pin The pin to turn on/off reporting
     * @param {number} value Binary value to turn reporting on/off
     */

    reportAnalogPin (pin, value) {
        /* istanbul ignore else */
        if (value === 0 || value === 1) {
            this.pins[this.analogPins[pin]].report = value;
            writeToTransport(this, [
                REPORT_ANALOG | pin,
                value
            ]);
        }
    }

    /**
     * Set reporting on pin
     * @param {number} pin The pin to turn on/off reporting
     * @param {number} value Binary value to turn reporting on/off
     */

    reportDigitalPin (pin, value) {
        const port = pin >> 3;
        /* istanbul ignore else */
        if (value === 0 || value === 1) {
            this.pins[pin].report = value;
            writeToTransport(this, [
                REPORT_DIGITAL | port,
                value
            ]);
        }
    }

    /**
     *
     *
     */

    pingRead (options, callback) {

        if (!this.pins[options.pin].supportedModes.includes(PING_READ)) {
            throw new Error('Please upload PingFirmata to the board');
        }

        const {
            pin,
            value,
            pulseOut = 0,
            timeout = 1000000
        } = options;

        writeToTransport(this, [
            START_SYSEX,
            PING_READ,
            pin,
            value,
            ...Firmata.encode([
                (pulseOut >> 24) & 0xFF,
                (pulseOut >> 16) & 0xFF,
                (pulseOut >> 8) & 0xFF,
                (pulseOut & 0xFF)
            ]),
            ...Firmata.encode([
                (timeout >> 24) & 0xFF,
                (timeout >> 16) & 0xFF,
                (timeout >> 8) & 0xFF,
                (timeout & 0xFF)
            ]),
            END_SYSEX
        ]);

        this.once(`ping-read-${pin}`, callback);
    }

    /**
     * Stepper functions to support version 2 of ConfigurableFirmata's asynchronous control of stepper motors
     * https://github.com/soundanalogous/ConfigurableFirmata
     */

    /**
     * Asks the arduino to configure a stepper motor with the given config to allow asynchronous control of the stepper
     * @param {object} opts Options:
     *    {number} deviceNum: Device number for the stepper (range 0-9)
     *    {number} type: One of this.STEPPER.TYPE.*
     *    {number} stepSize: One of this.STEPPER.STEP_SIZE.*
     *    {number} stepPin: Only used if STEPPER.TYPE.DRIVER
     *    {number} directionPin: Only used if STEPPER.TYPE.DRIVER
     *    {number} motorPin1: motor pin 1
     *    {number} motorPin2:  motor pin 2
     *    {number} [motorPin3]: Only required if type == this.STEPPER.TYPE.THREE_WIRE || this.STEPPER.TYPE.FOUR_WIRE
     *    {number} [motorPin4]: Only required if type == this.STEPPER.TYPE.FOUR_WIRE
     *    {number} [enablePin]: Enable pin
     *    {array} [invertPins]: Array of pins to invert
     */

    accelStepperConfig (options) {

        const {
            deviceNum,
            invertPins,
            motorPin1,
            motorPin2,
            motorPin3,
            motorPin4,
            enablePin,
            stepSize = this.STEPPER.STEP_SIZE.WHOLE,
            type = this.STEPPER.TYPE.FOUR_WIRE
        } = options;

        const data = [
            START_SYSEX,
            ACCELSTEPPER,
            0x00, // STEPPER_CONFIG from firmware
            deviceNum
        ];

        let iface = ((type & 0x07) << 4) | ((stepSize & 0x07) << 1);
        let pinsToInvert = 0x00;

        if (typeof enablePin !== 'undefined') {
            iface = iface | 0x01;
        }

        data.push(iface);

        [
            'stepPin',
            'motorPin1',
            'directionPin',
            'motorPin2',
            'motorPin3',
            'motorPin4',
            'enablePin'
        ].forEach(pin => {
            if (typeof options[pin] !== 'undefined') {
                data.push(options[pin]);
            }
        });

        if (Array.isArray(invertPins)) {
            if (invertPins.includes(motorPin1)) {
                pinsToInvert |= 0x01;
            }
            if (invertPins.includes(motorPin2)) {
                pinsToInvert |= 0x02;
            }
            if (invertPins.includes(motorPin3)) {
                pinsToInvert |= 0x04;
            }
            if (invertPins.includes(motorPin4)) {
                pinsToInvert |= 0x08;
            }
            if (invertPins.includes(enablePin)) {
                pinsToInvert |= 0x10;
            }
        }

        data.push(
            pinsToInvert,
            END_SYSEX
        );

        writeToTransport(this, data);
    }

    /**
     * Asks the arduino to set the stepper position to 0
     * Note: This is not a move. We are setting the current position equal to zero
     * @param {number} deviceNum Device number for the stepper (range 0-9)
     */

    accelStepperZero (deviceNum) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x01, // STEPPER_ZERO from firmware
            deviceNum,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to move a stepper a number of steps
     * (and optionally with and acceleration and deceleration)
     * speed is in units of steps/sec
     * @param {number} deviceNum Device number for the stepper (range 0-5)
     * @param {number} steps Number of steps to make
     * @param {function} callback A function to call when stepper done move.
     */
    accelStepperStep (deviceNum, steps, callback) {

        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x02, // STEPPER_STEP from firmware
            deviceNum,
            ...encode32BitSignedInteger(steps),
            END_SYSEX
        ]);

        if (callback) {
            this.once(`stepper-done-${deviceNum}`, callback);
        }
    }

    /**
     * Asks the arduino to move a stepper to a specific location
     * @param {number} deviceNum Device number for the stepper (range 0-5)
     * @param {number} position Desired position
     * @param {function} callback A function to call when stepper done move.
     */
    accelStepperTo (deviceNum, position, callback) {

        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x03, // STEPPER_TO from firmware
            deviceNum,
            ...encode32BitSignedInteger(position),
            END_SYSEX
        ]);

        if (callback) {
            this.once(`stepper-done-${deviceNum}`, callback);
        }
    }

    /**
     * Asks the arduino to enable/disable a stepper
     * @param {number} deviceNum Device number for the stepper (range 0-9)
     * @param {boolean} [enabled]
     */

    accelStepperEnable (deviceNum, enabled = true) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x04, // ENABLE from firmware
            deviceNum,
            enabled & 0x01,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to stop a stepper
     * @param {number} deviceNum Device number for the stepper (range 0-9)
     */

    accelStepperStop (deviceNum) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x05, // STEPPER_STOP from firmware
            deviceNum,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to report the position of a stepper
     * @param {number} deviceNum Device number for the stepper (range 0-9)
     */

    accelStepperReportPosition (deviceNum, callback) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x06, // STEPPER_REPORT_POSITION from firmware
            deviceNum,
            END_SYSEX
        ]);

        /* istanbul ignore else */
        if (callback) {
            this.once(`stepper-position-${deviceNum}`, callback);
        }
    }

    /**
     * Asks the arduino to set the acceleration for a stepper
     * @param {number} deviceNum Device number for the stepper (range 0-9)
     * @param {number} acceleration Desired acceleration in steps per sec^2
     */

    accelStepperAcceleration (deviceNum, acceleration) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x08, // STEPPER_SET_ACCELERATION from firmware
            deviceNum,
            ...encodeCustomFloat(acceleration),
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to set the max speed for a stepper
     * @param {number} deviceNum Device number for the stepper (range 0-9)
     * @param {number} speed Desired speed or maxSpeed in steps per second
     * @param {function} [callback]
     */

    accelStepperSpeed (deviceNum, speed) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x09, // STEPPER_SET_SPEED from firmware
            deviceNum,
            ...encodeCustomFloat(speed),
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to configure a multiStepper group
     * @param {object} options Options:
     *    {number} groupNum: Group number for the multiSteppers (range 0-5)
     *    {number} devices: array of accelStepper device numbers in group
     **/

    multiStepperConfig (options) {
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x20, // MULTISTEPPER_CONFIG from firmware
            options.groupNum,
            ...options.devices,
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to move a multiStepper group
     * @param {number} groupNum Group number for the multiSteppers (range 0-5)
     * @param {number} positions array of absolute stepper positions
     **/

    multiStepperTo (groupNum, positions, callback) {
        if (groupNum < 0 || groupNum > 5) {
            throw new RangeError(`Invalid "groupNum": ${groupNum}. Expected "groupNum" between 0-5`);
        }

        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x21, // MULTISTEPPER_TO from firmware
            groupNum,
            ...positions.reduce((a, b) => a.concat(...encode32BitSignedInteger(b)), []),
            END_SYSEX
        ]);

        /* istanbul ignore else */
        if (callback) {
            this.once(`multi-stepper-done-${groupNum}`, callback);
        }
    }

    /**
     * Asks the arduino to stop a multiStepper group
     * @param {number} groupNum: Group number for the multiSteppers (range 0-5)
     **/

    multiStepperStop (groupNum) {
        /* istanbul ignore else */
        if (groupNum < 0 || groupNum > 5) {
            throw new RangeError(`Invalid "groupNum": ${groupNum}. Expected "groupNum" between 0-5`);
        }
        writeToTransport(this, [
            START_SYSEX,
            ACCELSTEPPER,
            0x23, // MULTISTEPPER_STOP from firmware
            groupNum,
            END_SYSEX
        ]);
    }

    /**
     * Stepper functions to support AdvancedFirmata's asynchronous control of stepper motors
     * https://github.com/soundanalogous/AdvancedFirmata
     */

    /**
     * Asks the arduino to configure a stepper motor with the given config to allow asynchronous control
     * of the stepper
     * @param {number} deviceNum Device number for the stepper (range 0-5, expects steppers to be setup
     *                 in order from 0 to 5)
     * @param {number} type One of this.STEPPER.TYPE.*
     * @param {number} stepsPerRev Number of steps motor takes to make one revolution
     * @param {number} stepOrMotor1Pin If using EasyDriver type stepper driver, this is direction pin,
     *                 otherwise it is motor 1 pin
     * @param {number} dirOrMotor2Pin If using EasyDriver type stepper driver, this is step pin, otherwise
     *                 it is motor 2 pin
     * @param {number} [motorPin3] Only required if type == this.STEPPER.TYPE.FOUR_WIRE
     * @param {number} [motorPin4] Only required if type == this.STEPPER.TYPE.FOUR_WIRE
     */

    stepperConfig (deviceNum, type, stepsPerRev, dirOrMotor1Pin, dirOrMotor2Pin, motorPin3, motorPin4) {
        writeToTransport(this, [
            START_SYSEX,
            STEPPER,
            0x00, // STEPPER_CONFIG from firmware
            deviceNum,
            type,
            stepsPerRev & 0x7F,
            (stepsPerRev >> 7) & 0x7F,
            dirOrMotor1Pin,
            dirOrMotor2Pin,
            ...(type === this.STEPPER.TYPE.FOUR_WIRE ? [motorPin3, motorPin4] : []),
            END_SYSEX
        ]);
    }

    /**
     * Asks the arduino to move a stepper a number of steps at a specific speed
     * (and optionally with and acceleration and deceleration)
     * speed is in units of .01 rad/sec
     * accel and decel are in units of .01 rad/sec^2
     * TODO: verify the units of speed, accel, and decel
     * @param {number} deviceNum Device number for the stepper (range 0-5)
     * @param {number} direction One of this.STEPPER.DIRECTION.*
     * @param {number} steps Number of steps to make
     * @param {number} speed
     * @param {number|function} accel Acceleration or if accel and decel are not used, then it can be the callback
     * @param {number} [decel]
     * @param {function} [callback]
     */

    stepperStep (deviceNum, direction, steps, speed, accel, decel, callback) {
        if (typeof accel === 'function') {
            callback = accel;
            accel = 0;
            decel = 0;
        }

        writeToTransport(this, [
            START_SYSEX,
            STEPPER,
            0x01, // STEPPER_STEP from firmware
            deviceNum,
            direction, // one of this.STEPPER.DIRECTION.*
            steps & 0x7F, (steps >> 7) & 0x7F, (steps >> 14) & 0x7F,
            speed & 0x7F, (speed >> 7) & 0x7F,

            ...(accel > 0 || decel > 0 ?
                [accel & 0x7F, (accel >> 7) & 0x7F, decel & 0x7F, (decel >> 7) & 0x7F] : []),

            END_SYSEX
        ]);

        /* istanbul ignore else */
        if (callback) {
            this.once(`stepper-done-${deviceNum}`, callback);
        }
    }

    /**
     * Asks the Arduino to configure a hardware or serial port.
     * @param {object} options Options:
     *   portId {number} The serial port to use (HW_SERIAL1, HW_SERIAL2, HW_SERIAL3, SW_SERIAL0,
     *   SW_SERIAL1, SW_SERIAL2, SW_SERIAL3)
     *   baud {number} The baud rate of the serial port
     *   rxPin {number} [SW Serial only] The RX pin of the SoftwareSerial instance
     *   txPin {number} [SW Serial only] The TX pin of the SoftwareSerial instance
     */

    serialConfig (options) {

        let portId;
        let baud;
        let rxPin;
        let txPin;

        /* istanbul ignore else */
        if (typeof options === 'object' && options !== null) {
            portId = options.portId;
            baud = options.baud;
            rxPin = options.rxPin;
            txPin = options.txPin;
        }

        /* istanbul ignore else */
        if (typeof portId === 'undefined') {
            throw new Error('portId must be specified, see SERIAL_PORT_IDs for options.');
        }

        baud = baud || 57600;

        const data = [
            START_SYSEX,
            SERIAL_MESSAGE,
            SERIAL_CONFIG | portId,
            baud & 0x7F,
            (baud >> 7) & 0x7F,
            (baud >> 14) & 0x7F
        ];
        if (portId > 7 && typeof rxPin !== 'undefined' && typeof txPin !== 'undefined') {
            data.push(
                rxPin,
                txPin
            );
        } else if (portId > 7) {
            throw new Error('Both RX and TX pins must be defined when using Software Serial.');
        }

        data.push(END_SYSEX);
        writeToTransport(this, data);
    }

    /**
     * Allow user code to handle arbitrary sysex responses
     *
     * @param {number} commandByte The commandByte must be associated with some message
     *                             that's expected from the slave device. The handler is
     *                             called with an array of _raw_ data from the slave. Data
     *                             decoding must be done within the handler itself.
     *
     *                             Use Firmata.decode(data) to extract useful values from
     *                             the incoming response data.
     *
     *  @param {function} handler Function which handles receipt of responses matching
     *                            commandByte.
     */

    sysexResponse (commandByte, handler) {
        if (Firmata.SYSEX_RESPONSE[commandByte]) {
            throw new Error(`${commandByte} is not an available SYSEX_RESPONSE byte`);
        }

        Firmata.SYSEX_RESPONSE[commandByte] = board => handler.call(board, board.buffer.slice(2, -1));

        return this;
    }

    /*
     * Allow user to remove sysex response handlers.
     *
     * @param {number} commandByte The commandByte to disassociate with a handler
     *                             previously set via `sysexResponse( commandByte, handler)`.
     */

    clearSysexResponse (commandByte) {
        /* istanbul ignore else */
        if (Firmata.SYSEX_RESPONSE[commandByte]) {
            delete Firmata.SYSEX_RESPONSE[commandByte];
        }
    }

    /**
     * Allow user code to send arbitrary sysex messages
     *
     * @param {Array} message The message array is expected to be all necessary bytes
     *                        between START_SYSEX and END_SYSEX (non-inclusive). It will
     *                        be assumed that the data in the message array is
     *                        already encoded as 2 7-bit bytes LSB first.
     *
     *
     */

    sysexCommand (message) {

        if (!message || !message.length) {
            throw new Error('Sysex Command cannot be empty');
        }

        writeToTransport(this, [
            START_SYSEX,
            ...message.slice(),
            END_SYSEX
        ]);
        return this;
    }

    /**
     * Send SYSTEM_RESET to arduino
     */

    reset () {
        writeToTransport(this, [SYSTEM_RESET]);
    }

    /**
     * Firmata.isAcceptablePort Determines if a `port` object (from SerialPort.list())
     * is a valid Arduino (or similar) device.
     * @return {Boolean} true if port can be connected to by Firmata
     */

    static isAcceptablePort (port) {
        const rport = /usb|acm|^com/i;

        if (rport.test(port.path)) {
            return true;
        }

        return false;
    }

    // Expose encode/decode for custom sysex messages
    static encode (data) {
        const encoded = [];
        const length = data.length;

        for (let i = 0; i < length; i++) {
            encoded.push(
                data[i] & 0x7F,
                (data[i] >> 7) & 0x7F
            );
        }

        return encoded;
    }

    static decode (data) {
        const decoded = [];

        if (data.length % 2 !== 0) {
            throw new Error('Firmata.decode(data) called with odd number of data bytes');
        }

        while (data.length) {
            const lsb = data.shift();
            const msb = data.shift();
            decoded.push(lsb | (msb << 7));
        }

        return decoded;
    }

    // ------ coconutS blocks ------

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
     * move motor
     * @param motor
     * @param cmd
     * @param direction
     * @param speed
     * @param callback
     */
    moveMotor (motor, cmd, direction, speed, callback) {
        // const {
        //     motor,
        //     index,
        //     direction,
        //     speed
        // } = options;

        const datas = this._runPackage(motor, cmd, direction, speed);
        //
        // // console.log(`moveMotors : options : ${JSON.stringify(options)}`);
        // console.log(`moveMotor :  ${JSON.stringify(datas)}`);
        //
        // // writeToTransport(this, datas);
        // this._sendBuffer = datas;
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);
        // this.removeAllListeners(`analog-read-${pin}`);
        this.once(`move-motor-${direction}`, callback);
        // this.once(`coconutS-move-motors`, callback);
    }

    /**
     * stop motor
     * @param motor
     * @param index
     * @param callback
     */
    stopMotor (motor, index, callback) {
        const datas = this._runPackage(motor, index);
        //
        // // console.log(`moveMotors : options : ${JSON.stringify(options)}`);
        // console.log(`moveMotor :  ${JSON.stringify(datas)}`);
        //
        // // writeToTransport(this, datas);
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);
        // this.removeAllListeners(`analog-read-${pin}`);
        this.once(`stop-motor`, callback);
        // this.once(`coconutS-move-motors`, callback);
    }

    /**
     * turn motor
     * @param motor
     * @param cmd
     * @param direction
     * @param speed
     * @param callback
     */
    turnMotor (motor, cmd, direction, speed, callback) {
        const datas = this._runPackage(motor, cmd, direction, speed);
        //
        // // console.log(`moveMotors : options : ${JSON.stringify(options)}`);
        // console.log(`moveMotor :  ${JSON.stringify(datas)}`);
        //
        // // writeToTransport(this, datas);
        // this._sendBuffer = datas;
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);
        // this.removeAllListeners(`analog-read-${pin}`);
        this.once(`move-motor-${direction}`, callback);
    }

    /**
     * Turn on RGB LED while rotating the motor
     * @param sensor
     * @param cmd
     * @param direction
     * @param speed
     * @param color
     * @param callback
     */
    moveMotorColor (sensor, cmd, direction, speed, color, callback) {
        const datas = this._runPackage(sensor, cmd, direction, speed, color);
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);
        // this.removeAllListeners(`analog-read-${pin}`);
        this.once(`motor-rgb-${direction}-${color}`, callback);
    }


    /**
     * convert integer to 2 byte array
     // eslint-disable-next-line valid-jsdoc
     * @param short
     * @returns {number[]}
     * @private
     */
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
     * @param motor
     * @param cmd
     * @param direction
     * @param speed
     * @param sec
     * @param callback
     */
    moveGoTime (motor, cmd, direction, speed, sec, callback) {
        const datas = this._runPackage(motor, cmd, direction, speed, this._short2array(sec));

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`move-motor-time-${direction}`);
        this.once(`move-motor-time-${direction}`, callback);
    }

    /**
     * Move by the entered distance
     * @param motor
     * @param cmd
     * @param direction
     * @param cm
     * @param callback
     */
    moveGoCm (motor, cmd, direction, cm, callback) {
        const datas = this._runPackage(motor, cmd, direction, cm);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`motor-cm-${direction}`);
        this.once(`motor-cm-${direction}`, callback);
    }

    /**
     *
     * @param motor
     * @param cmd
     * @param direction
     * @param degree
     * @param callback
     */
    turnMotorDegree (motor, cmd, direction, degree, callback) {
        const datas = this._runPackage(motor, cmd, direction, this._short2array(degree));

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        // this.removeAllListeners(`motor-cm-${direction}`);
        this.once(`motor-degree-${direction}`, callback);
    }

    /**
     * turn on RGB LED
     * @param sensor
     * @param cmd
     * @param direction
     * @param color
     * @param callback
     */
    rgbOn (sensor, cmd, direction, color, callback) {
        const datas = this._runPackage(sensor, RGB_CMD.ON_COLOR, direction, color);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        // this.removeAllListeners(`motor-cm-${direction}`);
        this.once(`rgb-on-${direction}-${color}`, callback);
    }

    /**
     * turn off RGB LED
     * @param sensor
     * @param cmd
     * @param direction
     * @param color - 0: none
     * @param callback
     */
    rgbOff (sensor, cmd, direction, color, callback) {
        const datas = this._runPackage(sensor, RGB_CMD.OFF, direction, color);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        // this.removeAllListeners(`motor-cm-${direction}`);
        this.once(`rgb-off-${direction}-${color}`, callback);
    }

    /**
     * turn on RGB LED for entered time
     * @param sensor
     * @param cmd
     * @param direction
     * @param color
     * @param ms    millisecond
     * @param callback
     */
    rgbOnTime (sensor, cmd, direction, color, ms, callback) {
        const datas = this._runPackage(sensor, 3, direction, color, this._short2array(ms));

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`rgb-time-${direction}-${color}`);
        this.once(`rgb-time-${direction}-${color}`, callback);
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
     * beep
     * @param sensor
     * @param cmd
     * @param tone
     * @param beat
     * @param callback
     */
    beep (sensor, cmd, tone, beat, callback) {
        // const datas = this._buzzerControl(0, 262, 50);
        const datas = this._runPackage(sensor, cmd, this._short2array(tone), this._short2array(beat));
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-on`);
        this.once(`buzzer-on`, callback);
    }

    /**
     * The buzzer sounds for the entered time.
     * @param sensor
     * @param cmd
     * @param tone
     * @param beat
     * @param callback
     */
    playBuzzerTime (sensor, cmd, tone, beat, callback) {
        const datas = this._runPackage(sensor, cmd, this._short2array(tone), this._short2array(beat));
        this._sendBuffer = datas.slice();
        const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        const duration = `${this._sendBuffer[9]}${this._sendBuffer[10]}`;

        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-time-${freq}-${duration}`);
        this.once(`buzzer-time-${freq}-${duration}`, callback);
    }

    /**
     * The buzzer sounds at the entered frequency for the entered time.
     * @param sensor
     * @param cmd
     * @param tone
     * @param beat
     * @param callback
     */
    playBuzzerFreq (sensor, cmd, tone, beat, callback) {
        const datas = this._runPackage(sensor, cmd, this._short2array(tone), this._short2array(beat));
        this._sendBuffer = datas.slice();
        const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        const duration = `${this._sendBuffer[9]}${this._sendBuffer[10]}`;

        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-freq-${freq}-${duration}`);
        this.once(`buzzer-freq-${freq}-${duration}`, callback);
    }

    /**
     * buzzer off
     * @param sensor
     * @param cmd
     * @param tone
     * @param beat
     * @param callback
     */
    buzzerOff (sensor, cmd, tone, beat, callback) {
        const datas = this._runPackage(sensor, cmd, this._short2array(tone), this._short2array(beat));
        this._sendBuffer = datas.slice();
        const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        const duration = `${this._sendBuffer[9]}${this._sendBuffer[10]}`;

        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-off-${freq}-${duration}`);
        this.once(`buzzer-off-${freq}-${duration}`, callback);
    }

    /**
     * play note
     * @param sensor
     * @param cmd
     * @param note
     * @param octave
     * @param sharp
     * @param beat
     * @param callback
     */
    playNote (sensor, cmd, note, octave, sharp, beat, callback) {
        const datas = this._runPackage(sensor, cmd, note, octave, sharp, this._short2array(beat));
        this._sendBuffer = datas.slice();
        // const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        // const duration = `${this._sendBuffer[9]}${this._sendBuffer[10]}`;

        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-note-${note}-${octave}-${sharp}`);
        this.once(`buzzer-note-${note}-${octave}-${sharp}`, callback);
    }

    /**
     * rest beat
	 * @param sensor
	 * @param cmd
	 * @param tone
	 * @param beat
	 * @param callback
	 */
    restBeat (sensor, cmd, tone, beat, callback) {
        const datas = this._runPackage(sensor, cmd, this._short2array(tone), this._short2array(beat));
        this._sendBuffer = datas.slice();
        // const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        const duration = `${this._sendBuffer[9]}${this._sendBuffer[10]}`;

        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-rest-${duration}`);
        this.once(`buzzer-rest-${duration}`, callback);
    }

    /**
     * play note with RGB LED
     * @param sensor
     * @param cmd
     * @param note
     * @param octave
     * @param sharp
     * @param beat
     * @param direction
     * @param color
     * @param callback
     */
    playNoteColor (sensor, cmd, note, octave, sharp, beat, direction, color, callback) {
        const datas = this._runPackage(sensor, cmd, note, octave, sharp, this._short2array(beat), direction, color);
        this._sendBuffer = datas.slice();
        // const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        const duration = `${this._sendBuffer[10]}${this._sendBuffer[11]}`;

        writeToTransport(this, datas);

        // this.removeAllListeners(`buzzer-note-color-${note}${octave}${sharp}-${direction}-${color}`);
        this.once(`buzzer-note-color-${note}${octave}${sharp}-${duration}-${direction}-${color}`, callback);
    }

    /**
     * change beat
     * @param sensor
     * @param cmd
     * @param beat
     * @param direction
     * @param color
     * @param callback
     */
    changeBeat (sensor, cmd, beat, callback) {
        const datas = this._runPackage(sensor, cmd, this._short2array(beat));
        this._sendBuffer = datas.slice();
        const duration = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;

        writeToTransport(this, datas);

        // this.removeAllListeners(`buzzer-note-color-${note}${octave}${sharp}-${direction}-${color}`);
        this.once(`buzzer-change-${duration}`, callback);
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
     * @param sensor
     * @param cmd
     * @param direction
     * @param callback
     */
    getLineTracer (sensor, cmd, direction, callback) {
        const datas = this._getPackage(sensor, cmd, direction);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        // this.removeAllListeners(`line-tracer-read-${direction}`);
        this.once(`line-tracer-read-${direction}`, callback);
    }

    /**
     * if detect the black line
     * @param sensor
     * @param cmd
     * @param direction
     * @param detect
     * @param callback
     */
    isLineDetected (sensor, cmd, direction, detect, callback) {
        const datas = this._getPackage(sensor, cmd, direction, detect);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`line-tracer-detect-${direction}-${detect}`);
        this.once(`line-tracer-detect-${direction}-${detect}`, callback);
    }

    /**
     * get left and right line tracer detecting code
     * @param sensor
     * @param cmd
     * @param callback
     */
    getLineTracersDetect (sensor, cmd, callback) {
        const datas = this._getPackage(sensor, cmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`line-tracer-detects`);
        this.once(`line-tracer-detects`, callback);
    }

    /**
     * turn motor until meet the black line
     * @param sensor
     * @param cmd
     * @param exCmd
     * @param callback
     */
    lineTracerCmd (sensor, cmd, exCmd, callback) {
        const datas = this._runPackage(sensor, cmd, exCmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`line-tracer-command-${exCmd}`);
        this.once(`line-tracer-command-${exCmd}`, callback);
    }

    /**
     * read IR Distance sensor
     * @param sensor
     * @param cmd
     * @param direction
     * @param callback
     */
    getDistance (sensor, cmd, direction, callback) {
        const datas = this._getPackage(sensor, cmd, direction);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`distance-read-${direction}`);
        this.once(`distance-read-${direction}`, callback);
    }

    /**
     * get obstacle detecting
     * @param sensor
     * @param cmd
     * @param direction
     * @param detect
     * @param callback
     */
    isDetectObstacle (sensor, cmd, direction, detect, callback) {
        const datas = this._getPackage(sensor, cmd, direction, detect);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`distance-detect-${direction}-${detect}`);
        this.once(`distance-detect-${direction}-${detect}`, callback);
    }

    /**
     * get detecting value of left and right IR distance sensor
     * @param sensor
     * @param cmd
     * @param callback
     */
    isDetectObstacles (sensor, cmd, callback) {
        const datas = this._getPackage(sensor, cmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`distance-detect-all`);
        this.once(`distance-detect-all`, callback);
    }

    /**
     * led matrix on/off (row, col)
     * @param sensor
     * @param cmd
     * @param row
     * @param col
     * @param on
     * @param callback
     */
    ledMatrixOn (sensor, cmd, row, col, on, callback) {
        const datas = this._runPackage(sensor, cmd, row, col, on);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-${row}-${col}-${on}`);
        this.once(`matrix-${row}-${col}-${on}`, callback);
    }

    /**
     * turn on all LED Matrix
     * @param sensor
     * @param cmd
     * @param callback
     */
    ledMatrixOnAll (sensor, cmd, callback) {
        const datas = this._runPackage(sensor, cmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-on-all`);
        this.once(`matrix-on-all`, callback);
    }

    /**
     * turn off all LED Matrix
     * @param sensor
     * @param cmd
     * @param callback
     */
    ledMatrixClear (sensor, cmd, callback) {
        const datas = this._runPackage(sensor, cmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-off-all`);
        this.once(`matrix-off-all`, callback);
    }

    /**
     * show number on LED Matrix
     * @param sensor
     * @param cmd
     * @param num
     * @param callback
     */
    showLedMatrixNumber (sensor, cmd, num, callback) {
        const datas = this._runPackage(sensor, cmd, num);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-num-${num}`);
        this.once(`matrix-num-${num}`, callback);
    }

    /**
     * show english small letter on LED Matrix
     * @param sensor
     * @param cmd
     * @param letter
     * @param callback
     */
    showLedMatrixSmall (sensor, cmd, letter, callback) {
        const datas = this._runPackage(sensor, cmd, letter);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-small-${letter}`);
        this.once(`matrix-small-${letter}`, callback);
    }

    /**
     * show english capital letter on LED Matrix
     * @param sensor
     * @param cmd
     * @param letter
     * @param callback
     */
    showLedMatrixCapital (sensor, cmd, letter, callback) {
        const datas = this._runPackage(sensor, cmd, letter);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-capital-${letter}`);
        this.once(`matrix-capital-${letter}`, callback);
    }

    /**
     * show korean letter on LED Matrix
     * @param sensor
     * @param cmd
     * @param letter
     * @param callback
     */
    showLedMatrixKorean (sensor, cmd, letter, callback) {
        const datas = this._runPackage(sensor, cmd, letter);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`matrix-kr-${letter}`);
        this.once(`matrix-kr-${letter}`, callback);
    }

    /**
     * read value of light sensor
     * @param sensor
     * @param cmd
     * @param callback
     */
    getLightSensor (sensor, cmd, callback) {
        const datas = this._getPackage(sensor, cmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`light`);
        this.once(`light`, callback);
    }

    /**
     * read temperature on board
     * @param sensor
     * @param cmd
     * @param callback
     */
    getTemperature (sensor, cmd, callback) {
        const datas = this._getPackage(sensor, cmd);

        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`temperature`);
        this.once(`temperature`, callback);
    }

    /**
     * read 3-Axis Accelerometer sensor
     * @param sensor
     * @param cmd
     * @param axis
     * @param callback
     */
    getAccelerometer (sensor, cmd, axis, callback) {
        const datas = this._getPackage(sensor, cmd, axis);
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(`acc-${axis}`);
        this.once(`acc-${axis}`, callback);
    }

    /**
     * stop all blocks
     */
    stopAll (callback) {
        const datas = [0xff, 0x55, 0x02, 0x00, 0x04];
        this._sendBuffer = datas.slice();
        writeToTransport(this, datas);

        this.removeAllListeners(); // all event listeners
        // this.removeAllListeners(`stop-all`);
        this.once(`stop-all`, callback);
    }

    /**
     * play melody
     * @param sensor
     * @param cmd
     * @param melody
     * @param callback
     */
    playMelody (sensor, cmd, melody, callback) {
        const datas = this._runPackage(sensor, cmd, melody);
        this._sendBuffer = datas.slice();
        // const freq = `${this._sendBuffer[7]}${this._sendBuffer[8]}`;
        // const duration = `${this._sendBuffer[9]}${this._sendBuffer[10]}`;

        writeToTransport(this, datas);

        this.removeAllListeners(`buzzer-melody-${melody}`);
        this.once(`buzzer-melody-${melody}`, callback);
    }

    /**
     * follow the line
     * @param sensor
     * @param cmd
     * @param speed
     * @param callback
     */
    followLine (sensor, cmd, speed, callback) {
        const datas = this._runPackage(sensor, cmd, speed);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`follow-line`);
        this.once(`follow-line`, callback);
    }

    /**
     * avoid mode
     * @param sensor
     * @param cmd
     * @param callback
     */
    avoidMode (sensor, cmd, callback) {
        const datas = this._runPackage(sensor, cmd);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`avoid-mode`);
        this.once(`avoid-mode`, callback);
    }

    /**
     * Move External motor
     * @param sensor
     * @param cmd
     * @param direction
     * @param speed
     * @param callback
     */
    moveExtMotors (sensor, cmd, direction, speed, callback) {
        const datas = this._runPackage(sensor, cmd, direction, speed);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`ext-motor-${direction}`);
        this.once(`ext-motor-${direction}`, callback);
    }

    /**
     * set speed to selected external motor
     // eslint-disable-next-line valid-jsdoc
     * @param sensor
     * @param cmd
     * @param direction
     * @param speed
     * @param callback
     */
    extMotorControl (sensor, cmd, direction, speed, callback) {
        const datas = this._runPackage(sensor, cmd, direction, this._short2array(speed));
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`ext-motor-set-${direction}`);
        this.once(`ext-motor-set-${direction}`, callback);
    }

    /**
     * set servo motor
     * @param sensor
     * @param cmd
     * @param pin
     * @param angle
     * @param callback
     */
    runExtServo (sensor, pin, angle, callback) {
        const datas = this._runPackage(sensor, pin, angle);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`servo-motor-${pin}-${angle}`);
        this.once(`servo-motor-${pin}-${angle}`, callback);
    }

    /**
     * external speaker sensor on
     * @param sensor
     * @param pin
     * @param freq
     * @param ms
     * @param callback
     */
    extSpeakerOn (sensor, pin, freq, ms, callback) {
        const datas = this._runPackage(sensor, pin, this._short2array(freq), this._short2array(ms));
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`speaker-${pin}`);
        this.once(`speaker-${pin}`, callback);
    }

    /**
     * external led on
     * @param sensor
     * @param pin
     * @param ms
     * @param callback
     */
    extLedOn (sensor, pin, ms, callback) {
        const datas = this._runPackage(sensor, pin, this._short2array(ms));
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`ext-led-${pin}`);
        this.once(`ext-led-${pin}`, callback);
    }

    /**
     * read external touch sensor
     * @param sensor
     * @param pin
     * @param callback
     */
    getTouchPressed (sensor, pin, callback) {
        const datas = this._getPackage(sensor, pin);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`touch-pressed-${pin}`);
        this.once(`touch-pressed-${pin}`, callback);
    }

    /**
     * read external touch sensor pressed
     * @param sensor
     * @param cmd
     * @param pin
     * @param callback
     */
    getTouchSensor (sensor, cmd, pin, callback) {
        const datas = this._getPackage(sensor, cmd, pin);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`touch-${pin}`);
        this.once(`touch-${pin}`, callback);
    }

    /**
     * read mike sensor
     * @param sensor
     * @param pin
     * @param callback
     */
    getMikeSensor (sensor, pin, callback) {
        const datas = this._getPackage(sensor, pin);
        this._sendBuffer = datas.slice();

        writeToTransport(this, datas);

        this.removeAllListeners(`mike-${pin}`);
        this.once(`mike-${pin}`, callback);
    }
}

// Prototype Compatibility Aliases
Firmata.prototype.analogWrite = Firmata.prototype.pwmWrite;

// Static Compatibility Aliases
Firmata.Board = Firmata;
Firmata.SYSEX_RESPONSE = SYSEX_RESPONSE;
Firmata.MIDI_RESPONSE = MIDI_RESPONSE;

// The following are used internally.


module.exports = Firmata;
