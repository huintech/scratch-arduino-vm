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
 * @type {{ALL: {text: string, value: number}, BACKWARD: {text: string, value: number}, LEFT: {text: string, value: number}, RIGHT: {text: string, value: number}, FORWARD: {text: string, value: number}, BOTH: {text: string, value: number}}}
 */
const DirectionValues = {
    FORWARD: {
        text: 'Forward',
        value: '3',
    },
    BACKWARD: {
        text: 'Backward',
        value: '4'
    },
    LEFT: {
        text: 'Left',
        value: '1'
    },
    RIGHT: {
        text: 'Right',
        value: '2'
    },
    ALL: {
        text: 'All',
        value: '0'
    },
    BOTH: {
        text: 'Both',
        value: '0'
    }
};
// const DirectionValues = {
//     FORWARD: 3,
//     BACKWARD: 4,
//     LEFT: 1,
//     RIGHT: 2,
//     ALL: 0,
//     BOTH: 0
// };

/**
 * RGB LED color
 */
// const LEDColorValues = {
//     BLACK: 0,
//     WHITE: 1,
//     RED: 2,
//     GREEN: 3,
//     BLUE: 4,
//     YELLOW: 5,
//     CYAN: 6,
//     MAGENTA: 7
// };
const LEDColorValues = {
    BLACK: {
        text: 'Black',
        value: '0'
    },
    WHITE: {
        text: 'White',
        value: '1'
    },
    RED: {
        text: 'Red',
        value: '2'
    },
    GREEN: {
        text: 'Green',
        value: '3'
    },
    BLUE: {
        text: 'Blue',
        value: '4'
    },
    YELLOW: {
        text: 'Yellow',
        value: '5'
    },
    CYAN: {
        text: 'Cyan',
        value: '6'
    },
    MAGENTA: {
        text: 'Magenta',
        value: '7'
    }
};
// const LEDColorValues = {
//     RED: 'Red',
//     GREEN: 'Green',
//     BLUE: 'Blue',
//     YELLOW: 'Yellow',
//     CYAN: 'Cyan',
//     MAGENTA: 'Magenta',
//     WHITE: 'White',
//     BLACK: 'Black'
// };


/**
 * Note values
 * @type {{}}
 */
// const NoteValues = {
//     NOTE_C: 67,
//     NOTE_D: 68,
//     NOTE_E: 69,
//     NOTE_F: 70,
//     NOTE_G: 71,
//     NOTE_A: 65,
//     NOTE_B: 66
// };
const NoteValues = {
    NOTE_C: {
        text: 'NOTE_C',
        value: '67'
    },
    NOTE_D: {
        text: 'NOTE_D',
        value: '68'
    },
    NOTE_E: {
        text: 'NOTE_E',
        value: '69'
    },
    NOTE_F: {
        text: 'NOTE_F',
        value: '70'
    },
    NOTE_G: {
        text: 'NOTE_G',
        value: '71'
    },
    NOTE_A: {
        text: 'NOTE_A',
        value: '65'
    },
    NOTE_B: {
        text: 'NOTE_B',
        value: '66'
    }
};
// const NoteValues = {
//     NOTE_C: 'NOTE_C',
//     NOTE_D: 'NOTE_D',
//     NOTE_E: 'NOTE_E',
//     NOTE_F: 'NOTE_F',
//     NOTE_G: 'NOTE_G',
//     NOTE_A: 'NOTE_A',
//     NOTE_B: 'NOTE_B'
// };

// const SharpValues = {NONE: '-', SHARP: '#', FLAT: 'b'};
/**
 * Sharp and flat values
 * @type {{SHARP: {text: string, value: number}, FLAT: {text: string, value: number}, NONE: {text: string, value: number}}}
 */
const SharpValues = {
    NONE: {
        text: '-',
        value: '0'
    },
    SHARP: {
        text: '#',
        value: '35'
    },
    FLAT: {
        text: 'b',
        value: '98'
    }
};
// const SharpValues = {NONE: 0, SHARP: 35, FLAT: 98};

/**
 * beat values
 * @type {{HALF: {text: string, value: string}, QUARTER: {text: string, value: string}, DOT_8TH: {text: string, value: string}, DOT_HALF: {text: string, value: string}, ORIGINAL: {text: string, value: string}, DOT_QUARTER: {text: string, value: string}, DOT_16TH: {text: string, value: string}, WHOLE: {text: string, value: string}, EIGHTH: {text: string, value: string}, THIRTY_2ND: {text: string, value: string}, SIXTEENTH: {text: string, value: string}, DOT_32ND: {text: string, value: string}}}
 */
