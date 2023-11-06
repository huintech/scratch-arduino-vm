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
 * Note values
 * @type {{}}
 */
const NoteValues = {
    NOTE_C: "NOTE_C", NOTE_D: "NOTE_D", NOTE_E: "NOTE_E",
    NOTE_F: "NOTE_F", NOTE_G: "NOTE_G", NOTE_A: "NOTE_A", NOTE_B: "NOTE_B"
};

const SharpValues = { NONE: '-', SHARP: '#', FLAT: 'b' };

/**
 * beat values
 * @type {{QUATER: string, HALF: string, DOT_QUATER: string, DOT_8TH: string, DOT_HALF: string, DOT_16TH: string, THIRTYH_2ND: string, WHOLE: string, EIGHTH: string, SIXTEENTH: string, DOT_32ND: string}}
 */
const BeatValues = {
    HALF: 'Half', QUATER: 'Quater', EIGHTH: 'Eighth', SIXTEENTH: 'Sixteenth',
    THIRTYH_2ND: 'Thirty-second', WHOLE: 'Whole',
    DOT_HALF: 'Dotted half', DOT_QUATER: 'Dotted quarter',
    DOT_8TH: 'Dotted eighth', DOT_16TH: 'Dotted sixteenth',
    DOT_32ND: 'Dotted thirty-second', ORIGINAL: 'original'
}

/**
 * rest beat values
 * @type {{QUATER: string, HALF: string, WHOLE: string, EIGHTH: string, SIXTEENTH: string}}
 */
const BeatRestValues = {
    HALF: "Half_rest", QUATER: "Quater_rest", EIGHTH: "Eighth_rest",
    SIXTEENTH: "Sixteenth_rest", WHOLE: "Whole_rest"
};

/**
 * detect values
 * @type {{}}
 */
const DetectValues = { YES: 'Yes', NO: 'No' };

/**
 * line tracer command
 * @type {{LEFT: string, RIGHT: string}}
 */
const CommandValues = { LEFT: 'Turn left', RIGHT: 'Turn right' };

/**
 * on off values
 * @type {{OFF: string, ON: string}}
 */
