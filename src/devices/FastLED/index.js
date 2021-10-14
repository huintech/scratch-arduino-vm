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

const Colors = {
    AliceBlue: 'AliceBlue',
    Amethyst: 'Amethyst',
    AntiqueWhite: 'AntiqueWhite',
    Aqua: 'Aqua',
    Aquamarine: 'Aquamarine',
    Azure: 'Azure',
    Beige: 'Beige',
    Bisque: 'Bisque',
    Black: 'Black',
    BlanchedAlmond: 'BlanchedAlmond',
    Blue: 'Blue',
    BlueViolet: 'BlueViolet',
    Brown: 'Brown',
    BurlyWood: 'BurlyWood',
    CadetBlue: 'CadetBlue',
    Chartreuse: 'Chartreuse',
    Chocolate: 'Chocolate',
    Coral: 'Coral',
    CornflowerBlue: 'CornflowerBlue',
    Cornsilk: 'Cornsilk',
    Crimson: 'Crimson',
    Cyan: 'Cyan',
    DarkBlue: 'DarkBlue',
    DarkCyan: 'DarkCyan',
    DarkGoldenrod: 'DarkGoldenrod',
    DarkGray: 'DarkGray',
    DarkGreen: 'DarkGreen',
    DarkKhaki: 'DarkKhaki',
    DarkMagenta: 'DarkMagenta',
    DarkOliveGreen: 'DarkOliveGreen',
    DarkOrange: 'DarkOrange',
    DarkOrchid: 'DarkOrchid',
    DarkRed: 'DarkRed',
    DarkSalmon: 'DarkSalmon',
    DarkSeaGreen: 'DarkSeaGreen',
    DarkSlateBlue: 'DarkSlateBlue',
    DarkSlateGray: 'DarkSlateGray',
    DarkTurquoise: 'DarkTurquoise',
    DarkViolet: 'DarkViolet',
    DeepPink: 'DeepPink',
    DeepSkyBlue: 'DeepSkyBlue',
    DimGray: 'DimGray',
    DodgerBlue: 'DodgerBlue',
    FireBrick: 'FireBrick',
    FloralWhite: 'FloralWhite',
    ForestGreen: 'ForestGreen',
    Fuchsia: 'Fuchsia',
    Gainsboro: 'Gainsboro',
    GhostWhite: 'GhostWhite',
    Gold: 'Gold',
    Goldenrod: 'Goldenrod',
    Gray: 'Gray',
    Green: 'Green',
    GreenYellow: 'GreenYellow',
    Honeydew: 'Honeydew',
    HotPink: 'HotPink',
    IndianRed: 'IndianRed',
    Indigo: 'Indigo',
    Ivory: 'Ivory',
    Khaki: 'Khaki',
    Lavender: 'Lavender',
    LavenderBlush: 'LavenderBlush',
    LawnGreen: 'LawnGreen',
    LemonChiffon: 'LemonChiffon',
    LightBlue: 'LightBlue',
    LightCoral: 'LightCoral',
    LightCyan: 'LightCyan',
    LightGoldenrodYellow: 'LightGoldenrodYellow',
    LightGreen: 'LightGreen',
    LightGrey: 'LightGrey',
    LightPink: 'LightPink',
    LightSalmon: 'LightSalmon',
    LightSeaGreen: 'LightSeaGreen',
    LightSkyBlue: 'LightSkyBlue',
    LightSlateGray: 'LightSlateGray',
    LightSteelBlue: 'LightSteelBlue',
    LightYellow: 'LightYellow',
    Lime: 'Lime',
    LimeGreen: 'LimeGreen',
    Linen: 'Linen',
    Magenta: 'Magenta',
    Maroon: 'Maroon',
    MediumAquamarine: 'MediumAquamarine',
    MediumBlue: 'MediumBlue',
    MediumOrchid: 'MediumOrchid',
    MediumPurple: 'MediumPurple',
    MediumSeaGreen: 'MediumSeaGreen',
    MediumSlateBlue: 'MediumSlateBlue',
    MediumSpringGreen: 'MediumSpringGreen',
    MediumTurquoise: 'MediumTurquoise',
    MediumVioletRed: 'MediumVioletRed',
    MidnightBlue: 'MidnightBlue',
    MintCream: 'MintCream',
    MistyRose: 'MistyRose',
    Moccasin: 'Moccasin',
    NavajoWhite: 'NavajoWhite',
    Navy: 'Navy',
    OldLace: 'OldLace',
    Olive: 'Olive',
    OliveDrab: 'OliveDrab',
    Orange: 'Orange',
    OrangeRed: 'OrangeRed',
    Orchid: 'Orchid',
    PaleGoldenrod: 'PaleGoldenrod',
    PaleGreen: 'PaleGreen',
    PaleTurquoise: 'PaleTurquoise',
    PaleVioletRed: 'PaleVioletRed',
    PapayaWhip: 'PapayaWhip',
    PeachPuff: 'PeachPuff',
    Peru: 'Peru',
    Pink: 'Pink',
    Plaid: 'Plaid',
    Plum: 'Plum',
    PowderBlue: 'PowderBlue',
    Purple: 'Purple',
    Red: 'Red',
    RosyBrown: 'RosyBrown',
    RoyalBlue: 'RoyalBlue',
    SaddleBrown: 'SaddleBrown',
    Salmon: 'Salmon',
    SandyBrown: 'SandyBrown',
    SeaGreen: 'SeaGreen',
    Seashell: 'Seashell',
    Sienna: 'Sienna',
    Silver: 'Silver',
    SkyBlue: 'SkyBlue',
    SlateBlue: 'SlateBlue',
    SlateGray: 'SlateGray',
    Snow: 'Snow',
    SpringGreen: 'SpringGreen',
    SteelBlue: 'SteelBlue',
    Tan: 'Tan',
    Teal: 'Teal',
    Thistle: 'Thistle',
    Tomato: 'Tomato',
    Turquoise: 'Turquoise',
    Violet: 'Violet',
    Wheat: 'Wheat',
    White: 'White',
    WhiteSmoke: 'WhiteSmoke',
    Yellow: 'Yellow',
    YellowGreen: 'YellowGreen'    
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
class ArduinoFastLEDDevice {
    /**
     * @return {string} - the ID of this extension.
     */
    static get DEVICE_ID () {
        return 'FastLED';
    }

    get COLORS_MENU () {
        return [
            {
                text: '1. AliceBlue',
                value: Colors.AliceBlue   
            },
            {
                text: '2. Amethyst',
                value: Colors.Amethyst    
            },
            {
                text: '3. AntiqueWhite',
                value: Colors.AntiqueWhite
            },
            {
                text: '4. Aqua',
                value: Colors.Aqua        
            },
            {
                text: '5. Aquamarine',
                value: Colors.Aquamarine  
            },
            {
                text: '6. Azure',
                value: Colors.Azure
            },
            {
                text: '7. Beige',
                value: Colors.Beige
            },
            {
                text: '8. Bisque',
                value: Colors.Bisque
            },
            {
                text: '9. Black',
                value: Colors.Black
            },
            {
                text: '10. BlanchedAlmond',
                value: Colors.BlanchedAlmond
            },
            {
                text: '11. Blue',
                value: Colors.Blue
            },
            {
                text: '12. BlueViolet',
                value: Colors.BlueViolet
            },
            {
                text: '13. Brown',
                value: Colors.Brown
            },
            {
                text: '14. BurlyWood',
                value: Colors.BurlyWood
            },
            {
                text: '15. CadetBlue',
                value: Colors.CadetBlue
            },
            {
                text: '16. Chartreuse',
                value: Colors.Chartreuse
            },
            {
                text: '17. Chocolate',
                value: Colors.Chocolate
            },
            {
                text: '18. Coral',
                value: Colors.Coral
            },
            {
                text: '19. CornflowerBlue',
                value: Colors.CornflowerBlue
            },
            {
                text: '20. Cornsilk',
                value: Colors.Cornsilk
            },
            {
                text: '21. Crimson',
                value: Colors.Crimson
            },
            {
                text: '22. Cyan',
                value: Colors.Cyan
            },
            {
                text: '23. DarkBlue',
                value: Colors.DarkBlue
            },
            {
                text: '24. DarkCyan',
                value: Colors.DarkCyan
            },
            {
                text: '25. DarkGoldenrod',
                value: Colors.DarkGoldenrod
            },
            {
                text: '26. DarkGray',
                value: Colors.DarkGray
            },
            {
                text: '27. DarkGreen',
                value: Colors.DarkGreen
            },
            {
                text: '28. DarkKhaki',
                value: Colors.DarkKhaki
            },
            {
                text: '29. DarkMagenta',
                value: Colors.DarkMagenta
            },
            {
                text: '30. DarkOliveGreen',
                value: Colors.DarkOliveGreen
            },
            {
                text: '31. DarkOrange',
                value: Colors.DarkOrange
            },
            {
                text: '32. DarkOrchid',
                value: Colors.DarkOrchid
            },
            {
                text: '33. DarkRed',
                value: Colors.DarkRed
            },
            {
                text: '34. DarkSalmon',
                value: Colors.DarkSalmon
            },
            {
                text: '35. DarkSeaGreen',
                value: Colors.DarkSeaGreen
            },
            {
                text: '36. DarkSlateBlue',
                value: Colors.DarkSlateBlue
            },
            {
                text: '37. DarkSlateGray',
                value: Colors.DarkSlateGray
            },
            {
                text: '38. DarkTurquoise',
                value: Colors.DarkTurquoise
            },
            {
                text: '39. DarkViolet',
                value: Colors.DarkViolet
            },
            {
                text: '40. DeepPink',
                value: Colors.DeepPink
            },
            {
                text: '41. DeepSkyBlue',
                value: Colors.DeepSkyBlue
            },
            {
                text: '42. DimGray',
                value: Colors.DimGray
            },
            {
                text: '43. DodgerBlue',
                value: Colors.DodgerBlue
            },
            {
                text: '44. FireBrick',
                value: Colors.FireBrick
            },
            {
                text: '45. FloralWhite',
                value: Colors.FloralWhite
            },
            {
                text: '46. ForestGreen',
                value: Colors.ForestGreen
            },
            {
                text: '47. Fuchsia',
                value: Colors.Fuchsia
            },
            {
                text: '48. Gainsboro',
                value: Colors.Gainsboro
            },
            {
                text: '49. GhostWhite',
                value: Colors.GhostWhite
            },
            {
                text: '50. Gold',
                value: Colors.Gold
            },
            {
                text: '51. Goldenrod',
                value: Colors.Goldenrod
            },
            {
                text: '52. Gray',
                value: Colors.Gray
            },
            {
                text: '53. Green',
                value: Colors.Green
            },
            {
                text: '54. GreenYellow',
                value: Colors.GreenYellow
            },
            {
                text: '55. Honeydew',
                value: Colors.Honeydew
            },
            {
                text: '56. HotPink',
                value: Colors.HotPink
            },
            {
                text: '57. IndianRed',
                value: Colors.IndianRed
            },
            {
                text: '58. Indigo',
                value: Colors.Indigo
            },
            {
                text: '59. Ivory',
                value: Colors.Ivory
            },
            {
                text: '60. Khaki',
                value: Colors.Khaki
            },
            {
                text: '61. Lavender',
                value: Colors.Lavender
            },
            {
                text: '62. LavenderBlush',
                value: Colors.LavenderBlush
            },
            {
                text: '63. LawnGreen',
                value: Colors.LawnGreen
            },
            {
                text: '64. LemonChiffon',
                value: Colors.LemonChiffon
            },
            {
                text: '65. LightBlue',
                value: Colors.LightBlue
            },
            {
                text: '66. LightCoral',
                value: Colors.LightCoral
            },
            {
                text: '67. LightCyan',
                value: Colors.LightCyan
            },
            {
                text: '68. LightGoldenrodYellow',
                value: Colors.LightGoldenrodYellow
            },
            {
                text: '69. LightGreen',
                value: Colors.LightGreen
            },
            {
                text: '70. LightGrey',
                value: Colors.LightGrey
            },
            {
                text: '71. LightPink',
                value: Colors.LightPink
            },
            {
                text: '72. LightSalmon',
                value: Colors.LightSalmon
            },
            {
                text: '73. LightSeaGreen',
                value: Colors.LightSeaGreen
            },
            {
                text: '74. LightSkyBlue',
                value: Colors.LightSkyBlue
            },
            {
                text: '75. LightSlateGray',
                value: Colors.LightSlateGray
            },
            {
                text: '76. LightSteelBlue',
                value: Colors.LightSteelBlue
            },
            {
                text: '77. LightYellow',
                value: Colors.LightYellow
            },
            {
                text: '78. Lime',
                value: Colors.Lime
            },
            {
                text: '79. LimeGreen',
                value: Colors.LimeGreen
            },
            {
                text: '80. Linen',
                value: Colors.Linen
            },
            {
                text: '81. Magenta',
                value: Colors.Magenta
            },
            {
                text: '82. Maroon',
                value: Colors.Maroon
            },
            {
                text: '83. MediumAquamarine',
                value: Colors.MediumAquamarine
            },
            {
                text: '84. MediumBlue',
                value: Colors.MediumBlue
            },
            {
                text: '85. MediumOrchid',
                value: Colors.MediumOrchid
            },
            {
                text: '86. MediumPurple',
                value: Colors.MediumPurple
            },
            {
                text: '87. MediumSeaGreen',
                value: Colors.MediumSeaGreen
            },
            {
                text: '88. MediumSlateBlue',
                value: Colors.MediumSlateBlue
            },
            {
                text: '89. MediumSpringGreen',
                value: Colors.MediumSpringGreen
            },
            {
                text: '90. MediumTurquoise',
                value: Colors.MediumTurquoise
            },
            {
                text: '91. MediumVioletRed',
                value: Colors.MediumVioletRed
            },
            {
                text: '92. MidnightBlue',
                value: Colors.MidnightBlue
            },
            {
                text: '93. MintCream',
                value: Colors.MintCream
            },
            {
                text: '94. MistyRose',
                value: Colors.MistyRose
            },
            {
                text: '95. Moccasin',
                value: Colors.Moccasin
            },
            {
                text: '96. NavajoWhite',
                value: Colors.NavajoWhite
            },
            {
                text: '97. Navy',
                value: Colors.Navy
            },
            {
                text: '98. OldLace',
                value: Colors.OldLace
            },
            {
                text: '99. Olive',
                value: Colors.Olive
            },
            {
                text: '100. OliveDrab',
                value: Colors.OliveDrab
            },
            {
                text: '101. Orange',
                value: Colors.Orange
            },
            {
                text: '102. OrangeRed',
                value: Colors.OrangeRed
            },
            {
                text: '103. Orchid',
                value: Colors.Orchid
            },
            {
                text: '104. PaleGoldenrod',
                value: Colors.PaleGoldenrod
            },
            {
                text: '105. PaleGreen',
                value: Colors.PaleGreen
            },
            {
                text: '106. PaleTurquoise',
                value: Colors.PaleTurquoise
            },
            {
                text: '107. PaleVioletRed',
                value: Colors.PaleVioletRed
            },
            {
                text: '108. PapayaWhip',
                value: Colors.PapayaWhip
            },
            {
                text: '109. PeachPuff',
                value: Colors.PeachPuff
            },
            {
                text: '110. Peru',
                value: Colors.Peru
            },
            {
                text: '111. Pink',
                value: Colors.Pink
            },
            {
                text: '112. Plaid',
                value: Colors.Plaid
            },
            {
                text: '113. Plum',
                value: Colors.Plum
            },
            {
                text: '114. PowderBlue',
                value: Colors.PowderBlue
            },
            {
                text: '115. Purple',
                value: Colors.Purple
            },
            {
                text: '116. Red',
                value: Colors.Red
            },
            {
                text: '117. RosyBrown',
                value: Colors.RosyBrown
            },
            {
                text: '118. RoyalBlue',
                value: Colors.RoyalBlue
            },
            {
                text: '119. SaddleBrown',
                value: Colors.SaddleBrown
            },
            {
                text: '120. Salmon',
                value: Colors.Salmon
            },
            {
                text: '121. SandyBrown',
                value: Colors.SandyBrown
            },
            {
                text: '122. SeaGreen',
                value: Colors.SeaGreen
            },
            {
                text: '123. Seashell',
                value: Colors.Seashell
            },
            {
                text: '124. Sienna',
                value: Colors.Sienna
            },
            {
                text: '125. Silver',
                value: Colors.Silver
            },
            {
                text: '126. SkyBlue',
                value: Colors.SkyBlue
            },
            {
                text: '127. SlateBlue',
                value: Colors.SlateBlue
            },
            {
                text: '128. SlateGray',
                value: Colors.SlateGray
            },
            {
                text: '129. Snow',
                value: Colors.Snow
            },
            {
                text: '130. SpringGreen',
                value: Colors.SpringGreen
            },
            {
                text: '131. SteelBlue',
                value: Colors.SteelBlue
            },
            {
                text: '132. Tan',
                value: Colors.Tan
            },
            {
                text: '133. Teal',
                value: Colors.Teal
            },
            {
                text: '134. Thistle',
                value: Colors.Thistle
            },
            {
                text: '135. Tomato',
                value: Colors.Tomato
            },
            {
                text: '136. Turquoise',
                value: Colors.Turquoise
            },
            {
                text: '137. Violet',
                value: Colors.Violet
            },
            {
                text: '138. Wheat',
                value: Colors.Wheat
            },
            {
                text: '139. White',
                value: Colors.White
            },
            {
                text: '140. WhiteSmoke',
                value: Colors.WhiteSmoke
            },
            {
                text: '141. Yellow',
                value: Colors.Yellow
            },
            {
                text: '142. YellowGreen',
                value: Colors.YellowGreen
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
        this._peripheral = new ArduinoNano(this.runtime, ArduinoFastLEDDevice.DEVICE_ID, originalDeviceId);
    }

    /**
     * @returns {Array.<object>} metadata for this extension and its blocks.
     */
    getInfo () {
        return [
            {
                id: 'fastled',
                name: formatMessage({
                    id: 'arduino.category.fastled',
                    default: 'LED',
                    description: 'The name of the LED in verital block'
                }),
                color1: '#009297',
                color2: '#004B4C',
                color3: '#004B4C',
                menuIconURI: 'data:image/png;base64,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',
                blockIconURI: 'data:image/png;base64,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',
                blocks: [
                    {
                        opcode: 'setLEDNumber',
                        text: formatMessage({
                            id: 'arduino.fastled.setLEDNumber',
                            default: 'set LED number [NUMBER]',
                            description: 'arduino set number of LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NUMBER: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 5
                            }
                        }
                    },
                    {
                        opcode: 'setBrightness',
                        text: formatMessage({
                            id: 'arduino.fastled.setBrightness',
                            default: 'set LED brightness [NUMBER]',
                            description: 'arduino set brightness of LED'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NUMBER: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 10
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'setAllLEDColor',
                        text: formatMessage({
                            id: 'arduino.fastled.setAllLEDColor',
                            default: 'set all LED color to [COLOR]',
                            description: 'arduino set all LED Color'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'colors',
                                defaultValue: Colors.AliceBlue
                            }
                        }
                    },
                    {
                        opcode: 'setAllLEDColorHSV',
                        text: formatMessage({
                            id: 'arduino.fastled.setAllLEDColorHSV',
                            default: 'set all LED color to [COLOR]',
                            description: 'arduino set All LED Color (HSV -> RGB)'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            COLOR: {
                                type: ArgumentType.COLOR,
                            }
                        }
                    },                    
                    {
                        opcode: 'setAllLEDColorRGB',
                        text: formatMessage({
                            id: 'arduino.fastled.setAllLEDColorRGB',
                            default: 'set all LED color to Red [RED] Green[GREEN] Blue [BLUE]',
                            description: 'arduino set All LED RGB Color'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            RED: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 255
                            },
                            GREEN: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 255
                            },
                            BLUE: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 255
                            }
                        }
                    },
                    {
                        opcode: 'setLEDColorGradient',
                        text: formatMessage({
                            id: 'arduino.fastled.setLEDColorGradient',
                            default: 'set all LED color from [COLOR_FROM] to [COLOR_TO]',
                            description: 'arduino set LED gradient color'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            COLOR_FROM: {
                                type: ArgumentType.STRING,
                                menu: 'colors',
                                defaultValue: Colors.AliceBlue
                            },
                            COLOR_TO: {
                                type: ArgumentType.STRING,
                                menu: 'colors',
                                defaultValue: Colors.Red
                            }
                        }
                    },
                    {
                        opcode: 'setLEDColorRainbow',
                        text: formatMessage({
                            id: 'arduino.fastled.setLEDColorRainbow',
                            default: 'set all LED rainbow color in [MILLISECOND] millisecond',
                            description: 'arduino set LED rainbow color'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            MILLISECOND: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 150
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'setLEDColor',
                        text: formatMessage({
                            id: 'arduino.fastled.setLEDColor',
                            default: 'set LED [NUMBER] color to [COLOR]',
                            description: 'arduino set LED Color'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NUMBER: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            COLOR: {
                                type: ArgumentType.STRING,
                                menu: 'colors',
                                defaultValue: Colors.AliceBlue
                            }
                        }
                    },
                    {
                        opcode: 'setLEDColorHSV',
                        text: formatMessage({
                            id: 'arduino.fastled.setLEDColorHSV',
                            default: 'set LED [NUMBER] color to [COLOR]',
                            description: 'arduino set LED RGB Color (HSV -> RGB)'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NUMBER: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            COLOR: {
                                type: ArgumentType.COLOR,
                            },
                        }
                    },                    
                    {
                        opcode: 'setLEDColorRGB',
                        text: formatMessage({
                            id: 'arduino.fastled.setLEDColorRGB',
                            default: 'set LED [NUMBER] color to Red [RED] Green[GREEN] Blue [BLUE]',
                            description: 'arduino set LED RGB Color'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            NUMBER: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            RED: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 255
                            },
                            GREEN: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 255
                            },
                            BLUE: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 255
                            }
                        }
                    },
                    '---',
                    {
                        opcode: 'repeat',
                        text: formatMessage({
                            id: 'arduino.fastled.repeat',
                            default: 'repeat " i " LED',
                            description: 'arduino for i loop'
                        }),
                        blockType: BlockType.LOOP,
                        arguments: {
                        }
                    },
                    '---',
                    {
                        opcode: 'repeat_n_ms',
                        text: formatMessage({
                            id: 'arduino.fastled.repeat_n_ms',
                            default: 'repeat in [MILLISECOND] milliseconds',
                            description: 'arduino FastLED Recurring event trigger in millisecond'
                        }),
                        blockType: BlockType.LOOP,
                        arguments: {
                            MILLISECOND: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }                            
                        }
                    },
                    {
                        opcode: 'repeat_n_s',
                        text: formatMessage({
                            id: 'arduino.fastled.repeat_n_s',
                            default: 'repeat in [SECOND] seconds',
                            description: 'arduino FastLED Recurring event trigger in second'
                        }),
                        blockType: BlockType.LOOP,
                        arguments: {
                            SECOND: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }                            
                        }
                    },
                    {
                        opcode: 'repeat_n_min',
                        text: formatMessage({
                            id: 'arduino.fastled.repeat_n_min',
                            default: 'repeat in [MINTUE] mintues',
                            description: 'arduino FastLED Recurring event trigger in mintue'
                        }),
                        blockType: BlockType.LOOP,
                        arguments: {
                            MINTUE: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }                            
                        }
                    },
                    {
                        opcode: 'repeat_n_hour',
                        text: formatMessage({
                            id: 'arduino.fastled.repeat_n_hour',
                            default: 'repeat in [HOUR] hours',
                            description: 'arduino FastLED Recurring event trigger in hour'
                        }),
                        blockType: BlockType.LOOP,
                        arguments: {
                            HOUR: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1
                            }                            
                        }
                    },
                ],
                menus: {
                    colors: {
                        items: this.COLORS_MENU
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

module.exports = ArduinoFastLEDDevice;