const BeatValues = {
    HALF: {
        text: 'Half',
        value: '500'
    },
    QUARTER: {
        text: 'Quarter',
        value: '250'
    },
    EIGHTH: {
        text: 'Eighth',
        value: '125'
    },
    SIXTEENTH: {
        text: 'Sixteenth',
        value: '63'
    },
    THIRTY_2ND: {
        text: 'Thirty-second',
        value: '32'
    },
    WHOLE: {
        text: 'Whole',
        value: '1000'
    },
    DOT_HALF: {
        text: 'Dotted half',
        value: '750'
    },
    DOT_QUARTER: {
        text: 'Dotted quarter',
        value: '375'
    },
    DOT_8TH: {
        text: 'Dotted eighth',
        value: '188'
    },
    DOT_16TH: {
        text: 'Dotted sixteenth',
        value: '95'
    },
    DOT_32ND: {
        text: 'Dotted thirty-second',
        value: '48'
    },
    ORIGINAL: {
        text: 'original',
        value: '0'
    }
};

/**
 * rest beat values
 * @type {{HALF: {text: string, value: string}, QUARTER: {text: string, value: string}, WHOLE: {text: string, value: string}, EIGHTH: {text: string, value: string}, SIXTEENTH: {text: string, value: string}}}
 */
const BeatRestValues = {
    HALF: {
        text: 'Half_rest',
        value: '500'
    },
    QUARTER: {
        text: 'Quarter_rest',
        value: '250'
    },
    EIGHTH: {
        text: 'Eighth_rest',
        value: '125'
    },
    SIXTEENTH: {
        text: 'Sixteenth_rest',
        value: '63'
    },
    WHOLE: {
        text: 'Whole_rest',
        value: '1000'
    }
};
// const BeatRestValues = {
//     HALF: 'Half_rest',
//     QUARTER: 'Quarter_rest',
//     EIGHTH: 'Eighth_rest',
//     SIXTEENTH: 'Sixteenth_rest',
//     WHOLE: 'Whole_rest'
// };

/**
 * detect values
 * @type {{}}
 */
const DetectValues = {
    YES: {
        text: 'Yes',
        value: '1'
    },
    NO: {
        text: 'No',
        value: '0'
    }};

/**
 * line tracer command
 * @type {{TURN_RIGHT: {text: string, value: number}, TURN_LEFT: {text: string, value: number}}}
 */
const CommandValues = {
    TURN_LEFT: {
        text: 'Turn left',
        value: '3'
    },
    TURN_RIGHT: {
        text: 'Turn right',
        value: '4'
    }
};

/**
 * on off values
 * @type {{OFF: {text: string, value: number}, ON: {text: string, value: number}}}
 */
