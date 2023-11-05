const formatMessage = require('format-message');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const ProgramModeType = require('../../extension-support/program-mode-type');

const Cast = require('../../util/cast');
const log = require('../../util/log');

const ArduinoPeripheral = require('../arduinoCommon/arduino-peripheral');
const CoconutPeripheral = require('../arduinoCommon/coconut-peripheral');

/**
 * The list of USB device filters.
 * @readonly
 */
const PNPID_LIST = [
    // https://github.com/arduino/Arduino/blob/1.8.0/hardware/arduino/avr/boards.txt#L51-L58
    'USB\\VID_2341&PID_0043',
    'USB\\VID_2341&PID_0001',
    'USB\\VID_2A03&PID_0043',
    'USB\\VID_2341&PID_0243',
    // CH340
    'USB\\VID_1A86&PID_7523',
    // CP210x - dongle connection
    'USB\\VID_10C4&PID_EA60'
];

/**
 * Configuration of serialport for Firmata
 * @readonly
 */
const SERIAL_CONFIG = {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1
};

/**
 * Configuration for arduino-cli firmata firmware.
 * @readonly
 */
const DIVECE_OPT = {
    type: 'arduino',
    fqbn: 'arduino:avr:uno',
    firmware: 'arduinoUno.standardFirmata.ino.hex'
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
 * Enum for direction menu options
 * @type {{ALL: string, BACKWARD: string, LEFT: string, RIGHT: string, FORWARD: string}}
 */
const DirectionValues = {
    FORWARD: 'Forward',
    BACKWARD: 'Backward',
    LEFT: 'Left',
    RIGHT: 'Right',
    ALL: 'All',
    BOTH: 'Both'
};

/**
 * RGB LED color
 */
const LEDColorValues = {
    RED: 'Red',
    GREEN: 'Green',
    BLUE: 'Blue',
    YELLOW: 'Yellow',
    CYAN: 'Cyan',
    MAGENTA: 'Magenta',
    WHITE: 'White',
    BLACK: 'Black'
};

/**
 * Manage communication with a Arduino Uno peripheral over a Scratch Arduino Link client socket.
 */
// class Coconut extends ArduinoPeripheral {
class Coconut extends CoconutPeripheral {
    /**
     * Construct a Arduino communication object.
     * @param {Runtime} runtime - the Coconut runtime
     * @param {string} deviceId - the id of the extension
     * @param {string} originalDeviceId - the original id of the peripheral, like xxx_arduinoUno
     */
    constructor (runtime, deviceId, originalDeviceId) {
        super(runtime, deviceId, originalDeviceId, PNPID_LIST, SERIAL_CONFIG, DIVECE_OPT);
    }
}

/**
 * Coconut blocks to interact with a Arduino Uno peripheral.
 */
class CoconutDevice {
    /**
     * @return {string} - the ID of this extension.
     */
    static get DEVICE_ID () {
        return 'coconut';
    }

    /**
     * forward or backward direction menus
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string}]}
     * @constructor
     */
    get DIRECTION_FB_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dir_forward',
                    default: 'Forward',
                    description: 'move forward'
                }),
                value: DirectionValues.FORWARD
            },
            {
                text: formatMessage({
                    id: 'coconut.dir_backward',
                    default: 'Backward',
                    description: 'move backward'
                }),
                value: DirectionValues.BACKWARD
            }
        ];
    }

    /**
     * Left or Right direction menu
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string}]}
     * @constructor
     */
    get DIRECTION_LR_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dir_left',
                    default: 'Left',
                    description: 'turn left'
                }),
                value: DirectionValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.dir_right',
                    default: 'Right',
                    description: 'turn right'
                }),
                value: DirectionValues.RIGHT
            }
        ];
    }

    /**
     * RGB LED colors
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string}]}
     * @constructor
     */
    get LED_COLOR_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.color_red',
                    default: 'Red',
                    description: 'Red color'
                }),
                value: LEDColorValues.RED
            },
            {
                text: formatMessage({
                    id: 'coconut.color_green',
                    default: 'Green',
                    description: 'Green color'
                }),
                value: LEDColorValues.GREEN
            },
            {
                text: formatMessage({
                    id: 'coconut.color_blue',
                    default: 'Blue',
                    description: 'Blue color'
                }),
                value: LEDColorValues.BLUE
            },
            {
                text: formatMessage({
                    id: 'coconut.color_yellow',
                    default: 'Yellow',
                    description: 'Yellow color'
                }),
                value: LEDColorValues.YELLOW
            },
            {
                text: formatMessage({
                    id: 'coconut.color_cyan',
                    default: 'Cyan',
                    description: 'Cyan color'
                }),
                value: LEDColorValues.CYAN
            },
            {
                text: formatMessage({
                    id: 'coconut.color_magenta',
                    default: 'Magenta',
                    description: 'Magenta color'
                }),
                value: LEDColorValues.MAGENTA
            },
            {
                text: formatMessage({
                    id: 'coconut.color_white',
                    default: 'White',
                    description: 'White color'
                }),
                value: LEDColorValues.WHITE
            }
        ];
    }

    /**
     * degree mmenu
     * @returns {[{mDegrees: number[]}]}
     * @constructor
     */
    get DEGREE_MENU () {
        return [
            {
                text: '30',
                value: 30
            },
            {
                text: '45',
                value: 45
            },
            {
                text: '60',
                value: 60
            },
            {
                text: '90',
                value: 90
            },
            {
                text: '120',
                value: 120
            },
            {
                text: '150',
                value: 150
            },
            {
                text: '180',
                value: 180
            },
            {
                text: '270',
                value: 270
            },
            {
                text: '360',
                value: 360
            }
        ];
    }

    /**
     * Direction of RGB LED
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string},{text: (*|string), value: string}]}
     * @constructor
     */
    get DIRECTION_RGB_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dir_left',
                    default: 'Left',
                    description: 'left direction'
                }),
                value: DirectionValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.dir_right',
                    default: 'Right',
                    description: 'right direction'
                }),
                value: DirectionValues.RIGHT
            },
            {
                text: formatMessage({
                    id: 'coconut.dir_both',
                    default: 'Both',
                    description: 'left and right direction'
                }),
                value: DirectionValues.BOTH
            }
        ];
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

        // Create a new Arduino uno peripheral instance
        this._peripheral = new Coconut(this.runtime, CoconutDevice.DEVICE_ID, originalDeviceId);
    }

    /**
     * @returns {Array.<object>} metadata for this extension and its blocks.
     */
    getInfo () {
        return [
            {
                id: 'coconut',
                name: formatMessage({
                    id: 'coconut.category.name',
                    default: 'Coconut',
                    description: 'The name of the arduino device pin category'
                }),
                color1: '#009297',
                // color1: '#004B4C',
                // color: '#004B4C',
                blocks: [
                    // 코코넛/코코넛-S 블럭
                    // [앞으로/뒤로] 움직이기
                    {
                        opcode: 'moveMotors',
                        text: formatMessage({
                            id: 'coconut.moveMotors',
                            default: 'move [DIRECTION_FB]',
                            description: 'move forward or backward'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_FB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionFBMenu',
                                defaultValue: DirectionValues.FORWARD
                            }
                        }
                    },
                    {
                        opcode: 'turnMotors',
                        text: formatMessage({
                            id: 'coconut.turnMotors',
                            default: 'turn [DIRECTION_LR]',
                            description: 'turn left or right'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            }
                        }
                    },
                    // 정지
                    {
                        opcode: 'stopMotors',
                        text: formatMessage({
                            id: 'coconut.stopMotors',
                            default: 'stop motor',
                            description: 'stop motor'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    '---',
                    {
                        opcode: 'moveGoTimes',
                        text: formatMessage({
                            id: 'coconut.moveGoTimes',
                            default: 'move [DIRECTION_FB] for [TIME_SEC] second(s)',
                            description: 'move forward(backward) for specific times'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_FB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionFBMenu',
                                defaultValue: DirectionValues.FORWARD
                            },
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'turnMotorTimes',
                        text: formatMessage({
                            id: 'coconut.turnMotorTimes',
                            default: 'turn [DIRECTION_LR] for [TIME_SEC] second(s)',
                            description: 'turn left(right) for specific times'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'moveMotorColors',
                        text: formatMessage({
                            id: 'coconut.moveMotorColors',
                            default: 'turn [DIRECTION_LR] RGB [LED_COLOR]',
                            description: 'turn on RGB LED for turning motor'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'moveGoCm',
                        text: formatMessage({
                            id: 'coconut.moveGoCm',
                            default: 'move [DIRECTION_FB] [N_CM] cm',
                            description: 'Move by the entered distance'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_FB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionFBMenu',
                                defaultValue: DirectionValues.FORWARD
                            },
                            N_CM: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'turnMotorDegrees',
                        text: formatMessage({
                            id: 'coconut.turnMotorDegrees',
                            default: 'turn [DIRECTION_LR] to [DEGREE] degrees',
                            description: 'Move by the entered distance'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            DEGREE: {
                                type: ArgumentType.NUMBER,
                                menu: 'DegreeMenu',
                                defaultValue: 90
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'rgbOns',
                        text: formatMessage({
                            id: 'coconut.rgbOns',
                            default: 'turn on RGB [DIRECTION_RGB] [LED_COLOR]',
                            description: 'Turn on RGB LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_RGB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionRGBMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED
                            }
                        }
                    },
                    {
                        opcode: 'rgbOffs',
                        text: formatMessage({
                            id: 'coconut.rgbOffs',
                            default: 'turn off RGB [DIRECTION_RGB]',
                            description: 'Turn off RGB LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_RGB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionRGBMenu',
                                defaultValue: DirectionValues.LEFT
                            }
                        }
                    },
                    {
                        opcode: 'rgbOffColors',
                        text: formatMessage({
                            id: 'coconut.rgbOffColors',
                            default: 'turn off RGB [DIRECTION_RGB] [LED_COLOR]',
                            description: 'Turn off RGB LED '
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_RGB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionRGBMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED
                            }
                        }
                    },
                    {
                        opcode: 'rgbOnTimes',
                        text: formatMessage({
                            id: 'coconut.rgbOnTimes',
                            default: 'turn on RGB [DIRECTION_RGB] [LED_COLOR] for [TIME_SEC] second(s)',
                            description: 'Turn off RGB LED '
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_RGB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionRGBMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED
                            },
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'setPinMode',
                        text: formatMessage({
                            id: 'arduino.pins.setPinMode',
                            default: 'set pin [PIN] mode [MODE]',
                            description: 'arduino set pin mode'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'pins',
                                defaultValue: Pins.D0
                            },
                            MODE: {
                                type: ArgumentType.STRING,
                                menu: 'mode',
                                defaultValue: Mode.Input
                            }
                        }
                    },
                    {
                        opcode: 'setDigitalOutput',
                        text: formatMessage({
                            id: 'arduino.pins.setDigitalOutput',
                            default: 'set digital pin [PIN] out [LEVEL]',
                            description: 'arduino set digital pin out'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'pins',
                                defaultValue: Pins.D0
                            },
                            LEVEL: {
                                type: ArgumentType.STRING,
                                menu: 'level',
                                defaultValue: Level.High
                            }
                        }
                    },
                    {
                        opcode: 'setPwmOutput',
                        text: formatMessage({
                            id: 'arduino.pins.setPwmOutput',
                            default: 'set pwm pin [PIN] out [OUT]',
                            description: 'arduino set pwm pin out'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'pwmPins',
                                defaultValue: Pins.D3
                            },
                            OUT: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: '255'
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'readDigitalPin',
                        text: formatMessage({
                            id: 'arduino.pins.readDigitalPin',
                            default: 'read digital pin [PIN]',
                            description: 'arduino read digital pin'
                        }),
                        blockType: BlockType.BOOLEAN,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'pins',
                                defaultValue: Pins.D0
                            }
                        }
                    },
                    {
                        opcode: 'readAnalogPin',
                        text: formatMessage({
                            id: 'arduino.pins.readAnalogPin',
                            default: 'read analog pin [PIN]',
                            description: 'arduino read analog pin'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'analogPins',
                                defaultValue: Pins.A0
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'setServoOutput',
                        text: formatMessage({
                            id: 'arduino.pins.setServoOutput',
                            default: 'set servo pin [PIN] out [OUT]',
                            description: 'arduino set servo pin out'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'pwmPins',
                                defaultValue: Pins.D3
                            },
                            OUT: {
                                type: ArgumentType.ANGLE,
                                defaultValue: '90'
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'attachInterrupt',
                        text: formatMessage({
                            id: 'arduino.pins.attachInterrupt',
                            default: 'attach interrupt pin [PIN] mode [MODE] executes',
                            description: 'arduino attach interrupt'
                        }),
                        blockType: BlockType.CONDITIONAL,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'interruptPins',
                                defaultValue: Pins.D3
                            },
                            MODE: {
                                type: ArgumentType.STRING,
                                menu: 'interruptMode',
                                defaultValue: InterrupMode.Rising
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    },
                    {
                        opcode: 'detachInterrupt',
                        text: formatMessage({
                            id: 'arduino.pins.detachInterrupt',
                            default: 'detach interrupt pin [PIN]',
                            description: 'arduino attach interrupt'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PIN: {
                                type: ArgumentType.STRING,
                                menu: 'interruptPins',
                                defaultValue: Pins.D3
                            }
                        },
                        programMode: [ProgramModeType.UPLOAD]
                    }
                ],
                menus: {
                    // direction : forward, backward
                    DirectionFBMenu: {
                        // acceptReporters: false,
                        items: this.DIRECTION_FB_MENU
                    },
                    DirectionLRMenu: {
                        items: this.DIRECTION_LR_MENU
                    },
                    LEDColorMenu: {
                        items: this.LED_COLOR_MENU
                    },
                    DegreeMenu: {
                        items: this.DEGREE_MENU
                    },
                    DirectionRGBMenu: {
                        items: this.DIRECTION_RGB_MENU
                    },
                    pins: {
                        items: this.PINS_MENU
                    },
                    mode: {
                        items: this.MODE_MENU
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
        ];
    }

    // TODO: 호출 함수(로직 추가 전)
    /**
     * move forward or backward
     * @param args
     * @returns {Promise<void>}
     */
    moveMotors (args) {
        console.log(`moveMotors... ${args.DIRECTION_FB}`);

        this._peripheral.coconutMoveMotors(args.DIRECTION_FB);
        return Promise.resolve();
    }

    turnMotors (args) {
        console.log(`turn motors ${args.DIRECTION_LR}`);

        this._peripheral.coconutTurnMotors(args.DIRECTION_LR);
        return Promise.resolve();
    }

    /**
     *
     * @param args
     * @returns {Promise<void>}
     */
    moveGoTimes (args) {
        console.log(`move go times ${args.DIRECTION_FB} ${args.TIME_SEC} secs`);

        // let sec = args.TIME_SEC;

        this._peripheral.coconutMoveGoTimes(args.DIRECTION_FB, args.TIME_SEC);
        return Promise.resolve();
    }

    /**
     * coconut turn motor for specific times (left or right)
     * @param args
     * @returns {Promise<void>}
     */
    turnMotorTimes (args) {
        console.log(`turn motor for times ${args.DIRECTION_LR} ${args.TIME_SEC} secs`);

        // let sec = args.TIME_SEC;

        this._peripheral.coconutTurnMotorTimes(args.DIRECTION_LR, args.TIME_SEC);
        return Promise.resolve();
    }

    /**
     * stop motor
     */
    stopMotors () {
        console.log('stop motor');
        this._peripheral.coconutStopMotor();
        return Promise.resolve();
    }

    moveMotorColors (args) {
        console.log(`turn on RGB ${args.LED_COLOR} for turing ${args.DIRECTION_LR}`);

        // let sec = args.TIME_SEC;

        this._peripheral.coconutMoveMotorColors(args.DIRECTION_LR, args.LED_COLOR);
        return Promise.resolve();
    }

    /**
     * Move by the entered distance
     * @param args
     * @returns {Promise<void>}
     */
    moveGoCm (args) {
        console.log(`move ${args.DIRECTION_FB} by distance ${args.N_CM}`);

        this._peripheral.coconutMoveGoCm(args.DIRECTION_FB, args.N_CM);
        return Promise.resolve();
    }

    /**
     * turn motor by degree
     * @param args
     * @returns {Promise<void>}
     */
    turnMotorDegrees (args) {
        console.log(`turn ${args.DIRECTION_LR} by degree ${args.DEGREE}`);

        this._peripheral.coconutTurnMotorDegrees(args.DIRECTION_LR, args.DEGREE);
        return Promise.resolve();
    }

    /**
     * Turn on RGB LED
     * @param args
     */
    rgbOns (args) {
        console.log(`turn on ${args.DIRECTION_RGB} by color ${args.LED_COLOR}`);

        this._peripheral.coconutRGBOns(args.DIRECTION_RGB, args.LED_COLOR);
        return Promise.resolve();
    }

    /**
     * turn off RGB LED
     * @param args
     * @returns {Promise<void>}
     */
    rgbOffs (args) {
        console.log(`turn off ${args.DIRECTION_RGB} RGB LED`);

        this._peripheral.coconutRGBOffs(args.DIRECTION_RGB);
        return Promise.resolve();
    }

    /**
     * turn off RGB LED
     * @param args
     */
    rgbOffColors (args) {
        console.log(`turn off ${args.DIRECTION_RGB} RGB LED ${args.LED_COLOR}`);

        this._peripheral.coconutRGBOffColors(args.DIRECTION_RGB, args.LED_COLOR);
        return Promise.resolve();
    }

    rgbOnTimes (args) {
        console.log(`turn off ${args.DIRECTION_RGB} RGB LED ${args.LED_COLOR} ${args.TIME_SEC} secs`);

        this._peripheral.coconutRGBOnTimes(args.DIRECTION_RGB, args.LED_COLOR, args.TIME_SEC);
        return Promise.resolve();
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

module.exports = CoconutDevice;
