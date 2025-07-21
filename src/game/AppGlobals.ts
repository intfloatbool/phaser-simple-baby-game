import { IFBVector2 } from "../ifb-utilz/IFBMath";

export const GameEvents = {
    CURRENT_SCENE_READY: "current-scene-ready",
    LOADING_SCREEN_START: "loading-screen-start",
    LOADING_SCREEN_DONE: "loading-screen-done",
    SUB_LEVEL_DONE: "sub-level-done",
}

export const ImageKeys = {
    FARM_ANIMALS: {
        COW: "FARM_ANIMALS.COW",
        PIG: "FARM_ANIMALS.PIG",
        CHICKEN: "FARM_ANIMALS.CHICKEN",
        HORSE: "FARM_ANIMALS.HORSE",
        GOOSE: "FARM_ANIMALS.GOOSE",
        SHEEP: "FARM_ANIMALS.SHEEP",

        BACKGROUND_0: "FARM_ANIMALS.BACKGROUND_0",
        BACKGROUND_1: "FARM_ANIMALS.BACKGROUND_1"
    }
}

export const SceneNames = {
    GAME_GUESS_N_LEARN_0: "GNLFirst",
    GAME_GUESS_N_LEARN_1: "GNLSecondLearn",  // 
    GAME_GUESS_N_LEARN_2: "GNLThirdSeek", 
    GAME_GUESS_N_LEARN_3: "GNLFourGuess", 
}

export const PerfectScreenSize: IFBVector2 = {
    x: 1920,
    y: 1080
}

export const ScreenCenter: IFBVector2 = {
    x: PerfectScreenSize.x / 2,
    y: PerfectScreenSize.y / 2
}

export const ScreenCenterCopy = (): IFBVector2 => {
    return {...ScreenCenter};
}

export const GetCurrentScreenFactorFromScene = (scene: Phaser.Scene) => GetCurrentScreenFactor(scene.game.scale);

export const GetCurrentScreenFactor = (scaleManager: Phaser.Scale.ScaleManager): IFBVector2 =>  {
    const width = scaleManager.gameSize.width;
    const height = scaleManager.gameSize.height;
    
    const widthFactor = width / PerfectScreenSize.x;
    const heightFactor = height / PerfectScreenSize.y;

    return {
        x: widthFactor,
        y: heightFactor
    }
}


export const IFB_LOG = (msg: string): void => {
    //console.log(`[IFB_LOG_XXX] ${msg}`);
}

export const IFB_LOG_ERR = (msg: string): void => {
    console.error(`[IFB_LOG_ERR_XXX] ${msg}`);
}
export const IFB_LOG_EX = (ex: Error): void => {
    console.error(`[IFB_LOG_ERR_XXX] ${ex.toString()}`);
}

export const IFB_THROW_ERR = (msg: string): void => {
    throw new Error(`[IFB_THROW_ERR] ${msg}`);
}


export const IFB_LOG_NOT_IMPLEMENTED_ERR = (what: string): void => {
    IFB_LOG_ERR(`[IFB_NOT_IMPLEMENTED_ERR] ${what}`)
}