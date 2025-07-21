import { ItemsPacksExportData } from "./content/ItemsPackExporter";
import { IFBGetMultilangVoiceImageData } from "./content/ItemsPackProvider";
import { ImageKeys, SceneNames } from "./game/AppGlobals";
import { GNLItemsPack } from "./game/scenes/minigames/guess_n_learn/GNLGameData";
import { IFBHexColorToCSS, IFBVector2 } from "./ifb-utilz/IFBMath"


export type PreloadData = {
    // this.load.image('sample_obstacle', 'obstacles/sample_obstacle.png');
    key: string,
    pathRelativeToAssets: string
}

type GuessNLearnConfig = {
    itemImageScale: number,
    itemPacks: GNLItemsPack[],
    firstScene: string,
    learnItemShowTime: number,
    learnItemStartSpawnPosX: number,
    learnItemWaitBetweenTime: number,
    elemSize: {
        w: number,
        h: number,
    },
    elemsOffset: IFBVector2,
    shakeDurationSeconds: number,
    showHiddenItemTimeSeconds: number,
    showGuessedItemTimeSeconds: number,
    fillProgressItemTimeSeconds: number
}

type GameConfig = {
    isDebug: boolean,
    preloadImageDataCollection: PreloadData[],
    preloadSoundsCollection: PreloadData[],
    gnrConfig: GuessNLearnConfig
}

export const IFBHexColorPallete = {
    PRIMARY: 0x4DA8DA,
    SECONDARY: 0x80D8C3,
    ACCENT: 0xFFD66B,
    BACKGROUND: 0xF5F5F5,

    PRIMARY_CSS: IFBHexColorToCSS(0x4DA8DA),
    SECONDARY_CSS: IFBHexColorToCSS(0x80D8C3),
    ACCENT_CSS: IFBHexColorToCSS(0xFFD66B),
    BACKGROUND_CSS: IFBHexColorToCSS(0xF5F5F5),
}

// DEFAULT is 1
export const SpeedMultiplier = 1;

const cattleKeyPrefix = "games.guess_n_learn.packs.farm_cattle";
const vehicleKeyPrefix = "games.guess_n_learn.packs.vehicles";

const globalObjectsNames = {

    FA_CHICKEN: "chicken",
    FA_COW: "cow",
    FA_HORSE: "horse",
    FA_SHEEP: "sheep",
    FA_GOOSE: "goose",
    FA_PIG: "pig",
}

const commonImageDataCollection: PreloadData[] = [

];

const obstaclesImageDataCollection: PreloadData[] = [
    {
        key: "red_house", 
        pathRelativeToAssets: "obstacles/red_house.png"
    },
    {
        key: "green_house", 
        pathRelativeToAssets: "obstacles/green_house.png"
    },
    {
        key: "blue_house", 
        pathRelativeToAssets: "obstacles/blue_house.png"
    },
    {
        key: "hense", 
        pathRelativeToAssets: "obstacles/hense.png"
    },
    {
        key: "hay", 
        pathRelativeToAssets: "obstacles/hay.png"
    },
    {
        key: "bush_0", 
        pathRelativeToAssets: "obstacles/bush_0.png"
    },
    {
        key: "bush_1", 
        pathRelativeToAssets: "obstacles/bush_1.png"
    },
    {
        key: "bush_2", 
        pathRelativeToAssets: "obstacles/bush_1.png"
    },
];

const farmAnimalsImageDataCollection: PreloadData[] = [

    {
        key: ImageKeys.FARM_ANIMALS.BACKGROUND_0,
        pathRelativeToAssets: "./farm_animals/farm_background_0.jpg"
    },
    {
        key: ImageKeys.FARM_ANIMALS.BACKGROUND_1,
        pathRelativeToAssets: "./farm_animals/farm_background_1.jpg"
    },
    {
        key: ImageKeys.FARM_ANIMALS.CHICKEN,
        pathRelativeToAssets: "farm_animals/chicken.png",
    },
    {
        key: ImageKeys.FARM_ANIMALS.COW,
        pathRelativeToAssets: "farm_animals/cow.png",
    },
    {
        key: ImageKeys.FARM_ANIMALS.GOOSE,
        pathRelativeToAssets: "farm_animals/goose.png",
    },
    {
        key: ImageKeys.FARM_ANIMALS.HORSE,
        pathRelativeToAssets: "farm_animals/horse.png",
    },
    {
        key: ImageKeys.FARM_ANIMALS.PIG,
        pathRelativeToAssets: "farm_animals/pig.png",
    },
    {
        key: ImageKeys.FARM_ANIMALS.SHEEP,
        pathRelativeToAssets: "farm_animals/sheep.png",
    }
]

