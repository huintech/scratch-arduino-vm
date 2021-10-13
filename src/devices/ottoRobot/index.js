const formatMessage = require('format-message');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const ProgramModeType = require('../../extension-support/program-mode-type');

const ArduinoPeripheral = require('../arduinoCommon/arduino-peripheral');

/**
 * The list of USB device filters.
 * @readonly
 */
const PNPID_LIST = [
    // CH340
    'USB\\VID_1A86&PID_7523'
];

/**
 * Configuration of serialport for Firmata
 * @readonly
 */
const SERIAL_CONFIG = {
    baudRate: 57600,
    dataBits: 8,
    stopBits: 1
};

/**
 * Configuration for arduino-cli firmata firmware.
 * @readonly
 */
const DIVECE_OPT = {
    type: 'arduino',
    fqbn: 'arduino:avr:nano:cpu=atmega328',
    firmware: 'arduinoNano.standardFirmata.ino.hex'
};

const Pins = {
    D0: '0',
    D1: '1',
    D2: '2',
    D3: '3',
    D4: '4',
    D5: '5',
    D6: '6',
    D7: '7',
    D8: '8',
    D9: '9',
    D10: '10',
    D11: '11',
    D12: '12',
    D13: '13',
    A0: 'A0',
    A1: 'A1',
    A2: 'A2',
    A3: 'A3',
    A4: 'A4',
    A5: 'A5'
};

const Level = {
    High: 'HIGH',
    Low: 'LOW'
};

const Buadrate = {
    B4800: '4800',
    B9600: '9600',
    B19200: '19200',
    B38400: '38400',
    B57600: '57600',
    B76800: '76800',
    B115200: '115200'
};

const Eol = {
    Warp: 'warp',
    NoWarp: 'noWarp'
};

const Mode = {
    Input: 'INPUT',
    Output: 'OUTPUT',
    InputPullup: 'INPUT_PULLUP'
};

const InterrupMode = {
    Rising: 'RISING',
    Falling: 'FALLING',
    Change: 'CHANGE',
    Low: 'LOW'
};

const DataType = {
    Integer: 'INTEGER',
    Decimal: 'DECIMAL',
    String: 'STRING'
};

/**
 * Manage communication with a Arduino Nano peripheral over a Scratch Arduino Link client socket.
 */
class ArduinoNano extends ArduinoPeripheral{
    /**
     * Construct a Arduino communication object.
     * @param {Runtime} runtime - the Scratch Arduino runtime
     * @param {string} deviceId - the id of the extension
     * @param {string} originalDeviceId - the original id of the peripheral, like xxx_arduinoUno
     */
    constructor (runtime, deviceId, originalDeviceId) {
        super(runtime, deviceId, originalDeviceId, PNPID_LIST, SERIAL_CONFIG, DIVECE_OPT);
    }
}

/**
 * Scratch Arduino blocks to interact with a Arduino Nano peripheral.
 */
