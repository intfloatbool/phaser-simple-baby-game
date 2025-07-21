export type IFBVector2 = {
    x: number,
    y: number
}

export type IFBSize = {
    w: number,
    h: number
}

export const IFB_HEX_COLORS = {
    BLACK: 0x000000,
    WHITE: 0xffffff,
    GRAY: 0x7a7a7a,
    RED: 0xff0000,
    GREEN: 0x00ff00,
    BLUE: 0x0000ff,
    LIGHT_BLUE: 0x246fbf,
}

export const IFBHexColorToCSS = (color: number) => {
    return "#" + color.toString(16).padStart(6, '0').toUpperCase();
}

export const IFBVector2One: IFBVector2 = {
    x: 1,
    y: 1
}

export const IFBVector2Zero: IFBVector2 = {
    x: 0,
    y: 0
}