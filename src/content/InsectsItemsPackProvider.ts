import { GNLItemsPack, GNLObstacle } from "../game/scenes/minigames/guess_n_learn/GNLGameData";
import { PreloadData } from "../GameConfig";
import { IFBCreateGNLItem, IFBCreatePreloadData, IFBGetMultilangVoiceImageData, ItemsPackProvider } from "./ItemsPackProvider";

// Insects

const PACK_NAME = "insects";

enum ItemNames {
    ITEM_1 = "grasshopper",    
    ITEM_2 = "ladybug",    
    ITEM_3 = "butterfly",    
    ITEM_4 = "bug",    
    ITEM_5 = "bee",    
}

const PACK_LOCK_ITEMS_PATH = `games.guess_n_learn.packs.${PACK_NAME}.items`;

const CreateGNLItem = ( itemName: ItemNames) => {
    return IFBCreateGNLItem(`${PACK_LOCK_ITEMS_PATH}.${itemName}`, `img_${itemName}`, itemName, `sfx_${itemName}`, itemName);
}

const CreateBackgroundName = (index: number): string => {
    return `${PACK_NAME}_background_${index}`;
} 

const CreateObstacleName = (index: number): string => {
    return `${PACK_NAME}_obstacle_${index}`;
}

const CreateObstacle = (index: number, scale: number): GNLObstacle => {
    return {
        textureName: CreateObstacleName(index),
        scale: scale
    }
}

const CreateImagePreloadData = (item: ItemNames): PreloadData => {
    return IFBCreatePreloadData("img_" + item, `${PACK_NAME}/${item}.png`);
}

const CreateObstaclePreloadData = (index: number): PreloadData => {
    const obstacleName = `${PACK_NAME}_obstacle_${index}`;
    return IFBCreatePreloadData(obstacleName, `${PACK_NAME}/${obstacleName}.png`)
}
//insects_background_0.jpg
const CreateBackgroundPreloadData = (index: number): PreloadData => {
    const name = CreateBackgroundName(index)
    return IFBCreatePreloadData(`${PACK_NAME}_background_${index}`, `${PACK_NAME}/${PACK_NAME}_background_${index}.jpg`);
}

const CreateTitleVoiceMultilangPreloadData = () => {
    return IFBGetMultilangVoiceImageData("the_" + PACK_NAME, "the_" + PACK_NAME);
}

const CreateItemVoiceMultilangPreloadData = (itemName: ItemNames) => {
    return IFBGetMultilangVoiceImageData(itemName, itemName);
}

const CreateItemSfxPreloadData = (itemName: ItemNames) => {
    return IFBCreatePreloadData("sfx_" + itemName, `audio/sfx/sfx_${itemName}.mp3`);
}

const createItemPack = (): GNLItemsPack => {
    return {
        iconName: "insects",
        presentSfxKey: `the_${PACK_NAME}`,
        locKey: `games.guess_n_learn.packs.${PACK_NAME}.title`,
        items: [
            CreateGNLItem(ItemNames.ITEM_1),
            CreateGNLItem(ItemNames.ITEM_2),
            CreateGNLItem(ItemNames.ITEM_3),
            CreateGNLItem(ItemNames.ITEM_4),
            CreateGNLItem(ItemNames.ITEM_5),
        
        ],
        obstacles: [
            CreateObstacle(0, 1.2),
            CreateObstacle(1, 1.2),
            CreateObstacle(2, 1.2),
            CreateObstacle(3, 1.2),
   
        ],
        backgroundImageKeys: [
            CreateBackgroundName(0),
            CreateBackgroundName(1),
        ]
    }
}

export const InsectsItemsPackProvider: ItemsPackProvider = {
    ItemPack: createItemPack(),
    PreloadItemsImagesDataCollection: [
        //512x512
        CreateImagePreloadData(ItemNames.ITEM_1),
        CreateImagePreloadData(ItemNames.ITEM_2),
        CreateImagePreloadData(ItemNames.ITEM_3),
        CreateImagePreloadData(ItemNames.ITEM_4),
        CreateImagePreloadData(ItemNames.ITEM_5),
    ],
    PreloadObstaclesImagesDataCollection: [
        //256x256
        CreateObstaclePreloadData(0),
        CreateObstaclePreloadData(1),
        CreateObstaclePreloadData(2),
        CreateObstaclePreloadData(3),
    ],
    PreloadBackgroundsImagesDataCollection: [
        //1920x1080
       CreateBackgroundPreloadData(0),
       CreateBackgroundPreloadData(1),
    ],
    PreloadVoicesDataCollection: [
        ...CreateTitleVoiceMultilangPreloadData(),
        ...CreateItemVoiceMultilangPreloadData(ItemNames.ITEM_1),
        ...CreateItemVoiceMultilangPreloadData(ItemNames.ITEM_2),
        ...CreateItemVoiceMultilangPreloadData(ItemNames.ITEM_3),
        ...CreateItemVoiceMultilangPreloadData(ItemNames.ITEM_4),
        ...CreateItemVoiceMultilangPreloadData(ItemNames.ITEM_5),
    ],
    PreloadSfxDataCollection: [
        CreateItemSfxPreloadData(ItemNames.ITEM_1),
        CreateItemSfxPreloadData(ItemNames.ITEM_2),
        CreateItemSfxPreloadData(ItemNames.ITEM_3),
        CreateItemSfxPreloadData(ItemNames.ITEM_4),
        CreateItemSfxPreloadData(ItemNames.ITEM_5),
    ]
}