class ArduinoOttoRobotDevice {
    /**
     * @return {string} - the ID of this extension.
     */
    static get DEVICE_ID () {
        return 'ottoRobot';
    }
    get DANCES_MENU () {
        return [
            {
                text: 'Feeling Good',
                value: 'Feeling Good'
            },
            {
                text: 'Happy Dance',
                value: 'Happy Dance'
            },
            {
                text: 'Touch Me',
                value: 'Touch Me'
            }
        ]
    }
    get GESTURES_MENU () {
        return [
            {
                text: 'Angry',
                value: 'OttoAngry'
            },
            {
                text: 'Confused',
                value: 'OttoConfused'
            },
            {
                text: 'Fail',
                value: 'OttoFail'
            },
            {
                text: 'Fart',
                value: 'OttoFart'
            },
            {
                text: 'Fretful',
                value: 'OttoFretful'
            },
            {
                text: 'Happy',
                value: 'OttoHappy'
            },
            {
                text: 'Love',
                value: 'OttoLove'
            },
            {
                text: 'Magic',
                value: 'OttoMagic'
            },
            {
                text: 'Sad',
                value: 'OttoSad'
            },
            {
                text: 'Sleeping',
                value: 'OttoSleeping'
            },
            {
                text: 'Super Happy',
                value: 'OttoSuperHappy'
            },
            {
                text: 'Victory',
                value: 'OttoVictory'
            },
            {
                text: 'Wave',
                value: 'OttoWave'
            }
        ]
    }
    get SOUNDS_MENU () {
        return [
            {
                text: 'Button Pressed',
                value: 'S_buttonPushed'
            },
            {
                text: 'Confused',
                value: 'S_confused'
            },
            {
                text: 'Connected',
                value: 'S_connection'
            },
            {
                text: 'Disconnected',
                value: 'S_disconnection'
            },
            {
                text: 'Cuddy',
                value: 'S_cuddly'
            },
            {
                text: 'Fart 1',
                value: 'S_fart1'
            },
            {
                text: 'Fart 2',
                value: 'S_fart2'
            },
            {
                text: 'Fart 3',
                value: 'S_fart3'
            },
            {
                text: 'Short Happy',
                value: 'S_happy_short'
            },
            {
                text: 'Happy',
                value: 'S_happy'
            },
            {
                text: 'Supper Happy',
                value: 'S_superHappy'
            },
            {
                text: 'OhOoh 1',
                value: 'S_OhOoh'
            },
            {
                text: 'OhOoh 2',
                value: 'S_OhOoh2'
            },
            {
                text: 'Mode 1',
                value: 'S_mode1'
            },
            {
                text: 'Mode 2',
                value: 'S_mode2'
            },
            {
                text: 'Mode 3',
                value: 'S_mode3'
            },
            {
                text: 'Sad',
                value: 'S_sad'
            },
            {
                text: 'Sleeping',
                value: 'S_sleeping'
            },
            {
                text: 'Surprise',
                value: 'S_surprise'
            }
        ]
    }
    get TONES_MENU () {
        return [
            {
                text: 'C0',
                value: 16.35
            },
            {
                text: 'Db0',
                value: 17.32
            },
            {
                text: 'D0',
                value: 18.35
            },
            {
                text: 'Eb0',
                value: 19.45
            },
            {
                text: 'E0',
                value: 20.6
            },
            {
                text: 'F0',
                value: 21.83
            },
            {
                text: 'Gb0',
                value: 23.12
            },
            {
                text: 'G0',
                value: 24.5
            },
            {
                text: 'Ab0',
                value: 25.96
            },
            {
                text: 'A0',
                value: 27.5
            },
            {
                text: 'Bb0',
                value: 29.14
            },
            {
                text: 'B0',
                value: 30.87
            },
            {
                text: 'C1',
                value: 32.7
            },
            {
                text: 'Db1',
                value: 34.65
            },
            {
                text: 'D1',
                value: 36.71
            },
            {
                text: 'Eb1',
                value: 38.89
            },
            {
                text: 'E1',
                value: 41.2
            },
            {
                text: 'F1',
                value: 43.65
            },
            {
                text: 'Gb1',
                value: 46.25
            },
            {
                text: 'G1',
                value: 49.0
            },
            {
                text: 'Ab1',
                value: 51.91
            },
            {
                text: 'A1',
                value: 55.0
            },
            {
                text: 'Bb1',
                value: 58.27
            },
            {
                text: 'B1',
                value: 61.74
            },
            {
                text: 'C2',
                value: 65.41
            },
            {
                text: 'Db2',
                value: 69.3
            },
            {
                text: 'D2',
                value: 73.42
            },
            {
                text: 'Eb2',
                value: 77.78
            },
            {
                text: 'E2',
                value: 82.41
            },
            {
                text: 'F2',
                value: 87.31
            },
            {
                text: 'Gb2',
                value: 92.5
            },
            {
                text: 'G2',
                value: 98.0
            },
            {
                text: 'Ab2',
                value: 103.83
            },
            {
                text: 'A2',
                value: 110.0
            },
            {
                text: 'Bb2',
                value: 116.54
            },
            {
                text: 'B2',
                value: 123.47
            },
            {
                text: 'C3',
                value: 130.81
            },
            {
                text: 'Db3',
                value: 138.59
            },
            {
                text: 'D3',
                value: 146.83
            },
            {
                text: 'Eb3',
                value: 155.56
            },
            {
                text: 'E3',
                value: 164.81
            },
            {
                text: 'F3',
                value: 174.61
            },
            {
                text: 'Gb3',
                value: 185.0
            },
            {
                text: 'G3',
                value: 196.0
            },
            {
                text: 'Ab3',
                value: 207.65
            },
            {
                text: 'A3',
                value: 220.0
            },
            {
                text: 'Bb3',
                value: 233.08
            },
            {
                text: 'B3',
                value: 246.94
            },
            {
                text: 'C4',
                value: 261.63
            },
            {
                text: 'Db4',
                value: 277.18
            },
            {
                text: 'D4',
                value: 293.66
            },
            {
                text: 'Eb4',
                value: 311.13
            },
            {
                text: 'E4',
                value: 329.63
            },
            {
                text: 'F4',
                value: 349.23
            },
            {
                text: 'Gb4',
                value: 369.99
            },
            {
                text: 'G4',
                value: 392.0
            },
            {
                text: 'Ab4',
                value: 415.3
            },
            {
                text: 'A4',
                value: 440.0
            },
            {
                text: 'Bb4',
                value: 466.16
            },
            {
                text: 'B4',
                value: 493.88
            },
            {
                text: 'C5',
                value: 523.25
            },
            {
                text: 'Db5',
                value: 554.37
            },
            {
                text: 'D5',
                value: 587.33
            },
            {
                text: 'Eb5',
                value: 622.25
            },
            {
                text: 'E5',
                value: 659.26
            },
            {
                text: 'F5',
                value: 698.46
            },
            {
                text: 'Gb5',
                value: 739.99
            },
            {
                text: 'G5',
                value: 783.99
            },
            {
                text: 'Ab5',
                value: 830.61
            },
            {
                text: 'A5',
                value: 880.0
            },
            {
                text: 'Bb5',
                value: 932.33
            },
            {
                text: 'B5',
                value: 987.77
            },
            {
                text: 'C6',
                value: 1046.5
            },
            {
                text: 'Db6',
                value: 1108.73
            },
            {
                text: 'D6',
                value: 1174.66
            },
            {
                text: 'Eb6',
                value: 1244.51
            },
            {
                text: 'E6',
                value: 1318.51
            },
            {
                text: 'F6',
                value: 1396.91
            },
            {
                text: 'Gb6',
                value: 1479.98
            },
            {
                text: 'G6',
                value: 1567.98
            },
            {
                text: 'Ab6',
                value: 1661.22
            },
            {
                text: 'A6',
                value: 1760.0
            },
            {
                text: 'Bb6',
                value: 1864.66
            },
            {
                text: 'B6',
                value: 1975.53
            },
            {
                text: 'C7',
                value: 2093.0
            },
            {
                text: 'Db7',
                value: 2217.46
            },
            {
                text: 'D7',
                value: 2349.32
            },
            {
                text: 'Eb7',
                value: 2489.02
            },
            {
                text: 'E7',
                value: 2637.02
            },
            {
                text: 'F7',
                value: 2793.83
            },
            {
                text: 'Gb7',
                value: 2959.96
            },
            {
                text: 'G7',
                value: 3135.96
            },
            {
                text: 'Ab7',
                value: 3322.44
            },
            {
                text: 'A7',
                value: 3520.0
            },
            {
                text: 'Bb7',
                value: 3729.31
            },
            {
                text: 'B7',
                value: 3951.07
            },
            {
                text: 'C8',
                value: 4186.01
            },
            {
                text: 'Db8',
                value: 4434.92
            },
            {
                text: 'D8',
                value: 4698.64
            },
            {
                text: 'Eb8',
                value: 4978.03
            }
        ]
    }
    get MOVES_MENU () {
        return [
            {
                text: 'Forward',
                value: 'Forward'
            },
            {
                text: 'Backward',
                value: 'Backward'
            },
            {
                text: 'Turn Left',
                value: 'Turn Left'
            },
            {
                text: 'Turn Right',
                value: 'Turn Right'
            }
        ]
    }
    get ACTIONS_MENU () {
        return [
            {
                text: 'Ascending Turn',
                value: 'Ascending Turn'
            },
            {
                text: 'Bend Left Foot',
                value: 'Bend Left Foot'
            },
            {
                text: 'Bend Right Foot',
                value: 'Bend Right Foot'
            },            
            {
                text: 'Crusaito Forward',
                value: 'Crusaito Forward'
            },
            {
                text: 'Crusaito Backward',
                value: 'Crusaito Backward'
            },
            {
                text: 'Flapping Forward',
                value: 'Flapping Forward'
            },
            {
                text: 'Flapping Backward',
                value: 'Flapping Backward'
            },
            {
                text: 'Jitter',
                value: 'Jitter'
            },
            {
                text: 'Jump',
                value: 'Jump'
            },
            {
                text: 'Moonwalker Left',
                value: 'Moonwalker Left'
            },
            {
                text: 'Moonwalker Right',
                value: 'Moonwalker Right'
            },
            {
                text: 'Shake Left Foot',
                value: 'Shake Left Foot'
            },
            {
                text: 'Shake Right Foot',
                value: 'Shake Right Foot'
            },
            {
                text: 'Swing',
                value: 'Swing'
            },
            {
                text: 'Tiptoe Swing',
                value: 'Tiptoe Swing'
            },
            {
                text: 'Up & Down',
                value: 'Up & Down'
            }
        ]
    }
    get PINS_MENU () {
        return [
            {
                text: '0',
                value: Pins.D0
            },
            {
                text: '1',
                value: Pins.D1
            },
            {
                text: '2',
                value: Pins.D2
            },
            {
                text: '3',
                value: Pins.D3
            },
            {
                text: '4',
                value: Pins.D4
            },
            {
                text: '5',
                value: Pins.D5
            },
            {
                text: '6',
                value: Pins.D6
            },
            {
                text: '7',
                value: Pins.D7
            },
            {
                text: '8',
                value: Pins.D8
            },
            {
                text: '9',
                value: Pins.D9
            },
            {
                text: '10',
                value: Pins.D10
            },
            {
                text: '11',
                value: Pins.D11
            },
            {
                text: '12',
                value: Pins.D12
            },
            {
                text: '13',
                value: Pins.D13
            },
            {
                text: 'A0',
                value: Pins.A0
            },
            {
                text: 'A1',
                value: Pins.A1
            },
            {
                text: 'A2',
                value: Pins.A2
            },
            {
                text: 'A3',
                value: Pins.A3
            },
            {
                text: 'A4',
                value: Pins.A4
            },
            {
                text: 'A5',
                value: Pins.A5
            }
        ];
    }