const OnOffValues = { ON: 'On', OFF: 'Off' };

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
    get DIRECTION_LRB_MENU () {
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

    /**
     * NOTE menu
     * @constructor
     */
    get NOTE_MENU () {
        return [
            {
                text: formatMessage({
                    id: 'coconut.note_c',
                    default: 'NOTE_C',
                    description: 'note c'
                }),
                value: NoteValues.NOTE_C
            },
            {
                text: formatMessage({
                    id: 'coconut.note_d',
                    default: 'NOTE_D',
                    description: 'note d'
                }),
                value: NoteValues.NOTE_D
            },
            {
                text: formatMessage({
                    id: 'coconut.note_e',
                    default: 'NOTE_E',
                    description: 'note e'
                }),
                value: NoteValues.NOTE_E
            },
            {
                text: formatMessage({
                    id: 'coconut.note_f',
                    default: 'NOTE_F',
                    description: 'note F'
                }),
                value: NoteValues.NOTE_F
            },
            {
                text: formatMessage({
                    id: 'coconut.note_g',
                    default: 'NOTE_G',
                    description: 'note G'
                }),
                value: NoteValues.NOTE_G
            },
            {
                text: formatMessage({
                    id: 'coconut.note_a',
                    default: 'NOTE_A',
                    description: 'note a'
                }),
                value: NoteValues.NOTE_A
            },
            {
                text: formatMessage({
                    id: 'coconut.note_b',
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
                    id: 'coconut.normal_note',
                    default: '-',
                    description: 'normal none'
                }),
                value: SharpValues.NONE
            },
            {
                text: formatMessage({
                    id: 'coconut.sharp_note',
                    default: '#',
                    description: 'sharp note'
                }),
                value: SharpValues.SHARP
            },
            {
                text: formatMessage({
                    id: 'coconut.flat_note',
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
                    id: 'coconut.beat_half',
                    default: BeatValues.HALF,
                    description: 'half beat'
                }),
                value: BeatValues.HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_quater',
                    default: BeatValues.QUATER,
                    description: 'quater beat'
                }),
                value: BeatValues.QUATER
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_8th',
                    default: BeatValues.EIGHTH,
                    description: 'Eighth beat'
                }),
                value: BeatValues.EIGHTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_16th',
                    default: BeatValues.SIXTEENTH,
                    description: 'Sixteenth beat'
                }),
                value: BeatValues.SIXTEENTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_32nd',
                    default: BeatValues.THIRTY_2ND,
                    description: 'Thirty-second beat'
                }),
                value: BeatValues.THIRTY_2ND
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_whole',
                    default: BeatValues.WHOLE,
                    description: 'Whole beat'
                }),
                value: BeatValues.WHOLE
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_half',
                    default: BeatValues.DOT_HALF,
                    description: 'Dotted half beat'
                }),
                value: BeatValues.DOT_HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_quarter',
                    default: BeatValues.DOT_QUATER,
                    description: 'Dotted quarter beat'
                }),
                value: BeatValues.DOT_QUATER
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_8th',
                    default: BeatValues.DOT_8TH,
                    description: 'Dotted eighth beat'
                }),
                value: BeatValues.DOT_8TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_16th',
                    default: BeatValues.DOT_16TH,
                    description: 'Dotted sixteenth beat'
                }),
                value: BeatValues.DOT_16TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_32th',
                    default: BeatValues.DOT_32ND,
                    description: 'Dotted thirty-second beat'
                }),
                value: BeatValues.DOT_32ND
            },
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
                    id: 'coconut.beat_half_rest',
                    default: BeatRestValues.HALF,
                    description: 'half rest beat'
                }),
                value: BeatRestValues.HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_quater_rest',
                    default: BeatRestValues.QUATER,
                    description: 'quater rest beat'
                }),
                value: BeatRestValues.QUATER
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_8th_rest',
                    default: BeatRestValues.EIGHTH,
                    description: 'eighth rest beat'
                }),
                value: BeatRestValues.EIGHTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_16th_rest',
                    default: BeatRestValues.SIXTEENTH,
                    description: 'sixteenth rest beat'
                }),
                value: BeatRestValues.SIXTEENTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_whole_rest',
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
                    id: 'coconut.beat_half',
                    default: BeatValues.HALF,
                    description: 'half beat'
                }),
                value: BeatValues.HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_quater',
                    default: BeatValues.QUATER,
                    description: 'quater beat'
                }),
                value: BeatValues.QUATER
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_8th',
                    default: BeatValues.EIGHTH,
                    description: 'Eighth beat'
                }),
                value: BeatValues.EIGHTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_16th',
                    default: BeatValues.SIXTEENTH,
                    description: 'Sixteenth beat'
                }),
                value: BeatValues.SIXTEENTH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_32nd',
                    default: BeatValues.THIRTY_2ND,
                    description: 'Thirty-second beat'
                }),
                value: BeatValues.THIRTY_2ND
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_whole',
                    default: BeatValues.WHOLE,
                    description: 'Whole beat'
                }),
                value: BeatValues.WHOLE
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_half',
                    default: BeatValues.DOT_HALF,
                    description: 'Dotted half beat'
                }),
                value: BeatValues.DOT_HALF
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_quarter',
                    default: BeatValues.DOT_QUATER,
                    description: 'Dotted quarter beat'
                }),
                value: BeatValues.DOT_QUATER
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_8th',
                    default: BeatValues.DOT_8TH,
                    description: 'Dotted eighth beat'
                }),
                value: BeatValues.DOT_8TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_16th',
                    default: BeatValues.DOT_16TH,
                    description: 'Dotted sixteenth beat'
                }),
                value: BeatValues.DOT_16TH
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_dot_32th',
                    default: BeatValues.DOT_32ND,
                    description: 'Dotted thirty-second beat'
                }),
                value: BeatValues.DOT_32ND
            },
            {
                text: formatMessage({
                    id: 'coconut.beat_original',
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
                    id: 'coconut.detect_yes',
                    default: DetectValues.YES,
                    description: 'detected'
                }),
                value: DetectValues.YES
            },
            {
                text: formatMessage({
                    id: 'coconut.detect_no',
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
                    id: 'coconut.command_left',
                    default: CommandValues.LEFT,
                    description: 'turn left'
                }),
                value: CommandValues.LEFT
            },
            {
                text: formatMessage({
                    id: 'coconut.command_right',
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
                    id: 'coconut.on',
                    default: OnOffValues.ON,
                    description: 'turn on'
                }),
                value: OnOffValues.ON
            },
            {
                text: formatMessage({
                    id: 'coconut.off',
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
                                type: ArgumentType.ANGLE,
                                menu: 'DegreeMenu',
                                defaultValue: '90'
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'rgbOns',
                        text: formatMessage({
                            id: 'coconut.rgbOns',
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
                        opcode: 'rgbOffs',
                        text: formatMessage({
                            id: 'coconut.rgbOffs',
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
                        opcode: 'rgbOffColors',
                        text: formatMessage({
                            id: 'coconut.rgbOffColors',
                            default: 'turn off RGB [DIRECTION_LRB] [LED_COLOR]',
                            description: 'Turn off RGB LED '
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
                        opcode: 'rgbOnTimes',
                        text: formatMessage({
                            id: 'coconut.rgbOnTimes',
                            default: 'turn on RGB [DIRECTION_LRB] [LED_COLOR] for [TIME_SEC] second(s)',
                            description: 'Turn off RGB LED '
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
                        opcode: 'beeps',
                        text: formatMessage({
                            id: 'coconut.beeps',
                            default: 'buzzer on',
                            description: 'buzzer on'
                        }),
                        blockType: BlockType.COMMAND,
                    },
                    {
                        opcode: 'playBuzzerTimes',
                        text: formatMessage({
                            id: 'coconut.playBuzzerTimes',
                            default: 'play buzzer for [TIME_SEC] second(s)',
                            description: 'buzzer on for some seconds'
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
                        opcode: 'playBuzzerFreqs',
                        text: formatMessage({
                            id: 'coconut.playBuzzerFreqs',
                            default: 'play buzzer on frequency [N_FREQUENCY] Hz for [TIME_SEC] second(s)',
                            description: 'buzzer on frequency for some seconds'
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
                        blockType: BlockType.COMMAND,
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
                            default: 'play buzzer on note [NOTE] octave [OCTAVE] [SHARP] beat [BEAT] RGB [DIRECTION_RGB] [LED_COLOR]',
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
                            DIRECTION_RGB: {
                                type: ArgumentType.STRING,
                                menu: 'DirectionRGBMenu',
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
                        opcode: 'getLineTracers',
                        text: formatMessage({
                            id: 'coconut.getLineTracers',
                            default: 'line tracer detection',
                            description: 'line trace detection result'
                        }),
                        blockType: BlockType.REPORTER,
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
                        arguments: { }
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
                        blockType: BlockType.COMMAND,
                    },
                    {
                        opcode: 'ledMatrixClear',
                        text: formatMessage({
                            id: 'coconut.ledMatrixClear',
                            default: 'LED Matrix clear all',
                            description: 'LED Matrix clear all'
                        }),
                        blockType: BlockType.COMMAND,
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

    /**
     *
     * @param args
     * @returns {Promise<void>}
     */
    rgbOnTimes (args) {
        console.log(`turn off ${args.DIRECTION_RGB} RGB LED ${args.LED_COLOR} ${args.TIME_SEC} secs`);

        this._peripheral.coconutRGBOnTimes(args.DIRECTION_RGB, args.LED_COLOR, args.TIME_SEC);
        return Promise.resolve();
    }

    /**
     * buzzer on
     * @returns {Promise<void>}
     */
    beeps () {
        this._peripheral.coconutBeeps();
        return Promise.resolve();
    }

    /**
     * buzzer on for some seconds
     * @param args
     */
    playBuzzerTimes (args) {
        // console.log(`turn off ${args.DIRECTION_RGB} RGB LED ${args.LED_COLOR} ${args.TIME_SEC} secs`);

        this._peripheral.coconutPlayBuzzerTimes(args.TIME_SEC);
        return Promise.resolve();
    }

    /**
     * buzzer on frequency for some seconds
     * @param args
     */
    playBuzzerFreqs (args) {
        console.log(`buzzer on freq ${args.N_FREQUENCY} Hz  ${args.TIME_SEC} secs`);

        this._peripheral.coconutPlayBuzzerFreqs(args.N_FREQUENCY, args.TIME_SEC);
        return Promise.resolve();
    }

    /**
     * buzzer off
     * @returns {Promise<void>}
     */
    buzzerOff () {
        this._peripheral.coconutBuzzerOff();
        return Promise.resolve();
    }

    /**
     * play note
     * @param args
     */
    playNote (args) {
        this._peripheral.coconutPlayNote(args.NOTE, args.OCTAVE, args.SHARP, args.BEAT);
        return Promise.resolve();
    }

    /**
     * rest beat
     * @param args
     */
    restBeat (args) {
        this._peripheral.coconutRestBeat(args.BEAT_REST);
        return Promise.resolve();
    }

    /**
     * play note with RGB LED
     * @param args
     * @returns {Promise<void>}
     */
    playNoteColor (args) {
        this._peripheral.coconutPlayNoteColor(args.NOTE, args.OCTAVE, args.SHARP, args.BEAT, args.DIRECTION_RGB, args.LED_COLOR);
        return Promise.resolve();
    }

    /**
     * change beat
     * @param args
     */
    changeBeat (args) {
        this._peripheral.coconutChangeBeat(args.BEAT_CHANGE);
        return Promise.resolve();
    }

    /**
     * read line tracer (left or right)
     * @param args
     */
    getLineTracer (args) {
        this._peripheral.coconutGetLineTracer(args.DIRECTION_LR);
        return Promise.resolve();
    }

    /**
     * line tracer detection check
     * @param args
     */
    isLineDetected (args) {
        this._peripheral.coconutIsLineDetected(args.DIRECTION_LRB, args.DETECT);
        return Promise.resolve();
    }

    /**
     * get line tracers decetion
     */
    getLineTracers () {
        this._peripheral.coconutGetLineTracers();
        return Promise.resolve();
    }

    /**
     * run command until line-tracer detect black line
     * @param args
     * @returns {Promise<void>}
     */
    lineTracerCmd (args) {
        this._peripheral.coconutLineTracerCmd(args.COMMAND);
        return Promise.resolve();
    }

    /**
     * read IR Distance sensor
     * @param args
     * @returns {Promise<void>}
     */
    getDistance (args) {
        this._peripheral.coconutGetDistance(args.DIRECTION_LR);
        return Promise.resolve();
    }

    /**
     * IR distacne sensor detecting check
     * @param args
     */
    isDetectObstacle (args) {
        this._peripheral.coconutIsDetectObstacle(args.DIRECTION_LRB, args.DETECT);
        return Promise.resolve();
    }

    /**
     * IR distance sensor detecting check (all sensors)
     * @returns {Promise<void>}
     */
    isDetectObstacles () {
        this._peripheral.coconutIsDetectObstacles();
        return Promise.resolve();
    }

    /**
     * led matrix on
     * @param args
     */
    ledMatrixOn (args) {
        this._peripheral.coconutLedMatrixOn(args.ON_OFF, args.ROW, args.COL);
        return Promise.resolve();
    }

    /**
     * turn on all LED Matrix
     */
    ledMatrixOnAll () {
        this._peripheral.coconutLedMatrixOnAll();
        return Promise.resolve();
    }

    /**
     * LED Matrix clear all
     */
    ledMatrixClear () {
        this._peripheral.coconutLedMatrixClear();
        return Promise.resolve();
    }

    /**
     * show number on LED Matrix
     * @param args
     */
    showLedMatrixNumber (args) {
        this._peripheral.showLedMatrixNumber(args.NUMBER);
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