function getMultilangVoice(key: string, fileNameWithoutExtension: string): PreloadData[] {
    return IFBGetMultilangVoiceImageData(key, fileNameWithoutExtension);
}

export const VoicesPreloadData: PreloadData[] = [
    // start: common voices
    ...getMultilangVoice("the_animals_on_farm", "the_animals_on_farm"),
    ...getMultilangVoice("well_done", "well_done"),
    ...getMultilangVoice("lets_meet", "lets_meet"),
    ...getMultilangVoice("lets_find_hidden", "lets_find_hidden"),
    ...getMultilangVoice("where_is_the", "where_is_the"),
    // end: common voices

    // start: animal presents
    ...getMultilangVoice("chicken", "chicken"),
    ...getMultilangVoice("cow", "cow"),
    ...getMultilangVoice("goose", "goose"),
    ...getMultilangVoice("horse", "horse"),
    ...getMultilangVoice("sheep", "sheep"),
    ...getMultilangVoice("pig", "pig"),
    // end: animal presents
    
]

const addSfxPrefix = (str: string) => `sfx_${str};`

export const SFX_PreloadData: PreloadData[] = [

    // common sounds
    {
        key: "sfx_sound_congrats",
        pathRelativeToAssets: "audio/sfx/sfx_sound_congrats.mp3",
    },
    // end sounds

    // animal sounds
    {
        key: addSfxPrefix(globalObjectsNames.FA_CHICKEN),
        pathRelativeToAssets: "audio/sfx/sfx_chicken.mp3",
    },
    {
        key: addSfxPrefix(globalObjectsNames.FA_COW),
        pathRelativeToAssets: "audio/sfx/sfx_cow.mp3",
    },
    {
        key: addSfxPrefix(globalObjectsNames.FA_GOOSE),
        pathRelativeToAssets: "audio/sfx/sfx_goose.mp3",
    },
    {
        key: addSfxPrefix(globalObjectsNames.FA_PIG),
        pathRelativeToAssets: "audio/sfx/sfx_pig.mp3",
    },
    {
        key: addSfxPrefix(globalObjectsNames.FA_SHEEP),
        pathRelativeToAssets: "audio/sfx/sfx_sheep.mp3",
    },
    {
        key: addSfxPrefix(globalObjectsNames.FA_HORSE),
        pathRelativeToAssets: "audio/sfx/sfx_horse.mp3",
    }
     // end animal sounds
]

const anotherPacks = [...ItemsPacksExportData];
const anotherPacksImagesData = () => {
    const imageDataCollection: PreloadData[] = [];
    for(const pack of anotherPacks) {
        imageDataCollection.push(...pack.PreloadBackgroundsImagesDataCollection);
        imageDataCollection.push(...pack.PreloadItemsImagesDataCollection);
        imageDataCollection.push(...pack.PreloadObstaclesImagesDataCollection);
    }
    return imageDataCollection;
}

const anotherPacksMainData = () => {
    const mainDataCollection: GNLItemsPack[] = [];
    anotherPacks.forEach(ap => mainDataCollection.push(ap.ItemPack));
    return mainDataCollection;
}

const anotherPacksVoicesData = () => {
    const voicesDataCollection: PreloadData[] = [];
    anotherPacks.forEach(ap => voicesDataCollection.push(...ap.PreloadVoicesDataCollection));
    return voicesDataCollection;
}

const anotherPacksSfxData = () => {
    const sfxsDataCollection: PreloadData[] = [];
    anotherPacks.forEach(ap => sfxsDataCollection.push(...ap.PreloadSfxDataCollection));
    return sfxsDataCollection;
}


