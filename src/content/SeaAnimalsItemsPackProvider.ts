import { GNLItemsPack } from "../game/scenes/minigames/guess_n_learn/GNLGameData";
import { IFBCreateGNLItem, IFBCreatePreloadData, IFBGetMultilangVoiceImageData, ItemsPackProvider } from "./ItemsPackProvider";

const createItemPack = (): GNLItemsPack => {
    return {
        iconName: "sea_animals",
        presentSfxKey: "the_sea_animals",
        locKey: `games.guess_n_learn.packs.sea_animals.title`,
        items: [
            IFBCreateGNLItem("games.guess_n_learn.packs.sea_animals.items.octopus", "img_octopus", "octopus", "sfx_octopus", "octopus"),
            IFBCreateGNLItem("games.guess_n_learn.packs.sea_animals.items.seahorse", "img_seahorse", "seahorse", "sfx_fish", "seahorse"),
            IFBCreateGNLItem("games.guess_n_learn.packs.sea_animals.items.fish", "img_fish", "fish", "sfx_fish", "fish"),
            IFBCreateGNLItem("games.guess_n_learn.packs.sea_animals.items.crab", "img_crab", "crab", "sfx_crab", "crab"),
            IFBCreateGNLItem("games.guess_n_learn.packs.sea_animals.items.shark", "img_shark", "shark", "sfx_fish", "shark"),
        ],
        obstacles: [
            {
                textureName: "sea_obstacle_0",
                scale: 1.2,
            },
            {
                textureName: "sea_obstacle_1",
                scale: 1.2,
            },
            {
                textureName: "sea_obstacle_2",
                scale: 1.2,
            },
            {
                textureName: "sea_obstacle_3",
                scale: 1.2,
            }
        ],
        backgroundImageKeys: [
            "sea_background_0",
            "sea_background_1",
        ]
    }
}

export const SeaAnimalsItemsPackProvider: ItemsPackProvider = {
    ItemPack: createItemPack(),
    PreloadItemsImagesDataCollection: [
        //512x512
        IFBCreatePreloadData("img_octopus", "sea_animals/octopus.png"),
        IFBCreatePreloadData("img_seahorse", "sea_animals/seahorse.png"),
        IFBCreatePreloadData("img_fish", "sea_animals/fish.png"),
        IFBCreatePreloadData("img_crab", "sea_animals/crab.png"),
        IFBCreatePreloadData("img_shark", "sea_animals/shark.png"),

    
    ],
    PreloadObstaclesImagesDataCollection: [
        //256x256
        IFBCreatePreloadData("sea_obstacle_0", "sea_animals/sea_obstacle_0.png"),
        IFBCreatePreloadData("sea_obstacle_1", "sea_animals/sea_obstacle_1.png"),
        IFBCreatePreloadData("sea_obstacle_2", "sea_animals/sea_obstacle_2.png"),
        IFBCreatePreloadData("sea_obstacle_3", "sea_animals/sea_obstacle_3.png"),
    ],
    PreloadBackgroundsImagesDataCollection: [
        //1920x1080
       IFBCreatePreloadData("sea_background_0", "sea_animals/sea_background_0.jpg"),
       IFBCreatePreloadData("sea_background_1", "sea_animals/sea_background_1.jpg"),
    ],
    PreloadVoicesDataCollection: [
        ...IFBGetMultilangVoiceImageData("the_sea_animals", "the_sea_animals"),
        ...IFBGetMultilangVoiceImageData("octopus", "octopus"),
        ...IFBGetMultilangVoiceImageData("seahorse", "seahorse"),
        ...IFBGetMultilangVoiceImageData("fish", "fish"),
        ...IFBGetMultilangVoiceImageData("crab", "crab"),
        ...IFBGetMultilangVoiceImageData("shark", "shark"),
    ],
    PreloadSfxDataCollection: [
        IFBCreatePreloadData("sfx_octopus", "audio/sfx/sfx_octopus.mp3"),
        IFBCreatePreloadData("sfx_crab", "audio/sfx/sfx_crab.mp3"),
        IFBCreatePreloadData("sfx_fish", "audio/sfx/sfx_fish.mp3"),
    ]
}