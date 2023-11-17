const formatMessage = require('format-message');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const ProgramModeType = require('../../extension-support/program-mode-type');

const Cast = require('../../util/cast');
const log = require('../../util/log');

const CoconutPeripheral = require('../arduinoCommon/coconutS-peripheral');

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
    A0: '14',
    A1: '15',
    A2: '16',
    A3: '17',
    A4: '18',
    A5: '19'
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
    FORWARD: 3,
    BACKWARD: 4,
    LEFT: 1,
    RIGHT: 2,
    ALL: 0,
    BOTH: 0
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
 * Note values
 * @type {{}}
 */
const NoteValues = {
    NOTE_C: 'NOTE_C',
    NOTE_D: 'NOTE_D',
    NOTE_E: 'NOTE_E',
    NOTE_F: 'NOTE_F',
    NOTE_G: 'NOTE_G',
    NOTE_A: 'NOTE_A',
    NOTE_B: 'NOTE_B'
};

const SharpValues = {NONE: '-', SHARP: '#', FLAT: 'b'};

/**
 * beat values
 // eslint-disable-next-line max-len
 * @type {{QUATER: string, HALF: string, DOT_QUATER: string, DOT_8TH: string, DOT_HALF: string, DOT_16TH: string, THIRTYH_2ND: string, WHOLE: string, EIGHTH: string, SIXTEENTH: string, DOT_32ND: string}}
 */
const BeatValues = {
    HALF: 'Half',
    QUARTER: 'Quarter',
    EIGHTH: 'Eighth',
    SIXTEENTH: 'Sixteenth',
    THIRTY_2ND: 'Thirty-second',
    WHOLE: 'Whole',
    DOT_HALF: 'Dotted half',
    DOT_QUARTER: 'Dotted quarter',
    DOT_8TH: 'Dotted eighth',
    DOT_16TH: 'Dotted sixteenth',
    DOT_32ND: 'Dotted thirty-second',
    ORIGINAL: 'original'
};

/**
 * rest beat values
 * @type {{QUATER: string, HALF: string, WHOLE: string, EIGHTH: string, SIXTEENTH: string}}
 */
const BeatRestValues = {
    HALF: 'Half_rest',
    QUARTER: 'Quarter_rest',
    EIGHTH: 'Eighth_rest',
    SIXTEENTH: 'Sixteenth_rest',
    WHOLE: 'Whole_rest'
};

/**
 * detect values
 * @type {{}}
 */
const DetectValues = {YES: 'Yes', NO: 'No'};

/**
 * line tracer command
 * @type {{LEFT: string, RIGHT: string}}
 */
const CommandValues = {LEFT: 'Turn left', RIGHT: 'Turn right'};

/**
 * on off values
 * @type {{OFF: string, ON: string}}
 */