export const GameConfigInstance: GameConfig = {
    isDebug: false,
    preloadImageDataCollection: [
        ...anotherPacksImagesData(),
        ...commonImageDataCollection,
        ...obstaclesImageDataCollection,
        ...farmAnimalsImageDataCollection,
        {
            key: "tap_to_screen_tip",
            pathRelativeToAssets: "utils/tap_to_screen_0.png"
        }
    ],
    preloadSoundsCollection: [
        ...anotherPacksVoicesData(),
        ...anotherPacksSfxData(),
        ...VoicesPreloadData,
        ...SFX_PreloadData,
    ],

    gnrConfig: {
        itemImageScale: 0.8,
        itemPacks: [
            {
                iconName: "animals_on_farm",
                presentSfxKey: "the_animals_on_farm",
                locKey: `${cattleKeyPrefix}.title`,
                items: [
                    {
                        uid: crypto.randomUUID(),
                        locKey: `${cattleKeyPrefix}.animals.chicken`,
                        imageKey: ImageKeys.FARM_ANIMALS.CHICKEN,
                        sfxPresentKey: globalObjectsNames.FA_CHICKEN,
                        sfxSoundKey: addSfxPrefix(globalObjectsNames.FA_CHICKEN),
                        globalNameKey: globalObjectsNames.FA_CHICKEN,
                    },
                    {
                        uid: crypto.randomUUID(),
                        locKey: `${cattleKeyPrefix}.animals.cow`,
                        imageKey: ImageKeys.FARM_ANIMALS.COW,
                        sfxPresentKey: globalObjectsNames.FA_COW,
                        sfxSoundKey: addSfxPrefix(globalObjectsNames.FA_COW),
                        globalNameKey: globalObjectsNames.FA_COW,
                    },
                    {
                        uid: crypto.randomUUID(),
                        locKey: `${cattleKeyPrefix}.animals.pig`,
                        imageKey: ImageKeys.FARM_ANIMALS.PIG,
                        sfxPresentKey: globalObjectsNames.FA_PIG,
                        sfxSoundKey: addSfxPrefix(globalObjectsNames.FA_PIG),
                        globalNameKey: globalObjectsNames.FA_PIG,
                    },
                    {
                        uid: crypto.randomUUID(),
                        locKey: `${cattleKeyPrefix}.animals.goose`,
                        imageKey: ImageKeys.FARM_ANIMALS.GOOSE,
                        sfxPresentKey: globalObjectsNames.FA_GOOSE,
                        sfxSoundKey: addSfxPrefix(globalObjectsNames.FA_GOOSE),
                        globalNameKey: globalObjectsNames.FA_GOOSE,
                    },
                    {
                        uid: crypto.randomUUID(),
                        locKey: `${cattleKeyPrefix}.animals.horse`,
                        imageKey: ImageKeys.FARM_ANIMALS.HORSE,
                        sfxPresentKey: globalObjectsNames.FA_HORSE,
                        sfxSoundKey: addSfxPrefix(globalObjectsNames.FA_HORSE),
                        globalNameKey: globalObjectsNames.FA_HORSE,
                    },
                    {
                        uid: crypto.randomUUID(),
                        locKey: `${cattleKeyPrefix}.animals.sheep`,
                        imageKey: ImageKeys.FARM_ANIMALS.SHEEP,
                        sfxPresentKey: globalObjectsNames.FA_SHEEP,
                        sfxSoundKey: addSfxPrefix(globalObjectsNames.FA_SHEEP),
                        globalNameKey: globalObjectsNames.FA_SHEEP,
                    }
                ],

                obstacles: [
                    {
                        textureName: "red_house",
                        scale: 1.3
                    },
                    {
                        textureName: "hense",
                        scale: 1.1
                    },
                    {
                        textureName: "hay",
                        scale: 1.3
                    },
                    {
                        textureName: "bush_0",
                        scale: 1.1
                    }
                ],

                backgroundImageKeys: [
                    ImageKeys.FARM_ANIMALS.BACKGROUND_0,
                    ImageKeys.FARM_ANIMALS.BACKGROUND_1,
                ],
            },
            ...anotherPacksMainData(),
        ],

        firstScene: SceneNames.GAME_GUESS_N_LEARN_1,
        learnItemShowTime: 0.5 / SpeedMultiplier,
        learnItemWaitBetweenTime: 0.5 / SpeedMultiplier,
        learnItemStartSpawnPosX: 400,
        elemSize: {
            w: 300,
            h: 300,
        },
        elemsOffset: {
            x: 100,
            y: 50
        },
        shakeDurationSeconds: 0.5 / SpeedMultiplier,
        showHiddenItemTimeSeconds: 2 / SpeedMultiplier,
        showGuessedItemTimeSeconds: 2 / SpeedMultiplier,
        fillProgressItemTimeSeconds: 1 / SpeedMultiplier,
    }
}