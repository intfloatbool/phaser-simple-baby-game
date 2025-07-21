export type GNLObstacle = {
    textureName: string,
    scale: number,
}

export type GNLItem = {
    uid: string,
    locKey: string,
    imageKey: string,
    sfxPresentKey: string,
    sfxSoundKey: string,
    globalNameKey: string,
}

export type GNLItemsPack = {
    iconName: string,
    presentSfxKey: string,
    locKey: string,
    items: GNLItem[],
    obstacles: GNLObstacle[],
    backgroundImageKeys: string[],
    isRandomBackgrounds?: boolean
}

export type GNLGameData = {
    isReady: boolean,
    itemsPack: GNLItemsPack,
}