const OnOffValues = {ON: 'On', OFF: 'Off'};

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
        return 'coconutS';
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * forward or backward direction menus
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string}]}
     * @constructor
     */
    get DIRECTION_FB_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.forward',
                    default: 'Forward',
                    description: 'forward direction'
                }),
                value: DirectionValues.FORWARD
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.backward',
                    default: 'Backward',
                    description: 'backward direction'
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
                    id: 'coconut.dirMenu.left',
                    default: 'Left',
                    description: 'left direction'
                }),
                value: DirectionValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.right',
                    default: 'Right',
                    description: 'right direction'
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
                    id: 'coconut.colorMenu.red',
                    default: 'Red',
                    description: 'Red color'
                }),
                value: LEDColorValues.RED
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.green',
                    default: 'Green',
                    description: 'Green color'
                }),
                value: LEDColorValues.GREEN
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.blue',
                    default: 'Blue',
                    description: 'Blue color'
                }),
                value: LEDColorValues.BLUE
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.yellow',
                    default: 'Yellow',
                    description: 'Yellow color'
                }),
                value: LEDColorValues.YELLOW
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.cyan',
                    default: 'Cyan',
                    description: 'Cyan color'
                }),
                value: LEDColorValues.CYAN
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.magenta',
                    default: 'Magenta',
                    description: 'Magenta color'
                }),
                value: LEDColorValues.MAGENTA
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.white',
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
    get DIRECTION_LRB_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.left',
                    default: 'Left',
                    description: 'left direction'
                }),
                value: DirectionValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.right',
                    default: 'Right',
                    description: 'right direction'
                }),
                value: DirectionValues.RIGHT
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.both',
                    default: 'Both',
                    description: 'left and right direction'
                }),
                value: DirectionValues.BOTH
            }
        ];
    }

    /**
     * NOTE menu
     * @constructor
     */
    get NOTE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.c',
                    default: 'NOTE_C',
                    description: 'note c'
                }),
                value: NoteValues.NOTE_C
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.d',
                    default: 'NOTE_D',
                    description: 'note d'
                }),
                value: NoteValues.NOTE_D
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.e',
                    default: 'NOTE_E',
                    description: 'note e'
                }),
                value: NoteValues.NOTE_E
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.f',
                    default: 'NOTE_F',
                    description: 'note F'
                }),
                value: NoteValues.NOTE_F
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.g',
                    default: 'NOTE_G',
                    description: 'note G'
                }),
                value: NoteValues.NOTE_G
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.a',
                    default: 'NOTE_A',
                    description: 'note a'
                }),
                value: NoteValues.NOTE_A
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.b',
                    default: 'NOTE_B',
                    description: 'note b'
                }),
                value: NoteValues.NOTE_B
            }
        ];
    }

    /**
     * octave menu
     * @returns {[{text: (*|string), value: string}]}
     * @constructor
     */
    get OCTAVE_MENU () {
        return [
            {
                text: '3',
                value: 3
            },
            {
                text: '4',
                value: 4
            },
            {
                text: '5',
                value: 5
            },
            {
                text: '6',
                value: 6
            }
        ];
    }

    /**
     * Sharp menu
     * @constructor
     */
    get SHARP_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.sharpMenu.none',
                    default: '-',
                    description: 'normal none'
                }),
                value: SharpValues.NONE
            },
            {
                text: formatMessage({
                    id: 'coconut.sharpMenu.sharp',
                    default: '#',
                    description: 'sharp note'
                }),
                value: SharpValues.SHARP
            },
            {
                text: formatMessage({
                    id: 'coconut.sharpMenu.flat',
                    default: 'b',
                    description: 'flat note'
                }),
                value: SharpValues.FLAT
            }
        ];
    }

    /**
     * Beat menu
     * @constructor
     */
    get BEAT_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.half',
                    default: BeatValues.HALF,
                    description: 'half beat'
                }),
                value: BeatValues.HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.quarter',
                    default: BeatValues.QUARTER,
                    description: 'quarter beat'
                }),
                value: BeatValues.QUARTER
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.8th',
                    default: BeatValues.EIGHTH,
                    description: 'Eighth beat'
                }),
                value: BeatValues.EIGHTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.16th',
                    default: BeatValues.SIXTEENTH,
                    description: 'Sixteenth beat'
                }),
                value: BeatValues.SIXTEENTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.32nd',
                    default: BeatValues.THIRTY_2ND,
                    description: 'Thirty-second beat'
                }),
                value: BeatValues.THIRTY_2ND
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.whole',
                    default: BeatValues.WHOLE,
                    description: 'Whole beat'
                }),
                value: BeatValues.WHOLE
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_half',
                    default: BeatValues.DOT_HALF,
                    description: 'Dotted half beat'
                }),
                value: BeatValues.DOT_HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_quarter',
                    default: BeatValues.DOT_QUARTER,
                    description: 'Dotted quarter beat'
                }),
                value: BeatValues.DOT_QUARTER
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_8th',
                    default: BeatValues.DOT_8TH,
                    description: 'Dotted eighth beat'
                }),
                value: BeatValues.DOT_8TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_16th',
                    default: BeatValues.DOT_16TH,
                    description: 'Dotted sixteenth beat'
                }),
                value: BeatValues.DOT_16TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_32nd',
                    default: BeatValues.DOT_32ND,
                    description: 'Dotted thirty-second beat'
                }),
                value: BeatValues.DOT_32ND
            }
        ];
    }

    /**
     * rest beat menu
     * @constructor
     */
    get BEAT_REST_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.half',
                    default: BeatRestValues.HALF,
                    description: 'half rest beat'
                }),
                value: BeatRestValues.HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.quarter',
                    default: BeatRestValues.QUARTER,
                    description: 'quarter rest beat'
                }),
                value: BeatRestValues.QUARTER
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.8th',
                    default: BeatRestValues.EIGHTH,
                    description: 'eighth rest beat'
                }),
                value: BeatRestValues.EIGHTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.16th',
                    default: BeatRestValues.SIXTEENTH,
                    description: 'sixteenth rest beat'
                }),
                value: BeatRestValues.SIXTEENTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.whole',
                    default: BeatRestValues.WHOLE,
                    description: 'whole rest beat'
                }),
                value: BeatRestValues.WHOLE
            }
        ];
    }

    /**
     * changing beat menu
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string},{text: (*|string), value: string},{text: (*|string), value: string},{text: (*|string), value: *},null,null,null,null,null,null]}
     * @constructor
     */
    get BEAT_CHANGE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.half',
                    default: BeatValues.HALF,
                    description: 'half beat'
                }),
                value: BeatValues.HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.quarter',
                    default: BeatValues.QUARTER,
                    description: 'quater beat'
                }),
                value: BeatValues.QUARTER
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.8th',
                    default: BeatValues.EIGHTH,
                    description: 'Eighth beat'
                }),
                value: BeatValues.EIGHTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.16th',
                    default: BeatValues.SIXTEENTH,
                    description: 'Sixteenth beat'
                }),
                value: BeatValues.SIXTEENTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.32nd',
                    default: BeatValues.THIRTY_2ND,
                    description: 'Thirty-second beat'
                }),
                value: BeatValues.THIRTY_2ND
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.whole',
                    default: BeatValues.WHOLE,
                    description: 'Whole beat'
                }),
                value: BeatValues.WHOLE
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_half',
                    default: BeatValues.DOT_HALF,
                    description: 'Dotted half beat'
                }),
                value: BeatValues.DOT_HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_quarter',
                    default: BeatValues.DOT_QUARTER,
                    description: 'Dotted quarter beat'
                }),
                value: BeatValues.DOT_QUARTER
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_8th',
                    default: BeatValues.DOT_8TH,
                    description: 'Dotted eighth beat'
                }),
                value: BeatValues.DOT_8TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_16th',
                    default: BeatValues.DOT_16TH,
                    description: 'Dotted sixteenth beat'
                }),
                value: BeatValues.DOT_16TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_32nd',
                    default: BeatValues.DOT_32ND,
                    description: 'Dotted thirty-second beat'
                }),
                value: BeatValues.DOT_32ND
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.original',
                    default: BeatValues.ORIGINAL,
                    description: 'original beat'
                }),
                value: BeatValues.ORIGINAL
            }
        ];
    }

    /**
     * detection menu
     * @constructor
     */
    get DETECT_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.detectMenu.yes',
                    default: DetectValues.YES,
                    description: 'detected'
                }),
                value: DetectValues.YES
            },
            {
                text: formatMessage({
                    id: 'coconut.detectMenu.no',
                    default: DetectValues.NO,
                    description: 'not detected'
                }),
                value: DetectValues.NO
            }
        ];
    }

    /**
     * line tracer command menu
     * @constructor
     */
    get COMMAND_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.commandMenu.turnLeft',
                    default: CommandValues.LEFT,
                    description: 'turn left'
                }),
                value: CommandValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.commandMenu.turnRight',
                    default: CommandValues.RIGHT,
                    description: 'turn right'
                }),
                value: CommandValues.RIGHT
            }
        ];
    }

    /**
     * on/off menu
     * @constructor
     */
    get ON_OFF_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.onMenu.on',
                    default: OnOffValues.ON,
                    description: 'turn on'
                }),
                value: OnOffValues.ON
            },
            {
                text: formatMessage({
                    id: 'coconut.onMenu.off',
                    default: OnOffValues.OFF,
                    description: 'turn off'
                }),
                value: OnOffValues.OFF
            }
        ];
    }

    /**
     * led matrix row menu
     * @constructor
     */
    get ROW_MENU () {
        return [
            {
                text: 'Both',
                value: 0
            },
            {
                text: '1',
                value: 1
            },
            {
                text: '2',
                value: 2
            },
            {
                text: '3',
                value: 3
            },
            {
                text: '4',
                value: 4
            },
            {
                text: '5',
                value: 5
            },
            {
                text: '6',
                value: 6
            },
            {
                text: '7',
                value: 7
            },
            {
                text: '8',
                value: 8
            }
        ];
    }

    /**
     * LED matrix col menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null,null,null]}
     * @constructor
     */
    get COL_MENU () {
        return [
            {
                text: 'Both',
                value: 0
            },
            {
                text: '1',
                value: 1
            },
            {
                text: '2',
                value: 2
            },
            {
                text: '3',
                value: 3
            },
            {
                text: '4',
                value: 4
            },
            {
                text: '5',
                value: 5
            },
            {
                text: '6',
                value: 6
            },
            {
                text: '7',
                value: 7
            },
            {
                text: '8',
                value: 8
            }
        ];
    }

    /**
     * number to show on LED Matrix
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null,null,null,null]}
     * @constructor
     */
    get NUMBER_MENU () {
        return [
            {
                text: '0',
                value: 0
            },
            {
                text: '1',
                value: 1
            },
            {
                text: '2',
                value: 2
            },
            {
                text: '3',
                value: 3
            },
            {
                text: '4',
                value: 4
            },
            {
                text: '5',
                value: 5
            },
            {
                text: '6',
                value: 6
            },
            {
                text: '7',
                value: 7
            },
            {
                text: '8',
                value: 8
            },
            {
                text: '9',
                value: 9
            }
        ];
    }

    /**
     * english small letter menu
     * @constructor
     */
    get SMALL_LETTER_MENU () {
        return [
            {
                text: 'a',
                value: 0
            },
            {
                text: 'b',
                value: 1
            },
            {
                text: 'c',
                value: 2
            },
            {
                text: 'd',
                value: 3
            },
            {
                text: 'e',
                value: 4
            },
            {
                text: 'f',
                value: 5
            },
            {
                text: 'g',
                value: 6
            },
            {
                text: 'h',
                value: 7
            },
            {
                text: 'i',
                value: 8
            },
            {
                text: 'j',
                value: 9
            },
            {
                text: 'k',
                value: 10
            },
            {
                text: 'l',
                value: 11
            },
            {
                text: 'm',
                value: 12
            },
            {
                text: 'n',
                value: 13
            },
            {
                text: 'o',
                value: 14
            },
            {
                text: 'p',
                value: 15
            },
            {
                text: 'q',
                value: 16
            },
            {
                text: 'r',
                value: 17
            },
            {
                text: 's',
                value: 18
            },
            {
                text: 't',
                value: 19
            },
            {
                text: 'u',
                value: 20
            },
            {
                text: 'v',
                value: 21
            },
            {
                text: 'w',
                value: 22
            },
            {
                text: 'x',
                value: 23
            },
            {
                text: 'y',
                value: 24
            },
            {
                text: 'z',
                value: 25
            }
        ];
    }

    /**
     * english capital letter menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}
     * @constructor
     */
    get CAPITAL_LETTER_MENU () {
        return [
            {
                text: 'A',
                value: 0
            },
            {
                text: 'B',
                value: 1
            },
            {
                text: 'C',
                value: 2
            },
            {
                text: 'D',
                value: 3
            },
            {
                text: 'E',
                value: 4
            },
            {
                text: 'F',
                value: 5
            },
            {
                text: 'G',
                value: 6
            },
            {
                text: 'H',
                value: 7
            },
            {
                text: 'I',
                value: 8
            },
            {
                text: 'J',
                value: 9
            },
            {
                text: 'K',
                value: 10
            },
            {
                text: 'L',
                value: 11
            },
            {
                text: 'M',
                value: 12
            },
            {
                text: 'N',
                value: 13
            },
            {
                text: 'O',
                value: 14
            },
            {
                text: 'P',
                value: 15
            },
            {
                text: 'Q',
                value: 16
            },
            {
                text: 'R',
                value: 17
            },
            {
                text: 'S',
                value: 18
            },
            {
                text: 'T',
                value: 19
            },
            {
                text: 'U',
                value: 20
            },
            {
                text: 'V',
                value: 21
            },
            {
                text: 'W',
                value: 22
            },
            {
                text: 'X',
                value: 23
            },
            {
                text: 'Y',
                value: 24
            },
            {
                text: 'Z',
                value: 25
            }
        ];
    }

    /**
     * korean letter menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}
     * @constructor
     */
    get KR_LETTER_MENU () {
        // TODO: id로 선언, 한글 추가
        return [
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ga',
                    default: 'ga',
                    description: 'korean ga'
                }),
                value: 0
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.na',
                    default: 'na',
                    description: 'korean na'
                }),
                value: 1
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.da',
                    default: 'da',
                    description: 'korean da'
                }),
                value: 2
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.la',
                    default: 'la',
                    description: 'korean la'
                }),
                value: 3
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ma',
                    default: 'ma',
                    description: 'korean ma'
                }),
                value: 4
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ba',
                    default: 'ba',
                    description: 'korean ba'
                }),
                value: 5
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.sa',
                    default: 'sa',
                    description: 'korean sa'
                }),
                value: 6
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.aa',
                    default: 'aa',
                    description: 'korean aa'
                }),
                value: 7
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ja',
                    default: 'ja',
                    description: 'korean ja'
                }),
                value: 8
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.cha',
                    default: 'cha',
                    description: 'korean cha'
                }),
                value: 9
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ka',
                    default: 'ka',
                    description: 'korean ka'
                }),
                value: 10
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ta',
                    default: 'ta',
                    description: 'korean ta'
                }),
                value: 11
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.pa',
                    default: 'pa',
                    description: 'korean pa'
                }),
                value: 12
            },
            {
                text: formatMessage({
                    id: 'coconut.krLetterMenu.ha',
                    default: 'ha',
                    description: 'korean ha'
                }),
                value: 13
            }
        ];
    }

    /**
     * 3-Axis Accelerometer Axis menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number}]}
     * @constructor
     */
    get ACC_AXIS_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.axisMenu.x',
                    default: 'X-Axis',
                    description: 'X-Axis'
                }),
                value: 1
            },
            {
                text: formatMessage({
                    id: 'coconut.axisMenu.y',
                    default: 'Y-Axis',
                    description: 'Y-Axis'
                }),
                value: 2
            },
            {
                text: formatMessage({
                    id: 'coconut.axisMenu.z',
                    default: 'Z-Axis',
                    description: 'Z-Axis'
                }),
                value: 3
            }
        ];
    }

    /**
     * melody menu
     * @constructor
     */
    get MELODY_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.melodyMenu.twinkle',
                    default: 'Twinkle Twinkle little star',
                    description: 'Twinkle Twinkle little star'
                }),
                value: 1
            },
            {
                text: formatMessage({
                    id: 'coconut.melodyMenu.bears',
                    default: 'Three bears',
                    description: 'Three bears'
                }),
                value: 2
            },
            {
                text: formatMessage({
                    id: 'coconut.melodyMenu.lullaby',
                    default: 'Mozart\'s Lullaby',
                    description: 'Mozart\'s Lullaby'
                }),
                value: 3
            },
            {
                text: formatMessage({
                    id: 'coconut.melodyMenu.doremi',
                    default: 'Do-Re-Mi',
                    description: 'Do-Re-Mi'
                }),
                value: 4
            },
            {
                text: formatMessage({
                    id: 'coconut.melodyMenu.butterfly',
                    default: 'Butterfly',
                    description: 'Butterfly'
                }),
                value: 5
            }
        ];
    }

    /**
     * External motor direction menu
     * @returns {[{text: (*|string), value: string},{text: (*|string), value: string},{text: (*|string), value: string}]}
     * @constructor
     */
    get DIRECTION_EXT_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.forward',
                    default: 'Forward',
                    description: 'forward direction'
                }),
                value: DirectionValues.FORWARD
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.backward',
                    default: 'Backward',
                    description: 'backward direction'
                }),
                value: DirectionValues.BACKWARD
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.left',
                    default: 'Left',
                    description: 'left direction'
                }),
                value: DirectionValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.right',
                    default: 'Right',
                    description: 'right direction'
                }),
                value: DirectionValues.RIGHT
            }
        ];
    }

    /**
     * External motor speed menu
     * @constructor
     */
    get MOTOR_SPEED_MENU () {
        // return [0,50, 100, 150, 255];
        return [
            {
                text: '0',
                value: 0
            },
            {
                text: '50',
                value: 50
            },
            {
                text: '100',
                value: 100
            },
            {
                text: '150',
                value: 150
            },
            {
                text: '255',
                value: 255
            }
        ];
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * external motor speed
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null]}
     * @constructor
     */
    get MOTOR_SPEED2_MENU () {
        return [
            {
                text: '255',
                value: 255
            },
            {
                text: '100',
                value: 100
            },
            {
                text: '50',
                value: 50
            },
            {
                text: '0',
                value: 0
            },
            {
                text: '-50',
                value: -50
            },
            {
                text: '-100',
                value: -100
            },
            {
                text: '-255',
                value: -255
            }
        ];
    }

    /**
     * available pin menu
     * @returns {[{text: string, value: string},{text: string, value: string},{text: string, value: string},{text: string, value: string},{text: string, value: string},null]}
     * @constructor
     */
    get PIN_MENU () {
        return [
            {
                text: 'D4',
                value: Pins.D4
            },
            {
                text: 'D10',
                value: Pins.D10
            },
            {
                text: 'D11',
                value: Pins.D11
            },
            {
                text: 'D12',
                value: Pins.D12
            },
            {
                text: 'A2',
                value: Pins.A2
            },
            {
                text: 'A3',
                value: Pins.A3
            }
        ];
    }

    /**
     * servo angle menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null]}
     * @constructor
     */
    get SERVO_ANGLE_MENU () {
        // [0, 60, 90, 120, 150, 180]
        return [
            {
                text: '0',
                value: 0
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
            }
        ];
    }

    /**
     * pwm pin menu
     * @returns {[{text: string, value: string},{text: string, value: string}]}
     * @constructor
     */
    get PWM_PINS_MENU () {
        return [
            {
                text: 'D10',
                value: Pins.D10
            },
            {
                text: 'D11',
                value: Pins.D11
            }
        ];
    }

    /**
     * Analog pins menu
     * @returns {[{text: string, value: string},{text: string, value: string},{text: string, value: string},{text: string, value: string},{text: string, value: string},null]}
     * @constructor
     */
    get ANALOG_PINS_MENU () {
        return [
            {
                text: 'A2',
                value: Pins.A2
            },
            {
                text: 'A3',
                value: Pins.A3
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

    // get ANALOG_PINS_MENU () {
    //     return [
    //         {
    //             text: 'A0',
    //             value: Pins.A0
    //         },
    //         {
    //             text: 'A1',
    //             value: Pins.A1
    //         },
    //         {
    //             text: 'A2',
    //             value: Pins.A2
    //         },
    //         {
    //             text: 'A3',
    //             value: Pins.A3
    //         },
    //         {
    //             text: 'A4',
    //             value: Pins.A4
    //         },
    //         {
    //             text: 'A5',
    //             value: Pins.A5
    //         }
    //     ];
    // }

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
                id: 'coconutS',
                name: formatMessage({
                    id: 'coconut.category.coconutS',
                    default: 'Coconut-S',
                    description: 'The name of the Coconut-S device category'
                }),
                color1: '#009297',
                color2: '#004B4C',
                color3: '#004B4C',
                blocks: [
                    // [앞으로/뒤로] 움직이기
                    {
                        opcode: 'moveMotor',
                        text: formatMessage({
                            id: 'coconut.moveMotor',
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
                        opcode: 'turnMotor',
                        text: formatMessage({
                            id: 'coconut.turnMotor',
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
                        opcode: 'stopMotor',
                        text: formatMessage({
                            id: 'coconut.stopMotor',
                            default: 'stop motor',
                            description: 'stop motor'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    '---',
                    {
                        opcode: 'moveGoTime',
                        text: formatMessage({
                            id: 'coconut.moveGoTime',
                            default: 'move [DIRECTION_FB] for [TIME_SEC] second(s)',
                            description: 'move motor for the entered time'
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
                        opcode: 'turnMotorTime',
                        text: formatMessage({
                            id: 'coconut.turnMotorTime',
                            default: 'turn [DIRECTION_LR] for [TIME_SEC] second(s)',
                            description: 'turn motor for the entered time'
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
                        opcode: 'moveMotorColor',
                        text: formatMessage({
                            id: 'coconut.moveMotorColor',
                            default: 'turn [DIRECTION_LR] RGB [LED_COLOR]',
                            description: 'Turn on RGB LED while rotating the motor'
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
                        opcode: 'turnMotorDegree',
                        text: formatMessage({
                            id: 'coconut.turnMotorDegree',
                            default: 'turn [DIRECTION_LR] to [DEGREE] degrees',
                            description: 'turn motor by the entered angle'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            DEGREE: {
                                type: ArgumentType.ANGLE,
                                menu: 'DegreeMenu',
                                defaultValue: '90'
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'rgbOn',
                        text: formatMessage({
                            id: 'coconut.rgbOn',
                            default: 'turn on RGB [DIRECTION_LRB] [LED_COLOR]',
                            description: 'Turn on RGB LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
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
                        opcode: 'rgbOff',
                        text: formatMessage({
                            id: 'coconut.rgbOff',
                            default: 'turn off RGB [DIRECTION_LRB]',
                            description: 'Turn off RGB LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
                                defaultValue: DirectionValues.LEFT
                            }
                        }
                    },
                    {
                        opcode: 'rgbOffColor',
                        text: formatMessage({
                            id: 'coconut.rgbOffColor',
                            default: 'turn off RGB [DIRECTION_LRB] [LED_COLOR]',
                            description: 'Turn off selected RGB LED '
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
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
                        opcode: 'rgbOnTime',
                        text: formatMessage({
                            id: 'coconut.rgbOnTime',
                            default: 'turn on RGB [DIRECTION_LRB] [LED_COLOR] for [TIME_SEC] second(s)',
                            description: 'turn on RGB LED for entered time'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
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
                        opcode: 'beep',
                        text: formatMessage({
                            id: 'coconut.beep',
                            default: 'buzzer on',
                            description: 'buzzer on'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    {
                        opcode: 'playBuzzerTime',
                        text: formatMessage({
                            id: 'coconut.playBuzzerTime',
                            default: 'play buzzer for [TIME_SEC] second(s)',
                            description: 'The buzzer sounds for the entered time'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0.6
                            }
                        }
                    },
                    {
                        opcode: 'playBuzzerFreq',
                        text: formatMessage({
                            id: 'coconut.playBuzzerFreq',
                            default: 'play buzzer on frequency [N_FREQUENCY] Hz for [TIME_SEC] second(s)',
                            description: 'The buzzer sounds at the entered frequency for the entered time'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            N_FREQUENCY: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 300
                            },
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0.6
                            }
                        }
                    },
                    {
                        opcode: 'buzzerOff',
                        text: formatMessage({
                            id: 'coconut.buzzerOff',
                            default: 'buzzer off',
                            description: 'buzzer off'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    {
                        opcode: 'playNote',
                        text: formatMessage({
                            id: 'coconut.playNote',
                            default: 'play buzzer on note [NOTE] octave [OCTAVE] [SHARP] beat [BEAT]',
                            description: 'buzzer on frequency for some seconds'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NOTE: {
                                type: ArgumentType.STRING,
                                menu: 'NoteMenu',
                                defaultValue: NoteValues.NOTE_C
                            },
                            OCTAVE: {
                                type: ArgumentType.NUMBER,
                                menu: 'OctaveMenu',
                                defaultValue: 4
                            },
                            SHARP: {
                                type: ArgumentType.STRING,
                                menu: 'SharpMenu',
                                defaultValue: SharpValues.NONE
                            },
                            BEAT: {
                                type: ArgumentType.STRING,
                                menu: 'BeatMenu',
                                defaultValue: BeatValues.HALF
                            }
                        }
                    },
                    {
                        opcode: 'restBeat',
                        text: formatMessage({
                            id: 'coconut.restBeat',
                            default: 'rest beat [BEAT_REST]',
                            description: 'rest beat'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            BEAT_REST: {
                                type: ArgumentType.STRING,
                                menu: 'BeatRestMenu',
                                defaultValue: BeatRestValues.HALF
                            }
                        }
                    },
                    {
                        opcode: 'playNoteColor',
                        text: formatMessage({
                            id: 'coconut.playNoteColor',
                            default: 'play buzzer on note [NOTE] octave [OCTAVE] [SHARP] beat [BEAT] RGB [DIRECTION_LRB] [LED_COLOR]',
                            description: 'play note with RGB LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NOTE: {
                                type: ArgumentType.STRING,
                                menu: 'NoteMenu',
                                defaultValue: NoteValues.NOTE_C
                            },
                            OCTAVE: {
                                type: ArgumentType.NUMBER,
                                menu: 'OctaveMenu',
                                defaultValue: 4
                            },
                            SHARP: {
                                type: ArgumentType.STRING,
                                menu: 'SharpMenu',
                                defaultValue: SharpValues.NONE
                            },
                            BEAT: {
                                type: ArgumentType.STRING,
                                menu: 'BeatMenu',
                                defaultValue: BeatValues.HALF
                            },
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
                                defaultValue: DirectionValues.BOTH
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED
                            }
                        }
                    },
                    {
                        opcode: 'changeBeat',
                        text: formatMessage({
                            id: 'coconut.changeBeat',
                            default: 'change the beat [BEAT_CHANGE]',
                            description: 'change beat'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            BEAT_CHANGE: {
                                type: ArgumentType.STRING,
                                menu: 'BeatChangeMenu',
                                defaultValue: BeatValues.HALF
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'getLineTracer',
                        text: formatMessage({
                            id: 'coconut.getLineTracer',
                            default: 'line tracer [DIRECTION_LR]',
                            description: 'read line tracer left or right'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            }
                        }
                    },
                    {
                        opcode: 'isLineDetected',
                        text: formatMessage({
                            id: 'coconut.isLineDetected',
                            default: 'line tracer detect [DIRECTION_LRB] [DETECT]',
                            description: 'check if line tracer is detected'
                        }),
                        blockType: BlockType.BOOLEAN,
                        arguments: {
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            DETECT: {
                                type: ArgumentType.STRING,
                                menu: 'DetectMenu',
                                defaultValue: DetectValues.YES
                            }
                        }
                    },
                    {
                        opcode: 'getLineTracersDetect',
                        text: formatMessage({
                            id: 'coconut.getLineTracersDetect',
                            default: 'line tracer detection',
                            description: 'line tracer detection result'
                        }),
                        blockType: BlockType.REPORTER
                    },
                    {
                        opcode: 'lineTracerCmd',
                        text: formatMessage({
                            id: 'coconut.lineTracerCmd',
                            default: '[COMMAND] until meet the black line',
                            description: 'turn motor until meet the black line'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            COMMAND: {
                                type: ArgumentType.STRING,
                                menu: 'CommandMenu',
                                defaultValue: CommandValues.LEFT
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'getDistance',
                        text: formatMessage({
                            id: 'coconut.getDistance',
                            default: 'IR distance sensor [DIRECTION_LR]',
                            description: 'read IR distance sensor'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            }
                        }
                    },
                    {
                        opcode: 'isDetectObstacle',
                        text: formatMessage({
                            id: 'coconut.isDetectObstacle',
                            default: 'detecting obstacle [DIRECTION_LRB] [DETECT]',
                            description: 'check if IR distance sensor is detected'
                        }),
                        blockType: BlockType.BOOLEAN,
                        arguments: {
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            DETECT: {
                                type: ArgumentType.STRING,
                                menu: 'DetectMenu',
                                defaultValue: DetectValues.YES
                            }
                        }
                    },
                    {
                        opcode: 'isDetectObstacles',
                        text: formatMessage({
                            id: 'coconut.isDetectObstacles',
                            default: 'detecting obstacle',
                            description: 'check if IR distance sensor is detected'
                        }),
                        blockType: BlockType.BOOLEAN,
                        arguments: {}
                    },
                    '---',
                    {
                        opcode: 'ledMatrixOn',
                        text: formatMessage({
                            id: 'coconut.ledMatrixOn',
                            default: 'LED Matrix [ON_OFF] ( ROW [ROW] , COL [COL] )',
                            description: 'LED Matrix on (single control)'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            ON_OFF: {
                                type: ArgumentType.STRING,
                                menu: 'OnOffMenu',
                                defaultValue: OnOffValues.ON
                            },
                            ROW: {
                                type: ArgumentType.NUMBER,
                                menu: 'RowMenu',
                                defaultValue: 1
                            },
                            COL: {
                                type: ArgumentType.NUMBER,
                                menu: 'ColMenu',
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'ledMatrixOnAll',
                        text: formatMessage({
                            id: 'coconut.ledMatrixOnAll',
                            default: 'turn on all LED Matrix',
                            description: 'turn on all LED Matrix'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    {
                        opcode: 'ledMatrixClear',
                        text: formatMessage({
                            id: 'coconut.ledMatrixClear',
                            default: 'LED Matrix clear all',
                            description: 'LED Matrix clear all'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    {
                        opcode: 'showLedMatrixNumber',
                        text: formatMessage({
                            id: 'coconut.showLedMatrixNumber',
                            default: 'shows number [NUMBER] on LED Matrix',
                            description: 'show number on LED Matrix'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NUMBER: {
                                type: ArgumentType.NUMBER,
                                menu: 'NumberMenu',
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'showLedMatrixSmall',
                        text: formatMessage({
                            id: 'coconut.showLedMatrixSmall',
                            default: 'shows small letter [SMALL_LETTER] on LED Matrix',
                            description: 'shows small letter on LED Matrix'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            SMALL_LETTER: {
                                type: ArgumentType.NUMBER,
                                menu: 'SmallLetterMenu',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'showLedMatrixCapital',
                        text: formatMessage({
                            id: 'coconut.showLedMatrixCapital',
                            default: 'shows capital letter [CAPITAL_LETTER] on LED Matrix',
                            description: 'shows capital letter on LED Matrix'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            CAPITAL_LETTER: {
                                type: ArgumentType.NUMBER,
                                menu: 'CapitalLetterMenu',
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'showLedMatrixKorean',
                        text: formatMessage({
                            id: 'coconut.showLedMatrixKorean',
                            default: 'shows Korean letter [KR_LETTER] on LED Matrix',
                            description: 'shows Korean letter on LED Matrix'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            KR_LETTER: {
                                type: ArgumentType.NUMBER,
                                menu: 'KRLetterMenu',
                                defaultValue: 0
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'getLightSensor',
                        text: formatMessage({
                            id: 'coconut.getLightSensor',
                            default: 'light sensor',
                            description: 'read value of light sensor'
                        }),
                        blockType: BlockType.REPORTER
                    },
                    {
                        opcode: 'getTemperature',
                        text: formatMessage({
                            id: 'coconut.getTemperature',
                            default: 'temperature',
                            description: 'read value of temperature sensor'
                        }),
                        blockType: BlockType.REPORTER
                    },
                    {
                        opcode: 'getAccelerometer',
                        text: formatMessage({
                            id: 'coconut.getAccelerometer',
                            default: '3-Axis Accelerometer [ACC_AXIS] angle',
                            description: 'read value of 3-Axis Accelerometer'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            ACC_AXIS: {
                                type: ArgumentType.NUMBER,
                                menu: 'AccAxisMenu',
                                defaultValue: 1
                            }
                        }
                    }
                    // '---',
                    // {
                    //     opcode: 'setPinMode',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.setPinMode',
                    //         default: 'set pin [PIN] mode [MODE]',
                    //         description: 'arduino set pin mode'
                    //     }),
                    //     blockType: BlockType.COMMAND,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'pins',
                    //             defaultValue: Pins.D0
                    //         },
                    //         MODE: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'mode',
                    //             defaultValue: Mode.Input
                    //         }
                    //     }
                    // },
                    // {
                    //     opcode: 'setDigitalOutput',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.setDigitalOutput',
                    //         default: 'set digital pin [PIN] out [LEVEL]',
                    //         description: 'arduino set digital pin out'
                    //     }),
                    //     blockType: BlockType.COMMAND,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'pins',
                    //             defaultValue: Pins.D0
                    //         },
                    //         LEVEL: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'level',
                    //             defaultValue: Level.High
                    //         }
                    //     }
                    // },
                    // {
                    //     opcode: 'setPwmOutput',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.setPwmOutput',
                    //         default: 'set pwm pin [PIN] out [OUT]',
                    //         description: 'arduino set pwm pin out'
                    //     }),
                    //     blockType: BlockType.COMMAND,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'pwmPins',
                    //             defaultValue: Pins.D3
                    //         },
                    //         OUT: {
                    //             type: ArgumentType.UINT8_NUMBER,
                    //             defaultValue: '255'
                    //         }
                    //     }
                    // },
                    // '---',
                    // {
                    //     opcode: 'readDigitalPin',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.readDigitalPin',
                    //         default: 'read digital pin [PIN]',
                    //         description: 'arduino read digital pin'
                    //     }),
                    //     blockType: BlockType.BOOLEAN,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'pins',
                    //             defaultValue: Pins.D0
                    //         }
                    //     }
                    // },
                    // {
                    //     opcode: 'readAnalogPin',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.readAnalogPin',
                    //         default: 'read analog pin [PIN]',
                    //         description: 'arduino read analog pin'
                    //     }),
                    //     blockType: BlockType.REPORTER,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'analogPins',
                    //             defaultValue: Pins.A0
                    //         }
                    //     }
                    // },
                    // '---',
                    // {
                    //     opcode: 'setServoOutput',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.setServoOutput',
                    //         default: 'set servo pin [PIN] out [OUT]',
                    //         description: 'arduino set servo pin out'
                    //     }),
                    //     blockType: BlockType.COMMAND,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'pwmPins',
                    //             defaultValue: Pins.D3
                    //         },
                    //         OUT: {
                    //             type: ArgumentType.ANGLE,
                    //             defaultValue: '90'
                    //         }
                    //     }
                    // },
                    // '---',
                    // {
                    //     opcode: 'attachInterrupt',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.attachInterrupt',
                    //         default: 'attach interrupt pin [PIN] mode [MODE] executes',
                    //         description: 'arduino attach interrupt'
                    //     }),
                    //     blockType: BlockType.CONDITIONAL,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'interruptPins',
                    //             defaultValue: Pins.D3
                    //         },
                    //         MODE: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'interruptMode',
                    //             defaultValue: InterrupMode.Rising
                    //         }
                    //     },
                    //     programMode: [ProgramModeType.UPLOAD]
                    // },
                    // {
                    //     opcode: 'detachInterrupt',
                    //     text: formatMessage({
                    //         id: 'arduino.pins.detachInterrupt',
                    //         default: 'detach interrupt pin [PIN]',
                    //         description: 'arduino attach interrupt'
                    //     }),
                    //     blockType: BlockType.COMMAND,
                    //     arguments: {
                    //         PIN: {
                    //             type: ArgumentType.STRING,
                    //             menu: 'interruptPins',
                    //             defaultValue: Pins.D3
                    //         }
                    //     },
                    //     programMode: [ProgramModeType.UPLOAD]
                    // }
                ],
                menus: {
                    // direction : forward, backward
                    DirectionFBMenu: {
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
                    DirectionLRBMenu: {
                        items: this.DIRECTION_LRB_MENU
                    },
                    NoteMenu: {
                        items: this.NOTE_MENU
                    },
                    OctaveMenu: {
                        items: this.OCTAVE_MENU
                    },
                    SharpMenu: {
                        items: this.SHARP_MENU
                    },
                    BeatMenu: {
                        items: this.BEAT_MENU
                    },
                    BeatRestMenu: {
                        items: this.BEAT_REST_MENU
                    },
                    BeatChangeMenu: {
                        items: this.BEAT_CHANGE_MENU
                    },
                    DetectMenu: {
                        items: this.DETECT_MENU
                    },
                    CommandMenu: {
                        items: this.COMMAND_MENU
                    },
                    OnOffMenu: {
                        items: this.ON_OFF_MENU
                    },
                    RowMenu: {
                        items: this.ROW_MENU
                    },
                    ColMenu: {
                        items: this.COL_MENU
                    },
                    NumberMenu: {
                        items: this.NUMBER_MENU
                    },
                    SmallLetterMenu: {
                        items: this.SMALL_LETTER_MENU
                    },
                    CapitalLetterMenu: {
                        items: this.CAPITAL_LETTER_MENU
                    },
                    KRLetterMenu: {
                        items: this.KR_LETTER_MENU
                    },
                    AccAxisMenu: {
                        items: this.ACC_AXIS_MENU
                    }
                    // pins: {
                    //     items: this.PINS_MENU
                    // },
                    // mode: {
                    //     items: this.MODE_MENU
                    // },
                    // analogPins: {
                    //     items: this.ANALOG_PINS_MENU
                    // },
                    // level: {
                    //     acceptReporters: true,
                    //     items: this.LEVEL_MENU
                    // },
                    // pwmPins: {
                    //     items: this.PWM_PINS_MENU
                    // },
                    // interruptPins: {
                    //     items: this.INTERRUPT_PINS_MENU
                    // },
                    // interruptMode: {
                    //     items: this.INTERRUP_MODE_MENU
                    // }
                }
            },
            // 강제 정지
            {
                id: 'reset',
                name: formatMessage({
                    id: 'coconut.category.reset',
                    default: 'Reset',
                    description: 'Reset block'
                }),
                color1: '#9966FF',
                blocks: [
                    {
                        opcode: 'stopAll',
                        text: formatMessage({
                            id: 'coconut.reset.stopAll',
                            default: 'stop all',
                            description: 'stop all block'
                        }),
                        blockType: BlockType.COMMAND
                    }
                ]
            },
            {
                id: 'hidden',
                name: formatMessage({
                    id: 'coconut.category.hidden',
                    default: 'Hidden',
                    description: 'The name of the Coconut-S device Hidden category'
                }),
                color1: '#9966FF',
                color2: '#774DCB',
                color3: '#774DCB',
                blocks: [
                    {
                        opcode: 'playMelody',
                        text: formatMessage({
                            id: 'coconut.hidden.playMelody',
                            default: 'play melody [MELODY]',
                            description: 'play selected melody'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            MELODY: {
                                type: ArgumentType.NUMBER,
                                menu: 'MelodyMenu',
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'followLine',
                        text: formatMessage({
                            id: 'coconut.hidden.followLine',
                            default: 'follow the line',
                            description: 'follow the line'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    {
                        opcode: 'avoidMode',
                        text: formatMessage({
                            id: 'coconut.hidden.avoidMode',
                            default: 'avoid mode',
                            description: 'coconut avoid mode'
                        }),
                        blockType: BlockType.COMMAND
                    },
                    {
                        opcode: 'showCharacterDraw',
                        text: formatMessage({
                            id: 'coconut.hidden.showCharacterDraw',
                            default: 'LED Matrix Character [MATRIX]',
                            description: 'show character draw'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            MATRIX: {
                                type: ArgumentType.MATRIX,
                                defaultValue: '0101010101100010101000100'
                            }
                        }
                    }
                ],
                menus: {
                    MelodyMenu: {
                        items: this.MELODY_MENU
                    }
                }
            },
            {
                id: 'sensor',
                name: formatMessage({
                    id: 'coconut.category.sensor',
                    default: 'Sensor',
                    description: 'The name of the Coconut-S device Extended sensor category'
                }),
                color1: '#CF63CF',
                color2: '#C94FC9',
                color3: '#BD42BD',
                blocks: [
                    {
                        opcode: 'moveExtMotors',
                        text: formatMessage({
                            id: 'coconut.sensor.moveExtMotors',
                            default: 'external Motor [DIRECTION_EXT] speed [MOTOR_SPEED]',
                            description: 'external all motors run'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_EXT: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionExtMenu',
                                defaultValue: DirectionValues.FORWARD
                            },
                            MOTOR_SPEED: {
                                type: ArgumentType.NUMBER,
                                menu: 'MotorSpeedMenu',
                                defaultValue: 50
                            }
                        }
                    },
                    // eslint-disable-next-line no-warning-comments
                    // TODO: error: don't show block
                    {
                        opcode: 'extMotorControl',
                        text: formatMessage({
                            id: 'coconut.sensor.extMotorControl',
                            default: 'set external Motor [DIRECTION_LR] speed [MOTOR_SPEED2]',
                            description: 'set speed to selected external motor'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DIRECTION_LR: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRMenu',
                                defaultValue: DirectionValues.LEFT
                            },
                            MOTOR_SPEED2: {
                                type: ArgumentType.NUMBER,
                                menu: 'MotorSpeed2Menu',
                                defaultValue: 50
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'runExtServo',
                        text: formatMessage({
                            id: 'coconut.sensor.runExtServo',
                            default: 'set servo pin [PINS] angle as [SERVO_ANGLE]',
                            description: 'set servo motor'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PINS: {
                                type: ArgumentType.STRING,
                                menu: 'PinMenu',
                                defaultValue: Pins.D4
                            },
                            SERVO_ANGLE: {
                                type: ArgumentType.ANGLE,
                                menu: 'ServoAngleMenu',
                                defaultValue: 90
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'extLedOn',
                        text: formatMessage({
                            id: 'coconut.sensor.extLedOn',
                            default: 'set external LED pin [PINS] for [TIME_SEC] second(s)',
                            description: 'external LED on'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PINS: {
                                type: ArgumentType.STRING,
                                menu: 'PinMenu',
                                defaultValue: Pins.D4
                            },
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                // menu: 'ServoAngleMenu',
                                defaultValue: 0.5
                            }
                        }
                    },
                    {
                        opcode: 'extSpeakerOn',
                        text: formatMessage({
                            id: 'coconut.sensor.extSpeakerOn',
                            default: 'set Speaker pin [PWM_PIN] frequency [N_FREQUENCY] (Hz) duration [TIME_SEC] seconds',
                            description: 'external speaker sensor on'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PWM_PIN: {
                                type: ArgumentType.STRING,
                                menu: 'PWMPinMenu',
                                defaultValue: Pins.D10
                            },
                            N_FREQUENCY: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 100
                            },
                            TIME_SEC: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0.5
                            }
                        }
                    },
                    {
                        opcode: 'extSpeakerOff',
                        text: formatMessage({
                            id: 'coconut.sensor.extSpeakerOff',
                            default: 'stop Speaker pin [PWM_PIN]',
                            description: 'external speaker sensor off'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            PWM_PIN: {
                                type: ArgumentType.STRING,
                                menu: 'PWMPinMenu',
                                defaultValue: Pins.D10
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'getTouchSensor',
                        text: formatMessage({
                            id: 'coconut.sensor.getTouchSensor',
                            default: 'Touch sensor [PINS]',
                            description: 'read touch sensor'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            PINS: {
                                type: ArgumentType.STRING,
                                menu: 'PinMenu',
                                defaultValue: Pins.D11
                            },
                        }
                    },
                    {
                        opcode: 'getTouchPressed',
                        text: formatMessage({
                            id: 'coconut.sensor.getTouchPressed',
                            default: 'Touch sensor [PINS] pressed',
                            description: 'read touch sensor pressed'
                        }),
                        blockType: BlockType.BOOLEAN,
                        arguments: {
                            PINS: {
                                type: ArgumentType.STRING,
                                menu: 'PinMenu',
                                defaultValue: Pins.D11
                            },
                        }
                    },
                    '---',
                    {
                        opcode: 'getMikeSensor',
                        text: formatMessage({
                            id: 'coconut.sensor.getMikeSensor',
                            default: 'Microphone Sound sensor [ANALOG_PIN]',
                            description: 'read mike sensor'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            ANALOG_PIN: {
                                type: ArgumentType.STRING,
                                menu: 'AnalogPinsMenu',
                                defaultValue: Pins.A2
                            }
                        }
                    },
                ],
                menus: {
                    DirectionExtMenu: {
                        items: this.DIRECTION_EXT_MENU
                    },
                    MotorSpeedMenu: {
                        items: this.MOTOR_SPEED_MENU
                    },
                    MotorSpeed2Menu: {
                        items: this.MOTOR_SPEED2_MENU
                    },
                    PinMenu: {
                        items: this.PIN_MENU
                    },
                    ServoAngleMenu: {
                        items: this.SERVO_ANGLE_MENU
                    },
                    PWMPinMenu: {
                        items: this.PWM_PINS_MENU
                    },
                    AnalogPinsMenu: {
                        items: this.ANALOG_PINS_MENU
                    }
                }
            }
        ];
    }

    /**
     * move forward or backward
     * @param args
     * @returns {Promise<void>}
     */
    moveMotor (args) {
        console.log(`moveMotor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.moveMotor(Cast.toNumber(args.DIRECTION_FB));
    }

    /**
     * turn motor
     * @param args
     * @returns {Promise<void>}
     */
    turnMotor (args) {
        console.log(`turn motors ${args.DIRECTION_LR}`);

        this._peripheral.turnMotor(args.DIRECTION_LR);
        // return Promise.resolve();
    }

    /**
     * stop motor
     */
    stopMotor () {
        console.log('stop motor');
        return this._peripheral.stopMotor();
        // return Promise.resolve();
    }

    /**
     * Move the motor for the entered time
     * @param args
     * @returns {Promise<void>}
     */
    moveGoTime (args) {
        console.log(`move ${args.DIRECTION_FB} for ${args.TIME_SEC} secs`);

        // let sec = args.TIME_SEC;

        return this._peripheral.moveGoTime(args.DIRECTION_FB, args.TIME_SEC);
        // return Promise.resolve();
    }

    /**
     * Turn motor for the entered time
     * @param args
     * @returns {Promise<void>}
     */
    turnMotorTime (args) {
        console.log(`turn motor for times ${args.DIRECTION_LR} ${args.TIME_SEC} secs`);

        return this._peripheral.moveGoTime(args.DIRECTION_LR, args.TIME_SEC);
        // return this._peripheral.turnMotorTime(args.DIRECTION_LR, args.TIME_SEC);
        // return Promise.resolve();
    }

    /**
     * Turn on RGB LED while rotating motor
     * @param args
     * @returns {Promise<void>}
     */
    moveMotorColor (args) {
        // console.log(`turn on RGB ${args.LED_COLOR} for turing ${args.DIRECTION_LR}`);
        console.log(`moveMotorColor: args= ${JSON.stringify(args)}`);

        return this._peripheral.moveMotorColor(args.DIRECTION_LR, args.LED_COLOR);
        // return Promise.resolve();
    }

    /**
     * Move by the entered distance
     * @param args
     * @returns {Promise<void>}
     */
    moveGoCm (args) {
        // console.log(`move ${args.DIRECTION_FB} by distance ${args.N_CM}`);
        console.log(`moveGoCm:`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.moveGoCm(args.DIRECTION_FB, Cast.toNumber(args.N_CM));
        // return Promise.resolve();
    }

    /**
     * turn motor by the entered angle
     * @param args
     * @returns {Promise<void>}
     */
    turnMotorDegree (args) {
        console.log(`turnMotorDegree :`);
        console.log(`args= ${JSON.stringify(args)}`);
        // console.log(`turn ${args.DIRECTION_LR} by degree ${args.DEGREE}`);

        return this._peripheral.turnMotorDegree(args.DIRECTION_LR, Cast.toNumber(args.DEGREE));
        // return Promise.resolve();
    }

    /**
     * Turn on RGB LED
     * @param args
     */
    rgbOn (args) {
        // console.log(`turn on ${args.DIRECTION_LRB} by color ${args.LED_COLOR}`);
        console.log(`rgbOn :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOn(args.DIRECTION_LRB, args.LED_COLOR);
        // return Promise.resolve();
    }

    /**
     * turn off RGB LED
     * @param args
     * @returns {Promise<void>}
     */
    rgbOff (args) {
        // console.log(`turn off ${args.DIRECTION_LRB} RGB LED`);
        console.log(`rgbOff :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOff(args.DIRECTION_LRB);
        // return Promise.resolve();
    }

    /**
     * turn off RGB LED
     * @param args
     */
    rgbOffColor (args) {
        // console.log(`turn off ${args.DIRECTION_LRB} RGB LED ${args.LED_COLOR}`);
        console.log(`rgbOffColor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOffColor(args.DIRECTION_LRB, args.LED_COLOR);
        // return Promise.resolve();
    }

    /**
     *
     * @param args
     * @returns {Promise<void>}
     */
    rgbOnTime (args) {
        // console.log(`turn off ${args.DIRECTION_LRB} RGB LED ${args.LED_COLOR} ${args.TIME_SEC} secs`);
        console.log(`rgbOnTime :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOnTime(args.DIRECTION_LRB, args.LED_COLOR, Cast.toNumber(args.TIME_SEC));
        // return Promise.resolve();
    }

    /**
     * buzzer on
     * @returns {Promise<void>}
     */
    beep () {
        console.log(`beep :`);

        return this._peripheral.beep();
        // return Promise.resolve();
    }

    /**
     * The buzzer sounds for the entered time.
     * @param args
     */
    playBuzzerTime (args) {
        // console.log(`turn off ${args.DIRECTION_RGB} RGB LED ${args.LED_COLOR} ${args.TIME_SEC} secs`);
        console.log(`playBuzzerTime :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playBuzzerTime(Cast.toNumber(args.TIME_SEC));
        // return Promise.resolve();
    }

    /**
     * The buzzer sounds at the entered frequency for the entered time.
     * @param args
     */
    playBuzzerFreq (args) {
        // console.log(`buzzer on freq ${args.N_FREQUENCY} Hz  ${args.TIME_SEC} secs`);
        console.log(`playBuzzerFreq :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playBuzzerFreq(Cast.toNumber(args.N_FREQUENCY), Cast.toNumber(args.TIME_SEC));
        // return Promise.resolve();
    }

    /**
     * buzzer off
     * @returns {Promise<void>}
     */
    buzzerOff () {
        console.log(`playBuzzerFreq :`);
        return this._peripheral.buzzerOff();
        // return Promise.resolve();
    }

    /**
     * play note
     * @param args
     */
    playNote (args) {
        console.log(`playNote :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playNote(args.NOTE, Cast.toNumber(args.OCTAVE), args.SHARP, args.BEAT);
        // return Promise.resolve();
    }

    /**
     * rest beat
     * @param args
     */
    restBeat (args) {
	    console.log(`restBeat :`);
	    console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.restBeat(args.BEAT_REST);
        // return Promise.resolve();
    }

    /**
     * play note with RGB LED
     * @param args
     * @returns {Promise<void>}
     */
    playNoteColor (args) {
	    console.log(`playNoteColor :`);
	    console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playNoteColor(args.NOTE, Cast.toNumber(args.OCTAVE), args.SHARP, args.BEAT, args.DIRECTION_LRB, args.LED_COLOR);
        // return Promise.resolve();
    }

    /**
     * change beat
     * @param args
     */
    changeBeat (args) {
        console.log(`changeBeat :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.changeBeat(args.BEAT_CHANGE);
        // return Promise.resolve();
    }

    /**
     * read line tracer (left or right)
     * @param args
     */
    getLineTracer (args) {
        console.log(`getLineTracer :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getLineTracer(args.DIRECTION_LR);
    }

    /**
     * line tracer detection check
     * @param args
     */
    isLineDetected (args) {
        console.log(`isLineDetected :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.isLineDetected(args.DIRECTION_LRB, args.DETECT);
    }

    /**
     * get line tracers decetion
     */
    getLineTracersDetect () {
        console.log(`getLineTracersDetect :`);
        // console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getLineTracersDetect();
    }

    /**
     * run command until line-tracer detect black line
     * @param args
     * @returns {Promise<void>}
     */
    lineTracerCmd (args) {
        console.log(`lineTracerCmd :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.lineTracerCmd(args.COMMAND);
        // return Promise.resolve();
    }

    /**
     * read IR Distance sensor
     * @param args
     * @returns {Promise<void>}
     */
    getDistance (args) {
        console.log(`getDistance :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getDistance(args.DIRECTION_LR);
        // return Promise.resolve();
    }

    /**
     * IR distacne sensor detecting check
     * @param args
     */
    isDetectObstacle (args) {
        console.log(`isDetectObstacle :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.isDetectObstacle(args.DIRECTION_LRB, args.DETECT);
        // return Promise.resolve();
    }

    /**
     * IR distance sensor detecting check (all sensors)
     * @returns {Promise<void>}
     */
    isDetectObstacles () {
        console.log(`isDetectObstacles :`);

        return this._peripheral.isDetectObstacles();
        // return Promise.resolve();
    }

    /**
     * led matrix on
     * @param args
     */
    ledMatrixOn (args) {
        console.log(`ledMatrixOn :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.ledMatrixOn(args.ON_OFF, Cast.toNumber(args.ROW), Cast.toNumber(args.COL));
        // return Promise.resolve();
    }

    /**
     * turn on all LED Matrix
     */
    ledMatrixOnAll () {
        console.log(`ledMatrixOnAll :`);
        return this._peripheral.ledMatrixOnAll();
        // return Promise.resolve();
    }

    /**
     * LED Matrix clear all
     */
    ledMatrixClear () {
        console.log(`ledMatrixClear :`);
        return this._peripheral.ledMatrixClear();
        // return Promise.resolve();
    }

    /**
     * show number on LED Matrix
     * @param args
     */
    showLedMatrixNumber (args) {
        console.log(`showLedMatrixNumber :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixNumber(Cast.toNumber(args.NUMBER));
        // return Promise.resolve();
    }

    /**
     * show english small letter
     * @param args
     * @returns {Promise<void>}
     */
    showLedMatrixSmall (args) {
        console.log(`showLedMatrixSmall :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixSmall(args.SMALL_LETTER);
        // return Promise.resolve();
    }

    /**
     * show english capital letter
     * @param args
     * @returns {Promise<void>}
     */
    showLedMatrixCapital (args) {
        console.log(`showLedMatrixCapital :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixCapital(args.CAPITAL_LETTER);
        // return Promise.resolve();
    }

    /**
     * show korean letter on LED matrix
     * @param args
     * @returns {Promise<void>}
     */
    showLedMatrixKorean (args) {
        console.log(`showLedMatrixKorean :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixKorean(args.KR_LETTER);
        // return Promise.resolve();
    }

    /**
     * read light sensor
     */
    getLightSensor () {
        console.log(`getLightSensor :`);

        return this._peripheral.getLightSensor();
        // return Promise.resolve();
    }

    /**
     * read temperature sensor
     */
    getTemperature () {
        console.log(`getTemperature :`);
        return this._peripheral.getTemperature();
        // return Promise.resolve();
    }

    /**
     * read 3-Axis Accelerometer
     * @param args
     * @returns {Promise<void>}
     */
    getAccelerometer (args) {
        console.log(`getAccelerometer :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getAccelerometer(args.ACC_AXIS);
        // return Promise.resolve();
    }

    /**
     * forced stop all block
     * @returns {*}
     */
    stopAll () {
        console.log(`stopAll :`);

        return this._peripheral.stopAll();
    }

    /**
     * play melody
     * @param args
     */
    playMelody (args) {
        console.log(`playMelody :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playMelody(args.MELODY);
    }

    /**
     * follow the line
     */
    followLine () {
        console.log(`followLine :`);
        return this._peripheral.followLine();
    }

    /**
     * avoid mode
     * @returns {*}
     */
    avoidMode () {
        console.log(`avoidMode :`);
        return this._peripheral.avoidMode();
    }

    /**
     * Display a predefined symbol on the 5x5 LED matrix.
     * TODO: ui 구현
     * @param args
     */
    showCharacterDraw (args) {
        const symbol = Cast.toString(args.MATRIX).replace(/\s/g, '');
        const reducer = (accumulator, c, index) => {
            const value = (c === '0') ? accumulator : accumulator + Math.pow(2, index);
            return value;
        };
        // const hex = symbol.split('').reduce(reducer, 0);
        // if (hex !== null) {
        //     this._peripheral.ledMatrixState[0] = hex & 0x1F;
        //     this._peripheral.ledMatrixState[1] = (hex >> 5) & 0x1F;
        //     this._peripheral.ledMatrixState[2] = (hex >> 10) & 0x1F;
        //     this._peripheral.ledMatrixState[3] = (hex >> 15) & 0x1F;
        //     this._peripheral.ledMatrixState[4] = (hex >> 20) & 0x1F;
        //     this._peripheral.displayMatrix(this._peripheral.ledMatrixState);
        // }
        //
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    /**
     * move external motor
     * @param args
     * @returns {*}
     */
    moveExtMotors (args) {
        console.log(`moveExtMotor :`);
        console.log(`args= ${JSON.stringify(args)}`);
        return this._peripheral.moveExtMotors(args.DIRECTION_EXT, args.MOTOR_SPEED);
    }

    /**
     * set speed to selected external motor
     * @param args
     */
    extMotorControl (args) {
        console.log(`extMotorControl :`);
        console.log(`args= ${JSON.stringify(args)}`);
        return this._peripheral.extMotorControl(args.DIRECTION_LR, Cast.toNumber(args.MOTOR_SPEED2));
    }

    /**
     * set servo motor
     * @param args
     */
    runExtServo (args) {
        console.log(`runExtServo :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.runExtServo(Cast.toNumber(args.PINS), Cast.toNumber(args.SERVO_ANGLE));
    }

    /**
     * external LED on
     * @param args
     */
    extLedOn (args) {
        console.log(`extLedOn :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.extLedOn(Cast.toNumber(args.PINS), Cast.toNumber(args.TIME_SEC));
    }

    /**
     * external speaker sensor on
     * @param args
     */
    extSpeakerOn (args) {
        console.log(`extSpeakerOn :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.extSpeakerOn(Cast.toNumber(args.PWM_PIN), Cast.toNumber(args.N_FREQUENCY), Cast.toNumber(args.TIME_SEC));
    }

    /**
     * external speaker sensor off
     * @param args
     */
    extSpeakerOff (args) {
        console.log(`extSpeakerOff :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.extSpeakerOff(Cast.toNumber(args.PWM_PIN));
    }

    /**
     * external touch sensor read
     * @param args
     */
    getTouchSensor (args) {
        console.log(`getTouchSensor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getTouchSensor(Cast.toNumber(args.PINS));
    }

    /**
     * read external touch sensor pressed
     * @param args
     */
    getTouchPressed (args) {
        console.log(`getTouchPressed :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getTouchPressed(Cast.toNumber(args.PINS));
    }

    /**
     * read mike sensor
     * @param args
     * @returns {Promise<unknown>}
     */
    getMikeSensor (args) {
        console.log(`getMikeSensor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getMikeSensor(Cast.toNumber(args.ANALOG_PIN));
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