const OnOffValues = {
    ON: {
        text: 'On',
        value: '1'
    },
    OFF: {
        text: 'Off',
        value: '0'
    }
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
                    default: DirectionValues.FORWARD,
                    description: 'forward direction'
                }),
                value: DirectionValues.FORWARD.value
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.backward',
                    default: DirectionValues.BACKWARD,
                    description: 'backward direction'
                }),
                value: DirectionValues.BACKWARD.value
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
                    default: DirectionValues.LEFT,
                    description: 'left direction'
                }),
                value: DirectionValues.LEFT.value
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.right',
                    default: DirectionValues.RIGHT,
                    description: 'right direction'
                }),
                value: DirectionValues.RIGHT.value
            }
        ];
    }

    /**
     * RGB LED colors
     * @returns {[{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},null,null]}
     * @constructor
     */
    get LED_COLOR_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.red',
                    default: LEDColorValues.RED,
                    description: 'Red color'
                }),
                value: LEDColorValues.RED.value
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.green',
                    default: LEDColorValues.GREEN,
                    description: 'Green color'
                }),
                value: LEDColorValues.GREEN.value
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.blue',
                    default: LEDColorValues.BLUE,
                    description: 'Blue color'
                }),
                value: LEDColorValues.BLUE.value
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.yellow',
                    default: LEDColorValues.YELLOW,
                    description: 'Yellow color'
                }),
                value: LEDColorValues.YELLOW.value
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.cyan',
                    default: LEDColorValues.CYAN,
                    description: 'Cyan color'
                }),
                value: LEDColorValues.CYAN.value
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.magenta',
                    default: LEDColorValues.MAGENTA,
                    description: 'Magenta color'
                }),
                value: LEDColorValues.MAGENTA.value
            },
            {
                text: formatMessage({
                    id: 'coconut.colorMenu.white',
                    default: LEDColorValues.WHITE,
                    description: 'White color'
                }),
                value: LEDColorValues.WHITE.value
            }
        ];
    }

    /**
     * degree menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null,null,null]}
     * @constructor
     */
    get DEGREE_MENU () {
        return [
            {
                text: '30',
                value: '30'
            },
            {
                text: '45',
                value: '45'
            },
            {
                text: '60',
                value: '60'
            },
            {
                text: '90',
                value: '90'
            },
            {
                text: '120',
                value: '120'
            },
            {
                text: '150',
                value: '150'
            },
            {
                text: '180',
                value: '180'
            },
            {
                text: '270',
                value: '270'
            },
            {
                text: '360',
                value: '360'
            }
        ];
    }

    /**
     * Direction of RGB LED
     * @returns {[{text: (*|string), value},{text: (*|string), value},{text: (*|string), value: number}]}
     * @constructor
     */
    get DIRECTION_LRB_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.left',
                    default: DirectionValues.LEFT,
                    description: 'left direction'
                }),
                value: DirectionValues.LEFT.value
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.right',
                    default: DirectionValues.RIGHT,
                    description: 'right direction'
                }),
                value: DirectionValues.RIGHT.value
            },
            {
                text: formatMessage({
                    id: 'coconut.dirMenu.both',
                    default: DirectionValues.BOTH,
                    description: 'left and right direction'
                }),
                value: DirectionValues.BOTH.value
            }
        ];
    }

    /**
     * NOTE menu
     * @returns {[{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},null,null]}
     * @constructor
     */
    get NOTE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.c',
                    default: NoteValues.NOTE_C,
                    description: 'note C'
                }),
                value: NoteValues.NOTE_C.value
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.d',
                    default: NoteValues.NOTE_D,
                    description: 'note D'
                }),
                value: NoteValues.NOTE_D.value
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.e',
                    default: NoteValues.NOTE_E,
                    description: 'note E'
                }),
                value: NoteValues.NOTE_E.value
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.f',
                    default: NoteValues.NOTE_F,
                    description: 'note F'
                }),
                value: NoteValues.NOTE_F.value
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.g',
                    default: NoteValues.NOTE_G,
                    description: 'note G'
                }),
                value: NoteValues.NOTE_G.value
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.a',
                    default: NoteValues.NOTE_A,
                    description: 'note A'
                }),
                value: NoteValues.NOTE_A.value
            },
            {
                text: formatMessage({
                    id: 'coconut.noteMenu.b',
                    default: NoteValues.NOTE_B,
                    description: 'note B'
                }),
                value: NoteValues.NOTE_B.value
            }
        ];
    }

    /**
     * octave menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number}]}
     * @constructor
     */
    get OCTAVE_MENU () {
        return [
            {
                text: '3',
                value: '3'
            },
            {
                text: '4',
                value: '4'
            },
            {
                text: '5',
                value: '5'
            },
            {
                text: '6',
                value: '6'
            }
        ];
    }

    /**
     * Sharp menu
     * @returns {[{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number}]}
     * @constructor
     */
    get SHARP_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.sharpMenu.none',
                    default: SharpValues.NONE,
                    description: 'normal none'
                }),
                value: SharpValues.NONE.value
            },
            {
                text: formatMessage({
                    id: 'coconut.sharpMenu.sharp',
                    default: SharpValues.SHARP,
                    description: 'sharp note'
                }),
                value: SharpValues.SHARP.value
            },
            {
                text: formatMessage({
                    id: 'coconut.sharpMenu.flat',
                    default: SharpValues.FLAT,
                    description: 'flat note'
                }),
                value: SharpValues.FLAT.value
            }
        ];
    }

    /**
     * Beat menu
     * @returns {[{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},{text: (*|string), value: number},null,null,null,null,null,null]}
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
                value: BeatValues.HALF.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.quarter',
                    default: BeatValues.QUARTER,
                    description: 'quarter beat'
                }),
                value: BeatValues.QUARTER.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.8th',
                    default: BeatValues.EIGHTH,
                    description: 'Eighth beat'
                }),
                value: BeatValues.EIGHTH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.16th',
                    default: BeatValues.SIXTEENTH,
                    description: 'Sixteenth beat'
                }),
                value: BeatValues.SIXTEENTH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.32nd',
                    default: BeatValues.THIRTY_2ND,
                    description: 'Thirty-second beat'
                }),
                value: BeatValues.THIRTY_2ND.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.whole',
                    default: BeatValues.WHOLE,
                    description: 'Whole beat'
                }),
                value: BeatValues.WHOLE.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_half',
                    default: BeatValues.DOT_HALF,
                    description: 'Dotted half beat'
                }),
                value: BeatValues.DOT_HALF.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_quarter',
                    default: BeatValues.DOT_QUARTER,
                    description: 'Dotted quarter beat'
                }),
                value: BeatValues.DOT_QUARTER.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_8th',
                    default: BeatValues.DOT_8TH,
                    description: 'Dotted eighth beat'
                }),
                value: BeatValues.DOT_8TH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_16th',
                    default: BeatValues.DOT_16TH,
                    description: 'Dotted sixteenth beat'
                }),
                value: BeatValues.DOT_16TH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_32nd',
                    default: BeatValues.DOT_32ND,
                    description: 'Dotted thirty-second beat'
                }),
                value: BeatValues.DOT_32ND.value
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
                    default: BeatRestValues.HALF.text,
                    description: 'half rest beat'
                }),
                value: BeatRestValues.HALF.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.quarter',
                    default: BeatRestValues.QUARTER.text,
                    description: 'quarter rest beat'
                }),
                value: BeatRestValues.QUARTER.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.8th',
                    default: BeatRestValues.EIGHTH.text,
                    description: 'eighth rest beat'
                }),
                value: BeatRestValues.EIGHTH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.16th',
                    default: BeatRestValues.SIXTEENTH.text,
                    description: 'sixteenth rest beat'
                }),
                value: BeatRestValues.SIXTEENTH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatRestMenu.whole',
                    default: BeatRestValues.WHOLE.text,
                    description: 'whole rest beat'
                }),
                value: BeatRestValues.WHOLE.value
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
                value: BeatValues.HALF.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.quarter',
                    default: BeatValues.QUARTER,
                    description: 'quarter beat'
                }),
                value: BeatValues.QUARTER.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.8th',
                    default: BeatValues.EIGHTH,
                    description: 'Eighth beat'
                }),
                value: BeatValues.EIGHTH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.16th',
                    default: BeatValues.SIXTEENTH,
                    description: 'Sixteenth beat'
                }),
                value: BeatValues.SIXTEENTH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.32nd',
                    default: BeatValues.THIRTY_2ND,
                    description: 'Thirty-second beat'
                }),
                value: BeatValues.THIRTY_2ND.value
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
                value: BeatValues.DOT_HALF.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_quarter',
                    default: BeatValues.DOT_QUARTER,
                    description: 'Dotted quarter beat'
                }),
                value: BeatValues.DOT_QUARTER.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_8th',
                    default: BeatValues.DOT_8TH,
                    description: 'Dotted eighth beat'
                }),
                value: BeatValues.DOT_8TH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_16th',
                    default: BeatValues.DOT_16TH,
                    description: 'Dotted sixteenth beat'
                }),
                value: BeatValues.DOT_16TH.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.dot_32nd',
                    default: BeatValues.DOT_32ND,
                    description: 'Dotted thirty-second beat'
                }),
                value: BeatValues.DOT_32ND.value
            },
            {
                text: formatMessage({
                    id: 'coconut.beatMenu.original',
                    default: BeatValues.ORIGINAL,
                    description: 'original beat'
                }),
                value: BeatValues.ORIGINAL.value
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
                value: DetectValues.YES.value
            },
            {
                text: formatMessage({
                    id: 'coconut.detectMenu.no',
                    default: DetectValues.NO,
                    description: 'not detected'
                }),
                value: DetectValues.NO.value
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
                    default: CommandValues.TURN_LEFT,
                    description: 'turn left'
                }),
                value: CommandValues.TURN_LEFT.value
            },
            {
                text: formatMessage({
                    id: 'coconut.commandMenu.turnRight',
                    default: CommandValues.TURN_RIGHT,
                    description: 'turn right'
                }),
                value: CommandValues.TURN_RIGHT.value
            }
        ];
    }

    /**
     * on/off menu
     * @returns {[{text: (*|string), value: number},{text: (*|string), value: number}]}
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
                value: OnOffValues.ON.value
            },
            {
                text: formatMessage({
                    id: 'coconut.onMenu.off',
                    default: OnOffValues.OFF,
                    description: 'turn off'
                }),
                value: OnOffValues.OFF.value
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
                text: formatMessage({
                    id: 'coconut.dirMenu.both',
                    default: DirectionValues.BOTH,
                    description: 'both'
                }),
                value: DirectionValues.BOTH.value
            },
            {
                text: '1',
                value: '1'
            },
            {
                text: '2',
                value: '2'
            },
            {
                text: '3',
                value: '3'
            },
            {
                text: '4',
                value: '4'
            },
            {
                text: '5',
                value: '5'
            },
            {
                text: '6',
                value: '6'
            },
            {
                text: '7',
                value: '7'
            },
            {
                text: '8',
                value: '8'
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
                text: formatMessage({
                    id: 'coconut.dirMenu.both',
                    default: DirectionValues.BOTH,
                    description: 'both'
                }),
                value: DirectionValues.BOTH.value
            },
            {
                text: '1',
                value: '1'
            },
            {
                text: '2',
                value: '2'
            },
            {
                text: '3',
                value: '3'
            },
            {
                text: '4',
                value: '4'
            },
            {
                text: '5',
                value: '5'
            },
            {
                text: '6',
                value: '6'
            },
            {
                text: '7',
                value: '7'
            },
            {
                text: '8',
                value: '8'
            }
        ];
    }

    /**
     * number to show on LED Matrix
     * @returns {[{text: string, value: string},{text: string, value: string},{text: string, value: string},{text: string, value: string},{text: string, value: string},null,null,null,null,null]}
     * @constructor
     */
    get NUMBER_MENU () {
        return [
            {
                text: '0',
                value: '0'
            },
            {
                text: '1',
                value: '1'
            },
            {
                text: '2',
                value: '2'
            },
            {
                text: '3',
                value: '3'
            },
            {
                text: '4',
                value: '4'
            },
            {
                text: '5',
                value: '5'
            },
            {
                text: '6',
                value: '6'
            },
            {
                text: '7',
                value: '7'
            },
            {
                text: '8',
                value: '8'
            },
            {
                text: '9',
                value: '9'
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
                value: '0'
            },
            {
                text: 'b',
                value: '1'
            },
            {
                text: 'c',
                value: '2'
            },
            {
                text: 'd',
                value: '3'
            },
            {
                text: 'e',
                value: '4'
            },
            {
                text: 'f',
                value: '5'
            },
            {
                text: 'g',
                value: '6'
            },
            {
                text: 'h',
                value: '7'
            },
            {
                text: 'i',
                value: '8'
            },
            {
                text: 'j',
                value: '9'
            },
            {
                text: 'k',
                value: '10'
            },
            {
                text: 'l',
                value: '11'
            },
            {
                text: 'm',
                value: '12'
            },
            {
                text: 'n',
                value: '13'
            },
            {
                text: 'o',
                value: '14'
            },
            {
                text: 'p',
                value: '15'
            },
            {
                text: 'q',
                value: '16'
            },
            {
                text: 'r',
                value: '17'
            },
            {
                text: 's',
                value: '18'
            },
            {
                text: 't',
                value: '19'
            },
            {
                text: 'u',
                value: '20'
            },
            {
                text: 'v',
                value: '21'
            },
            {
                text: 'w',
                value: '22'
            },
            {
                text: 'x',
                value: '23'
            },
            {
                text: 'y',
                value: '24'
            },
            {
                text: 'z',
                value: '25'
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
                value: '0'
            },
            {
                text: 'B',
                value: '1'
            },
            {
                text: 'C',
                value: '2'
            },
            {
                text: 'D',
                value: '3'
            },
            {
                text: 'E',
                value: '4'
            },
            {
                text: 'F',
                value: '5'
            },
            {
                text: 'G',
                value: '6'
            },
            {
                text: 'H',
                value: '7'
            },
            {
                text: 'I',
                value: '8'
            },
            {
                text: 'J',
                value: '9'
            },
            {
                text: 'K',
                value: '10'
            },
            {
                text: 'L',
                value: '11'
            },
            {
                text: 'M',
                value: '12'
            },
            {
                text: 'N',
                value: '13'
            },
            {
                text: 'O',
                value: '14'
            },
            {
                text: 'P',
                value: '15'
            },
            {
                text: 'Q',
                value: '16'
            },
            {
                text: 'R',
                value: '17'
            },
            {
                text: 'S',
                value: '18'
            },
            {
                text: 'T',
                value: '19'
            },
            {
                text: 'U',
                value: '20'
            },
            {
                text: 'V',
                value: '21'
            },
            {
                text: 'W',
                value: '22'
            },
            {
                text: 'X',
                value: '23'
            },
            {
                text: 'Y',
                value: '24'
            },
            {
                text: 'Z',
                value: '25'
            }
        ];
    }

    /**
     * korean letter menu
     * @returns {[{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},{text: string, value: number},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}
     * @constructor
     */
    get KR_LETTER_MENU () {
        return [
            {
                text: '가',
                value: '0'
            },
            {
                text: '나',
                value: '1'
            },
            {
                text: '다',
                value: '2'
            },
            {
                text: '라',
                value: '3'
            },
            {
                text: '마',
                value: '4'
            },
            {
                text: '바',
                value: '5'
            },
            {
                text: '사',
                value: '6'
            },
            {
                text: '아',
                value: '7'
            },
            {
                text: '자',
                value: '8'
            },
            {
                text: '차',
                value: '9'
            },
            {
                text: '카',
                value: '10'
            },
            {
                text: '타',
                value: '11'
            },
            {
                text: '파',
                value: '12'
            },
            {
                text: '하',
                value: '13'
            }
        ];
    }

    // get KR_LETTER_MENU () {
    //     return [
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ga',
    //                 default: 'ga',
    //                 description: 'korean ga'
    //             }),
    //             value: 0
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.na',
    //                 default: 'na',
    //                 description: 'korean na'
    //             }),
    //             value: 1
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.da',
    //                 default: 'da',
    //                 description: 'korean da'
    //             }),
    //             value: 2
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.la',
    //                 default: 'la',
    //                 description: 'korean la'
    //             }),
    //             value: 3
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ma',
    //                 default: 'ma',
    //                 description: 'korean ma'
    //             }),
    //             value: 4
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ba',
    //                 default: 'ba',
    //                 description: 'korean ba'
    //             }),
    //             value: 5
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.sa',
    //                 default: 'sa',
    //                 description: 'korean sa'
    //             }),
    //             value: 6
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.aa',
    //                 default: 'aa',
    //                 description: 'korean aa'
    //             }),
    //             value: 7
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ja',
    //                 default: 'ja',
    //                 description: 'korean ja'
    //             }),
    //             value: 8
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.cha',
    //                 default: 'cha',
    //                 description: 'korean cha'
    //             }),
    //             value: 9
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ka',
    //                 default: 'ka',
    //                 description: 'korean ka'
    //             }),
    //             value: 10
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ta',
    //                 default: 'ta',
    //                 description: 'korean ta'
    //             }),
    //             value: 11
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.pa',
    //                 default: 'pa',
    //                 description: 'korean pa'
    //             }),
    //             value: 12
    //         },
    //         {
    //             text: formatMessage({
    //                 id: 'coconut.krLetterMenu.ha',
    //                 default: 'ha',
    //                 description: 'korean ha'
    //             }),
    //             value: 13
    //         }
    //     ];
    // }

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
                value: '1'
            },
            {
                text: formatMessage({
                    id: 'coconut.axisMenu.y',
                    default: 'Y-Axis',
                    description: 'Y-Axis'
                }),
                value: '2'
            },
            {
                text: formatMessage({
                    id: 'coconut.axisMenu.z',
                    default: 'Z-Axis',
                    description: 'Z-Axis'
                }),
                value: '3'
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
                                defaultValue: DirectionValues.FORWARD.value
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
                                defaultValue: DirectionValues.LEFT.value
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
                                defaultValue: DirectionValues.FORWARD.value
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
                                defaultValue: DirectionValues.LEFT.value
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED.value
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
                                defaultValue: DirectionValues.FORWARD.value
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            DEGREE: {
                                type: ArgumentType.STRING,
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED.value
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
                                defaultValue: DirectionValues.LEFT.value
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED.value
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED.value
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
                                defaultValue: NoteValues.NOTE_C.value
                            },
                            OCTAVE: {
                                type: ArgumentType.STRING,
                                menu: 'OctaveMenu',
                                defaultValue: '4'
                            },
                            SHARP: {
                                type: ArgumentType.STRING,
                                menu: 'SharpMenu',
                                defaultValue: SharpValues.NONE.value
                            },
                            BEAT: {
                                type: ArgumentType.STRING,
                                menu: 'BeatMenu',
                                defaultValue: BeatValues.HALF.value
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
                                defaultValue: BeatRestValues.HALF.value
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
                                defaultValue: NoteValues.NOTE_C.value
                            },
                            OCTAVE: {
                                type: ArgumentType.STRING,
                                menu: 'OctaveMenu',
                                defaultValue: '4'
                            },
                            SHARP: {
                                type: ArgumentType.STRING,
                                menu: 'SharpMenu',
                                defaultValue: SharpValues.NONE.value
                            },
                            BEAT: {
                                type: ArgumentType.STRING,
                                menu: 'BeatMenu',
                                defaultValue: BeatValues.HALF.value
                            },
                            DIRECTION_LRB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionLRBMenu',
                                defaultValue: DirectionValues.BOTH.value
                            },
                            LED_COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'LEDColorMenu',
                                defaultValue: LEDColorValues.RED.value
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
                                defaultValue: BeatValues.HALF.value
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
                                defaultValue: DirectionValues.LEFT.value
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            DETECT: {
                                type: ArgumentType.STRING,
                                menu: 'DetectMenu',
                                defaultValue: DetectValues.YES.value
                            }
                        }
                    },
                    {
                        opcode: 'getLineTracerDetectAll',
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
                                defaultValue: CommandValues.TURN_LEFT.value
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
                                defaultValue: DirectionValues.LEFT.value
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
                                defaultValue: DirectionValues.LEFT.value
                            },
                            DETECT: {
                                type: ArgumentType.STRING,
                                menu: 'DetectMenu',
                                defaultValue: DetectValues.YES.value
                            }
                        }
                    },
                    {
                        opcode: 'isDetectObstacleAll',
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
                                defaultValue: OnOffValues.ON.value
                            },
                            ROW: {
                                type: ArgumentType.STRING,
                                menu: 'RowMenu',
                                defaultValue: '1'
                            },
                            COL: {
                                type: ArgumentType.STRING,
                                menu: 'ColMenu',
                                defaultValue: '1'
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
                                type: ArgumentType.STRING,
                                menu: 'NumberMenu',
                                defaultValue: '1'
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
                                type: ArgumentType.STRING,
                                menu: 'SmallLetterMenu',
                                defaultValue: '0'
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
                                type: ArgumentType.STRING,
                                menu: 'CapitalLetterMenu',
                                defaultValue: '0'
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
                                type: ArgumentType.STRING,
                                menu: 'KRLetterMenu',
                                defaultValue: '0'
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
                                type: ArgumentType.STRING,
                                menu: 'AccAxisMenu',
                                defaultValue: '1'
                            }
                        }
                    }
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
                    }
                    // {
                    //     opcode: 'showCharacterDraw',
                    //     text: formatMessage({
                    //         id: 'coconut.hidden.showCharacterDraw',
                    //         default: 'LED Matrix Character [MATRIX]',
                    //         description: 'show character draw'
                    //     }),
                    //     blockType: BlockType.COMMAND,
                    //     arguments: {
                    //         MATRIX: {
                    //             type: ArgumentType.MATRIX,
                    //             defaultValue: '0101010101100010101000100'
                    //         }
                    //     }
                    // }
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
                    {
                        opcode: 'getExtIR',
                        text: formatMessage({
                            id: 'coconut.sensor.getExtIR',
                            default: 'external IR sensor [ANALOG_PIN]',
                            description: 'read IR sensor'
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
                    {
                        opcode: 'getExtCds',
                        text: formatMessage({
                            id: 'coconut.sensor.getExtCds',
                            default: 'external Cds sensor [ANALOG_PIN]',
                            description: 'read CDS sensor'
                        }),
                        blockType: BlockType.REPORTER,
                        arguments: {
                            ANALOG_PIN: {
                                type: ArgumentType.STRING,
                                menu: 'AnalogPinsMenu',
                                defaultValue: Pins.A2
                            }
                        }
                    }
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
        console.log(`turnMotor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        this._peripheral.turnMotor(Cast.toNumber(args.DIRECTION_LR));
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
        console.log(`moveGoTime :`);
        console.log(`args= ${JSON.stringify(args)}`);
        // console.log(`move ${args.DIRECTION_FB} for ${args.TIME_SEC} secs`);

        return this._peripheral.moveGoTime(Cast.toNumber(args.DIRECTION_FB), Cast.toNumber(args.TIME_SEC));
    }

    /**
     * Turn motor for the entered time
     * @param args
     * @returns {Promise<void>}
     */
    turnMotorTime (args) {
        console.log(`turnMotorTime :`);
        console.log(`args= ${JSON.stringify(args)}`);
        // console.log(`turn motor for times ${args.DIRECTION_LR} ${args.TIME_SEC} secs`);

        return this._peripheral.moveGoTime(Cast.toNumber(args.DIRECTION_LR), Cast.toNumber(args.TIME_SEC));
    }

    /**
     * Turn on RGB LED while rotating motor
     * @param args
     * @returns {Promise<void>}
     */
    moveMotorColor (args) {
        console.log(`moveMotorColor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.moveMotorColor(Cast.toNumber(args.DIRECTION_LR), Cast.toNumber(args.LED_COLOR));
    }

    /**
     * Move by the entered distance
     * @param args
     * @returns {Promise<void>}
     */
    moveGoCm (args) {
        console.log(`moveGoCm:`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.moveGoCm(Cast.toNumber(args.DIRECTION_FB), Cast.toNumber(args.N_CM));
    }

    /**
     * turn motor by the entered angle
     * @param args
     * @returns {Promise<void>}
     */
    turnMotorDegree (args) {
        console.log(`turnMotorDegree :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.turnMotorDegree(Cast.toNumber(args.DIRECTION_LR), Cast.toNumber(args.DEGREE));
    }

    /**
     * Turn on RGB LED
     * @param args
     */
    rgbOn (args) {
        console.log(`rgbOn :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOn(Cast.toNumber(args.DIRECTION_LRB), Cast.toNumber(args.LED_COLOR));
    }

    /**
     * turn off RGB LED
     * @param args
     * @returns {Promise<void>}
     */
    rgbOff (args) {
        console.log(`rgbOff :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOff(Cast.toNumber(args.DIRECTION_LRB));
    }

    /**
     * turn off RGB LED
     * @param args
     */
    rgbOffColor (args) {
        console.log(`rgbOffColor :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOffColor(Cast.toNumber(args.DIRECTION_LRB), Cast.toNumber(args.LED_COLOR));
    }

    /**
     *
     * @param args
     * @returns {Promise<void>}
     */
    rgbOnTime (args) {
        console.log(`rgbOnTime :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.rgbOnTime(
            Cast.toNumber(args.DIRECTION_LRB),
            Cast.toNumber(args.LED_COLOR),
            Cast.toNumber(args.TIME_SEC));
    }

    /**
     * buzzer on
     * @returns {Promise<void>}
     */
    beep () {
        console.log(`beep :`);

        return this._peripheral.beep();
    }

    /**
     * The buzzer sounds for the entered time.
     * @param args
     */
    playBuzzerTime (args) {
        console.log(`playBuzzerTime :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playBuzzerTime(Cast.toNumber(args.TIME_SEC));
    }

    /**
     * The buzzer sounds at the entered frequency for the entered time.
     * @param args
     */
    playBuzzerFreq (args) {
        console.log(`playBuzzerFreq :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playBuzzerFreq(
            Cast.toNumber(args.N_FREQUENCY),
            Cast.toNumber(args.TIME_SEC));
    }

    /**
     * buzzer off
     * @returns {Promise<void>}
     */
    buzzerOff () {
        console.log(`playBuzzerFreq :`);
        return this._peripheral.buzzerOff();
    }

    /**
     * play note
     * @param args
     */
    playNote (args) {
        console.log(`playNote :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playNote(
            Cast.toNumber(args.NOTE), Cast.toNumber(args.OCTAVE),
            Cast.toNumber(args.SHARP), Cast.toNumber(args.BEAT));
    }

    /**
     * rest beat
     * @param args
     */
    restBeat (args) {
	    console.log(`restBeat :`);
	    console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.restBeat(Cast.toNumber(args.BEAT_REST));
    }

    /**
     * play note with RGB LED
     * @param args
     * @returns {Promise<void>}
     */
    playNoteColor (args) {
	    console.log(`playNoteColor :`);
	    console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.playNoteColor(
            Cast.toNumber(args.NOTE), Cast.toNumber(args.OCTAVE),
            Cast.toNumber(args.SHARP), Cast.toNumber(args.BEAT),
            Cast.toNumber(args.DIRECTION_LRB), Cast.toNumber(args.LED_COLOR));
    }

    /**
     * change beat
     * @param args
     */
    changeBeat (args) {
        console.log(`changeBeat :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.changeBeat(Cast.toNumber(args.BEAT_CHANGE));
    }

    /**
     * read line tracer (left or right)
     * @param args
     */
    getLineTracer (args) {
        console.log(`getLineTracer :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getLineTracer(Cast.toNumber(args.DIRECTION_LR));
    }

    /**
     * line tracer detection check
     * @param args
     */
    isLineDetected (args) {
        console.log(`isLineDetected :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.isLineDetected(
            Cast.toNumber(args.DIRECTION_LRB), Cast.toNumber(args.DETECT));
    }

    /**
     * get line tracers decetion
     */
    getLineTracerDetectAll () {
        console.log(`getLineTracersDetect :`);

        return this._peripheral.getLineTracerDetectAll();
    }

    /**
     * run command until line-tracer detect black line
     * @param args
     * @returns {Promise<void>}
     */
    lineTracerCmd (args) {
        console.log(`lineTracerCmd :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.lineTracerCmd(Cast.toNumber(args.COMMAND));
    }

    /**
     * read IR Distance sensor
     * @param args
     * @returns {Promise<void>}
     */
    getDistance (args) {
        console.log(`getDistance :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getDistance(Cast.toNumber(args.DIRECTION_LR));
    }

    /**
     * IR distacne sensor detecting check
     * @param args
     */
    isDetectObstacle (args) {
        console.log(`isDetectObstacle :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.isDetectObstacle(
            Cast.toNumber(args.DIRECTION_LRB), Cast.toNumber(args.DETECT));
    }

    /**
     * IR distance sensor detecting check (all sensors)
     * @returns {Promise<void>}
     */
    isDetectObstacleAll () {
        console.log(`isDetectObstacleAll :`);

        return this._peripheral.isDetectObstacleAll();
    }

    /**
     * led matrix on
     * @param args
     */
    ledMatrixOn (args) {
        console.log(`ledMatrixOn :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.ledMatrixOn(
            Cast.toNumber(args.ON_OFF),
            Cast.toNumber(args.ROW), Cast.toNumber(args.COL));
    }

    /**
     * turn on all LED Matrix
     */
    ledMatrixOnAll () {
        console.log(`ledMatrixOnAll :`);
        return this._peripheral.ledMatrixOnAll();
    }

    /**
     * LED Matrix clear all
     */
    ledMatrixClear () {
        console.log(`ledMatrixClear :`);
        return this._peripheral.ledMatrixClear();
    }

    /**
     * show number on LED Matrix
     * @param args
     */
    showLedMatrixNumber (args) {
        console.log(`showLedMatrixNumber :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixNumber(Cast.toNumber(args.NUMBER));
    }

    /**
     * show english small letter
     * @param args
     * @returns {Promise<void>}
     */
    showLedMatrixSmall (args) {
        console.log(`showLedMatrixSmall :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixSmall(
            Cast.toNumber(args.SMALL_LETTER));
    }

    /**
     * show english capital letter
     * @param args
     * @returns {Promise<void>}
     */
    showLedMatrixCapital (args) {
        console.log(`showLedMatrixCapital :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixCapital(
            Cast.toNumber(args.CAPITAL_LETTER));
    }

    /**
     * show korean letter on LED matrix
     * @param args
     * @returns {Promise<void>}
     */
    showLedMatrixKorean (args) {
        console.log(`showLedMatrixKorean :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.showLedMatrixKorean(
            Cast.toNumber(args.KR_LETTER));
    }

    /**
     * read light sensor
     */
    getLightSensor () {
        console.log(`getLightSensor :`);
        return this._peripheral.getLightSensor();
    }

    /**
     * read temperature sensor
     */
    getTemperature () {
        console.log(`getTemperature :`);
        return this._peripheral.getTemperature();
    }

    /**
     * read 3-Axis Accelerometer
     * @param args
     * @returns {Promise<void>}
     */
    getAccelerometer (args) {
        console.log(`getAccelerometer :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getAccelerometer(Cast.toNumber(args.ACC_AXIS));
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
     * read external IR sensor
     * @param args
     * @returns {Promise<unknown>}
     */
    getExtIR (args) {
        console.log(`getExtIR :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getExtIR(Cast.toNumber(args.ANALOG_PIN));
    }

    /**
     * read external CDS sensor
     * @param args
     * @returns {*}
     */
    getExtCds (args) {
        console.log(`getExtCds :`);
        console.log(`args= ${JSON.stringify(args)}`);

        return this._peripheral.getExtCds(Cast.toNumber(args.ANALOG_PIN));
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