    get MODE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'arduino.modeMenu.input',
                    default: 'input',
                    description: 'label for input pin mode'
                }),
                value: Mode.Input
            },
            {
                text: formatMessage({
                    id: 'arduino.modeMenu.output',
                    default: 'output',
                    description: 'label for output pin mode'
                }),
                value: Mode.Output
            },
            {
                text: formatMessage({
                    id: 'arduino.modeMenu.inputPullup',
                    default: 'input-pullup',
                    description: 'label for input-pullup pin mode'
                }),
                value: Mode.InputPullup
            }
        ];
    }

    get DIGITAL_PINS_MENU () {
        return [
            {
                text: '0',
                value: Pins.D0
            },
            {
                text: '1',
                value: Pins.D1
            },
            {
                text: '2',
                value: Pins.D2
            },
            {
                text: '3',
                value: Pins.D3
            },
            {
                text: '4',
                value: Pins.D4
            },
            {
                text: '5',
                value: Pins.D5
            },
            {
                text: '6',
                value: Pins.D6
            },
            {
                text: '7',
                value: Pins.D7
            },
            {
                text: '8',
                value: Pins.D8
            },
            {
                text: '9',
                value: Pins.D9
            },
            {
                text: '10',
                value: Pins.D10
            },
            {
                text: '11',
                value: Pins.D11
            },
            {
                text: '12',
                value: Pins.D12
            },
            {
                text: '13',
                value: Pins.D13
            }
        ];
    }

    get ANALOG_PINS_MENU () {
        return [
            {
                text: 'A0',
                value: Pins.A0
            },
            {
                text: 'A1',
                value: Pins.A1
            },
            {
                text: 'A2',
                value: Pins.A2
            },
            {
                text: 'A3',
                value: Pins.A3
            },
            {
                text: 'A4',
                value: Pins.A4
            },
            {
                text: 'A5',
                value: Pins.A5
            }
        ];
    }

    get LEVEL_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'arduino.levelMenu.high',
                    default: 'high',
                    description: 'label for high level'
                }),
                value: Level.High
            },
            {
                text: formatMessage({
                    id: 'arduino.levelMenu.low',
                    default: 'low',
                    description: 'label for low level'
                }),
                value: Level.Low
            }
        ];
    }

    get PWM_PINS_MENU () {
        return [
            {
                text: '3',
                value: Pins.D3
            },
            {
                text: '5',
                value: Pins.D5
            },
            {
                text: '6',
                value: Pins.D6
            },
            {
                text: '9',
                value: Pins.D9
            },
            {
                text: '10',
                value: Pins.D10
            },
            {
                text: '11',
                value: Pins.D11
            }
        ];
    }

    get INTERRUPT_PINS_MENU () {
        return [
            {
                text: '2',
                value: Pins.D2
            },
            {
                text: '3',
                value: Pins.D3
            }
        ];
    }

    get INTERRUP_MODE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'arduino.InterrupModeMenu.risingEdge',
                    default: 'rising edge',
                    description: 'label for rising edge interrup'
                }),
                value: InterrupMode.Rising
            },
            {
                text: formatMessage({
                    id: 'arduino.InterrupModeMenu.fallingEdge',
                    default: 'falling edge',
                    description: 'label for falling edge interrup'
                }),
                value: InterrupMode.Falling
            },
            {
                text: formatMessage({
                    id: 'arduino.InterrupModeMenu.changeEdge',
                    default: 'change edge',
                    description: 'label for change edge interrup'
                }),
                value: InterrupMode.Change
            },
            {
                text: formatMessage({
                    id: 'arduino.InterrupModeMenu.low',
                    default: 'low',
                    description: 'label for low interrup'
                }),
                value: InterrupMode.Low
            }
        ];
    }

    get BAUDTATE_MENU () {
        return [
            {
                text: '4800',
                value: Buadrate.B4800
            },
            {
                text: '9600',
                value: Buadrate.B9600
            },
            {
                text: '19200',
                value: Buadrate.B19200
            },
            {
                text: '38400',
                value: Buadrate.B38400
            },
            {
                text: '57600',
                value: Buadrate.B57600
            },
            {
                text: '76800',
                value: Buadrate.B76800
            },
            {
                text: '115200',
                value: Buadrate.B115200
            }
        ];
    }

    get EOL_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'arduino.eolMenu.warp',
                    default: 'warp',
                    description: 'label for warp print'
                }),
                value: Eol.Warp
            },
            {
                text: formatMessage({
                    id: 'arduino.eolMenu.noWarp',
                    default: 'no-warp',
                    description: 'label for no warp print'
                }),
                value: Eol.NoWarp
            }
        ];
    }

    get DATA_TYPE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'arduino.dataTypeMenu.integer',
                    default: 'integer',
                    description: 'label for integer'
                }),
                value: DataType.Integer
            },
            {
                text: formatMessage({
                    id: 'arduino.dataTypeMenu.decimal',
                    default: 'decimal',
                    description: 'label for decimal number'
                }),
                value: DataType.Decimal
            },
            {
                text: formatMessage({
                    id: 'arduino.dataTypeMenu.string',
                    default: 'string',
                    description: 'label for string'
                }),
                value: DataType.String
            }
        ];
    }

    /**
     * Construct a set of Arduino blocks.
     * @param {Runtime} runtime - the Scratch Arduino runtime.
     * @param {string} originalDeviceId - the original id of the peripheral, like xxx_arduinoUno
     */
    constructor (runtime, originalDeviceId) {
        /**
         * The Scratch Arduino runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new Arduino nano peripheral instance
        this._peripheral = new ArduinoNano(this.runtime, ArduinoOttoRobotDevice.DEVICE_ID, originalDeviceId);
    }

    /**
     * @returns {Array.<object>} metadata for this extension and its blocks.
     */
    getInfo () {
        return [
            {
                id: 'ottoRobot',
                name: formatMessage({
                    id: 'arduino.category.ottoRobot',
                    default: 'Otto Robot',
                    description: 'The name of the Otto Robot in veritcal block'
                }),
                color1: '#009297',
                color2: '#004B4C',
                color3: '#004B4C',
                menuIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADdQAAA3UAe+RuhUAAAUbSURBVFhH3VdrSGVVFF7nvh/e6+1eH2n5GBFNTdEKSX+EEkVEIMPgj4iJiJEYnEkRzBJEUurHkEEQpPZH/DFIWIL6Q5lBGqa0Jh8UjTajoaJzG1PvHcUZ7+uc3Vr7nqtO95zrq199sM9+rL32+dbaa6+zjwAxUHb+0zdEaTdb70gDECUQwQghUWQBX0iSUC5JIj61EAxirSENhutpgDGsmSD4txcFyfdg/N73X/9MUiWoErhYfzHrh8DrC2JwSzA9kYtrs/BsJtILwjUgDWzugbcZMIkaAvi8d4GFAnN3r17KJ4kSVAk0NDQ8c9Py3lxodxNMDiSAOJPMwG4GuL0C6InHVe0WBgVPC7C8wcDtCct2vbfBAKL71ueVT/EBBXDHKUGr1aIpZCk5G+BCBYO8ta9AutkMzZV/g9mwb/qZJIBLhb+Be6AWKoVv4JXCMAFB0IBBJ1h4RwWqBBYXF3ci/rVbJND8OQwtLS3Q3d0NX3zcABV5Wi4jnH1OCxfOvwl9fX1wubYWSmx3ZAmRUHUyhyqB/mv9D2mvqWD8gcmyb0hcXBwEKP5k+EMCOBwO3tbpdKAzWnmbwMMhBmLRc7zw0e/ekO8BmJ15cK5UAOdfQ+BeXYHCV9+Gz65b9uLAZWPwftk63Lr2LRQ8/yKMrpfAr8sAvq07YNGEvD9eecnJJyogNoEPiYAHzK4CPmDDrbAaGdz37rs/AvJ0YnwIvDt4LNEjBP/2ApgF/8kI1NTUnFu1v9xv0ElgtFEQU0CSJKLCwi18CLyFfb7f+/WOdwkses0jk3usoqen5xeafmQMDw9/Nz09zQKBAIbByTA/P888Hg/r7OxskpeNgmoQohWYy7iNpwLy4GvJ3SioEiAL5OaJcRQDVAlEcFoepC/xL4cyYhI47RaQPhHQaNRfE4sAN/00HvhPtuA0iHgAa1Um//8tOMwDqoLm5uaO4uLiBqfTCTabTR4NEzqwcNRYpE9YXl7mH66hoaHLXV1dX/LBf0GVQFFRUU5paelPaWlpRuwyXOzRyspKA5LxkByPFiUqFgqFQK/XM1EUaUza3t5OiI+P/yQ9Pd1Ix8/tdgdR77Wpqak/SO/IaG9v/2BgYIDhvYAtLS2xwcFBVldX944sVkVTU9O7o6OjbGNjg5exsTHW0dFx/FScmJgopKSkQGZmJmRkZEBycjKgZYdGJd0LqLhcLl7sdjuYzWZVvWMdw1jRHAFuSdTL8JKiGsnHIoD3RLl1PCAB1XuhKoG1tTUBP8cwPj4OExMTvGDQHboFNGdubg4mJyd5mZmZIc/ZZXEUFAlkZ2fbTSbT2dzcXDAajRTlPAaQlOr9PgKv15tK0U9HkWqMG8B7QSb2j+7t8vLyMryQoM4+gsEga2xsXJenKKK1tdWC+SPg9/tlLcaQBF1IGBqEv1fRUGRFiYci+CBo/xMSXDHTYlzcjpCamqIxGAzySDgb0klSOwmKBMjlStAe4sTk5CdBgwlR7u4hVujoqqurDWhdCbpKQDcHMGN5MWieXV1dhYWFBa5Mxw+9Cbu+oKymjLU1wJhh+LMankc6BMqWVqvVkJWVtWcZpmh248aNkFBfX3+lqqqqkSI3Pz//sXx+sMzOzsLm5ub9tra2FD5BAb29vVaMfA+9jNxOIPJEAA0JYmHUJ8NQzkZGRt7SYQ6/jlbfQwg+nw/n7IHRXw5FMiUSzOm0yAZfVQVoQABvwVfRA/qkpCROnNaRxXvY2tqiU/UwJyfH/w9pNJbWNrMrwwAAAABJRU5ErkJggg==',
                blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADdQAAA3UAe+RuhUAAAUbSURBVFhH3VdrSGVVFF7nvh/e6+1eH2n5GBFNTdEKSX+EEkVEIMPgj4iJiJEYnEkRzBJEUurHkEEQpPZH/DFIWIL6Q5lBGqa0Jh8UjTajoaJzG1PvHcUZ7+uc3Vr7nqtO95zrq199sM9+rL32+dbaa6+zjwAxUHb+0zdEaTdb70gDECUQwQghUWQBX0iSUC5JIj61EAxirSENhutpgDGsmSD4txcFyfdg/N73X/9MUiWoErhYfzHrh8DrC2JwSzA9kYtrs/BsJtILwjUgDWzugbcZMIkaAvi8d4GFAnN3r17KJ4kSVAk0NDQ8c9Py3lxodxNMDiSAOJPMwG4GuL0C6InHVe0WBgVPC7C8wcDtCct2vbfBAKL71ueVT/EBBXDHKUGr1aIpZCk5G+BCBYO8ta9AutkMzZV/g9mwb/qZJIBLhb+Be6AWKoVv4JXCMAFB0IBBJ1h4RwWqBBYXF3ci/rVbJND8OQwtLS3Q3d0NX3zcABV5Wi4jnH1OCxfOvwl9fX1wubYWSmx3ZAmRUHUyhyqB/mv9D2mvqWD8gcmyb0hcXBwEKP5k+EMCOBwO3tbpdKAzWnmbwMMhBmLRc7zw0e/ekO8BmJ15cK5UAOdfQ+BeXYHCV9+Gz65b9uLAZWPwftk63Lr2LRQ8/yKMrpfAr8sAvq07YNGEvD9eecnJJyogNoEPiYAHzK4CPmDDrbAaGdz37rs/AvJ0YnwIvDt4LNEjBP/2ApgF/8kI1NTUnFu1v9xv0ElgtFEQU0CSJKLCwi18CLyFfb7f+/WOdwkses0jk3usoqen5xeafmQMDw9/Nz09zQKBAIbByTA/P888Hg/r7OxskpeNgmoQohWYy7iNpwLy4GvJ3SioEiAL5OaJcRQDVAlEcFoepC/xL4cyYhI47RaQPhHQaNRfE4sAN/00HvhPtuA0iHgAa1Um//8tOMwDqoLm5uaO4uLiBqfTCTabTR4NEzqwcNRYpE9YXl7mH66hoaHLXV1dX/LBf0GVQFFRUU5paelPaWlpRuwyXOzRyspKA5LxkByPFiUqFgqFQK/XM1EUaUza3t5OiI+P/yQ9Pd1Ix8/tdgdR77Wpqak/SO/IaG9v/2BgYIDhvYAtLS2xwcFBVldX944sVkVTU9O7o6OjbGNjg5exsTHW0dFx/FScmJgopKSkQGZmJmRkZEBycjKgZYdGJd0LqLhcLl7sdjuYzWZVvWMdw1jRHAFuSdTL8JKiGsnHIoD3RLl1PCAB1XuhKoG1tTUBP8cwPj4OExMTvGDQHboFNGdubg4mJyd5mZmZIc/ZZXEUFAlkZ2fbTSbT2dzcXDAajRTlPAaQlOr9PgKv15tK0U9HkWqMG8B7QSb2j+7t8vLyMryQoM4+gsEga2xsXJenKKK1tdWC+SPg9/tlLcaQBF1IGBqEv1fRUGRFiYci+CBo/xMSXDHTYlzcjpCamqIxGAzySDgb0klSOwmKBMjlStAe4sTk5CdBgwlR7u4hVujoqqurDWhdCbpKQDcHMGN5MWieXV1dhYWFBa5Mxw+9Cbu+oKymjLU1wJhh+LMankc6BMqWVqvVkJWVtWcZpmh248aNkFBfX3+lqqqqkSI3Pz//sXx+sMzOzsLm5ub9tra2FD5BAb29vVaMfA+9jNxOIPJEAA0JYmHUJ8NQzkZGRt7SYQ6/jlbfQwg+nw/n7IHRXw5FMiUSzOm0yAZfVQVoQABvwVfRA/qkpCROnNaRxXvY2tqiU/UwJyfH/w9pNJbWNrMrwwAAAABJRU5ErkJggg==',
                blocks: [
                    {
                        opcode: 'setInitial',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setInitial',
                            default: 'Initial Otto Robot',
                            description: 'Initial Otto Robot'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                        }
                    },
                    {
                        opcode: 'setHome',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setHome',
                            default: 'Otto Robot Home',
                            description: 'Set Otto Robot home position'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                        }
                    },
                    {
                        opcode: 'setGesture',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setGesture',
                            default: 'Gesture [GESTURE]',
                            description: 'Set Otto Robot Gesture'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            GESTURE: {
                                type: ArgumentType.STRING,
                                menu: 'gestures',
                                defaultValue: 'OttoHappy'
                            }
                        }
                    },
                    {
                        opcode: 'setPlaySound',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setPlaySound',
                            default: 'Play Sound [SOUND]',
                            description: 'Set Otto Robot play sound'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            SOUND: {
                                type: ArgumentType.STRING,
                                menu: 'sounds',
                                defaultValue: 'S_buttonPushed'
                            }
                        }
                    },
                    {
                        opcode: 'setDance',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setDance',
                            default: 'Dance [DANCE]',
                            description: 'Set Otto Robot dance'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DANCE: {
                                type: ArgumentType.STRING,
                                menu: 'dances',
                                defaultValue: 'Happy Dance'
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'setMove',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setMove',
                            default: 'Move [MOVE] in [DURATION] second',
                            description: 'Set Otto Robot Move'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            MOVE: {
                                type: ArgumentType.STRING,
                                menu: 'moves',
                                defaultValue: 'Forward'
                            },
                            DURATION: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'setAction',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setAction',
                            default: 'Action [ACTION] in [DURATION] second [ANGLE] degrees',
                            description: 'Set Otto Robot Dance'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            ACTION: {
                                type: ArgumentType.STRING,
                                menu: 'actions',
                                defaultValue: 'Moonwalker Left'
                            },
                            DURATION: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            },
                            ANGLE: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 30
                            }
                        }
                    },
                    {
                        opcode: 'setTone',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setTone',
                            default: 'Play Tone [TONE] duration [DRUATION]ms Silent [SILENT]ms',
                            description: 'Set Otto Robot play tone'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            TONE: {
                                type: ArgumentType.STRING,
                                menu: 'tones',
                                defaultValue: 523.25
                            },
                            DRUATION: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            SILENT: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },
                    {
                        opcode: 'setBendTone',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setBendTone',
                            default: 'Bend Tone from [INITIALTONE] to [FINALTONE] step [STEP] duration [DRUATION]ms Silent [SILENT]ms',
                            description: 'Set Otto Robot bend tone'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            INITIALTONE: {
                                type: ArgumentType.STRING,
                                menu: 'tones',
                                defaultValue: 16.35
                            },
                            FINALTONE: {
                                type: ArgumentType.STRING,
                                menu: 'tones',
                                defaultValue: 4978.03
                            },
                            STEP: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1.01
                            },
                            DRUATION: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            SILENT: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 100
                            }
                        }
                    },





                    '---',
                    {
                        opcode: 'setCalibration',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setCalibration',
                            default: 'Calibrate Otto Robot Servo',
                            description: 'Calibrate Otto Robot Servo'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                        }
                    }
                ],
                menus: {
                    dances: {
                        items: this.DANCES_MENU
                    },
                    sounds: {
                        items: this.SOUNDS_MENU
                    },
                    tones: {
                        items: this.TONES_MENU
                    },
                    gestures: {
                        items: this.GESTURES_MENU
                    },
                    moves: {
                        items: this.MOVES_MENU
                    },
                    actions: {
                        items: this.ACTIONS_MENU
                    },
                    pins: {
                        items: this.PINS_MENU
                    },
                    mode: {
                        items: this.MODE_MENU
                    },
                    digitalPins: {
                        items: this.DIGITAL_PINS_MENU
                    },
                    analogPins: {
                        items: this.ANALOG_PINS_MENU
                    },
                    level: {
                        acceptReporters: true,
                        items: this.LEVEL_MENU
                    },
                    pwmPins: {
                        items: this.PWM_PINS_MENU
                    },
                    interruptPins: {
                        items: this.INTERRUPT_PINS_MENU
                    },
                    interruptMode: {
                        items: this.INTERRUP_MODE_MENU
                    }
                }
            },
            {
                id: 'serial',
                name: formatMessage({
                    id: 'arduino.category.serial',
                    default: 'Serial',
                    description: 'The name of the arduino device serial category'
                }),
                color1: '#9966FF',
                color2: '#774DCB',
                color3: '#774DCB',
                blocks: [
                    {
                        opcode: 'serialBegin',
                        text: formatMessage({
                            id: 'arduino.serial.serialBegin',
                            default: 'serial begin baudrate [VALUE]',
                            description: 'arduino serial begin'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            VALUE: {
                                type: ArgumentType.STRING,
                                menu: 'baudrate',
                                defaultValue: Buadrate.B9600
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'serialPrint',
                        text: formatMessage({
                            id: 'arduino.serial.serialPrint',
                            default: 'serial print [VALUE] [EOL]',
                            description: 'arduino serial print'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            VALUE: {
                                type: ArgumentType.STRING,
                                defaultValue: 'Hello Scratch Arduino'
                            },
                            EOL: {
                                type: ArgumentType.STRING,
                                menu: 'eol',
                                defaultValue: Eol.Warp
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'serialAvailable',
                        text: formatMessage({
                            id: 'arduino.serial.serialAvailable',
                            default: 'serial available data length',
                            description: 'arduino serial available data length'
                        }),
                        blockType: BlockType.REPORTER,
                        disableMonitor: true,
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'serialReadData',
                        text: formatMessage({
                            id: 'arduino.serial.serialReadData',
                            default: 'serial read data',
                            description: 'arduino serial read data'
                        }),
                        blockType: BlockType.REPORTER,
                        disableMonitor: true,
                        programMode: [ProgramModeType.UPLOAD]
                    }
                ],
                menus: {
                    baudrate: {
                        items: this.BAUDTATE_MENU
                    },
                    eol: {
                        items: this.EOL_MENU
                    }
                }
            },
            {
                id: 'data',
                name: formatMessage({
                    id: 'arduino.category.data',
                    default: 'Data',
                    description: 'The name of the arduino device data category'
                }),
                color1: '#CF63CF',
                color2: '#C94FC9',
                color3: '#BD42BD',
                blocks: [
                    {
                        opcode: 'dataMap',
                        text: formatMessage({
                            id: 'arduino.data.dataMap',
                            default: 'map [DATA] from ([ARG0], [ARG1]) to ([ARG2], [ARG3])',
                            description: 'arduino data map'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DATA: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '50'
                            },
                            ARG0: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '1'
                            },
                            ARG1: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '100'
                            },
                            ARG2: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '1'
                            },
                            ARG3: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '1000'
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    '---',
                    {
                        opcode: 'dataConstrain',
                        text: formatMessage({
                            id: 'arduino.data.dataConstrain',
                            default: 'constrain [DATA] between ([ARG0], [ARG1])',
                            description: 'arduino data constrain'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DATA: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '50'
                            },
                            ARG0: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '1'
                            },
                            ARG1: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '100'
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'dataConvert',
                        text: formatMessage({
                            id: 'arduino.data.dataConvert',
                            default: 'convert [DATA] to [TYPE]',
                            description: 'arduino data convert'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DATA: {
                                type: ArgumentType.STRING,
                                defaultValue: '123'
                            },
                            TYPE: {
                                type: ArgumentType.STRING,
                                menu: 'dataType',
                                defaultValue: DataType.Integer
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'dataConvertASCIICharacter',
                        text: formatMessage({
                            id: 'arduino.data.dataConvertASCIICharacter',
                            default: 'convert [DATA] to ASCII character',
                            description: 'arduino data convert to ASCII character'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DATA: {
                                type: ArgumentType.NUMBER,
                                defaultValue: '97'
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'dataConvertASCIINumber',
                        text: formatMessage({
                            id: 'arduino.data.dataConvertASCIINumber',
                            default: 'convert [DATA] to ASCII nubmer',
                            description: 'arduino data convert to ASCII nubmer'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DATA: {
                                type: ArgumentType.STRING,
                                defaultValue: 'a'
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    }
                ],
                menus: {
                    dataType: {
                        items: this.DATA_TYPE_MENU
                    }
                }
            }
        ];
    }

    /**
     * Set pin mode.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the set pin mode is done.
     */
    setPinMode (args) {
        this._peripheral.setPinMode(args.PIN, args.MODE);
        return Promise.resolve();
    }

    /**
     * Set pin digital out level.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the set pin digital out level is done.
     */
    setDigitalOutput (args) {
        this._peripheral.setDigitalOutput(args.PIN, args.LEVEL);
        return Promise.resolve();
    }

    /**
     * Set pin pwm out value.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the set pin pwm out value is done.
     */
    setPwmOutput (args) {
        this._peripheral.setPwmOutput(args.PIN, args.OUT);
        return Promise.resolve();
    }

    /**
     * Read pin digital level.
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if read high level, false if read low level.
     */
    readDigitalPin (args) {
        return this._peripheral.readDigitalPin(args.PIN);
    }

    /**
     * Read analog pin.
     * @param {object} args - the block's arguments.
     * @return {number} - analog value fo the pin.
     */
    readAnalogPin (args) {
        return this._peripheral.readAnalogPin(args.PIN);
    }

    /**
     * Set servo out put.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the set servo out value is done.
     */
    setServoOutput (args) {
        this._peripheral.setServoOutput(args.PIN, args.OUT);
        return Promise.resolve();
    }
}

module.exports = ArduinoOttoRobotDevice;