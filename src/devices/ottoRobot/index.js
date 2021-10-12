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
    get DANCES_MENU () {
        return [
            {
                text: 'Moonwalker',
                value: 'moonwalker'
            },
            {
                text: 'Crusaito',
                value: 'crusaito'
            },
            {
                text: 'Flapping',
                value: 'flapping'
            }
        ]
    }
    get DIRECTIONS_MENU () {
        return [
            {
                text: 'Left',
                value: 1
            },
            {
                text: 'Right',
                value: -1
            }
        ]
    }
    get ACTIONS_MENU () {
        return [
            {
                text: 'Ascending Turn',
                value: 'ascendingTurn'
            },
            {
                text: 'Jitter',
                value: 'jitter'
            },
            {
                text: 'Swing',
                value: 'swing'
            },
            {
                text: 'Tiptoe Swing',
                value: 'tiptoeSwing'
            },
            {
                text: 'Up & Down',
                value: 'updown'
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
                        opcode: 'setMove',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setMove',
                            default: 'Move [MOVE] steps [STEPS] speed [SPEED]',
                            description: 'Set Otto Robot Move'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            MOVE: {
                                type: ArgumentType.STRING,
                                menu: 'moves',
                                defaultValue: 'Forward'
                            },
                            STEPS: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 1
                            },
                            SPEED: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 128
                            }
                        }
                    },
                    {
                        opcode: 'setDance',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setDance',
                            default: 'Dance [DANCE] steps [STEPS] speed [SPEED] size [SIZE] direction [DIRECTION]',
                            description: 'Set Otto Robot Dance'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            DANCE: {
                                type: ArgumentType.STRING,
                                menu: 'dances',
                                defaultValue: 'Moonwalker'
                            },
                            STEPS: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 1
                            },
                            SPEED: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 128
                            },
                            SIZE: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 150
                            },
                            DIRECTION: {
                                type: ArgumentType.BOOLEAN,
                                menu: 'directions',
                                defaultValue: 1
                            }
                        }
                    },
                    {
                        opcode: 'setAction',
                        text: formatMessage({
                            id: 'arduino.ottoRobot.setAction',
                            default: 'Action [ACTION] steps [STEPS] speed [SPEED] size [SIZE]',
                            description: 'Set Otto Robot Action'
                        }),
                        blockType: BlockType.COMMAND,
                        arguments: {
                            ACTION: {
                                type: ArgumentType.STRING,
                                menu: 'actions',
                                defaultValue: 'Ascending Turn'
                            },
                            STEPS: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 1
                            },
                            SPEED: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 128
                            },
                            SIZE: {
                                type: ArgumentType.UINT8_NUMBER,
                                defaultValue: 150
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
                    moves: {
                        // acceptReporters: true,
                        items: this.MOVES_MENU
                    },
                    dances: {
                        items: this.DANCES_MENU
                    },
                    directions: {
                        items: this.DIRECTIONS_MENU
                    },
                    actions: {
                        items: this.ACTIONS_MENU
                    },
                    sounds: {
                        items: this.SOUNDS_MENU
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