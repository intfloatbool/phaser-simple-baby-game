import { GNLItemsPack } from "../game/scenes/minigames/guess_n_learn/GNLGameData";
import { IFBCreateGNLItem, IFBCreatePreloadData, IFBGetMultilangVoiceImageData, ItemsPackProvider } from "./ItemsPackProvider";

const createItemPack = (): GNLItemsPack => {
    return {
        iconName: "vehicles",
        presentSfxKey: "the_vehicles",
        locKey: `games.guess_n_learn.packs.vehicles.title`,
        items: [
            IFBCreateGNLItem("games.guess_n_learn.packs.vehicles.items.car", "img_car", "car", "sfx_car", "car"),
            IFBCreateGNLItem("games.guess_n_learn.packs.vehicles.items.train", "img_train", "train", "sfx_train", "train"),
            IFBCreateGNLItem("games.guess_n_learn.packs.vehicles.items.bus", "img_bus", "bus", "sfx_bus", "bus"),
            IFBCreateGNLItem("games.guess_n_learn.packs.vehicles.items.bicycle", "img_bicycle", "bicycle", "sfx_bicycle", "bicycle"),
            IFBCreateGNLItem("games.guess_n_learn.packs.vehicles.items.motorcycle", "img_motorcycle", "motorcycle", "sfx_motorcycle", "motorcycle"),
        ],
        obstacles: [
            {
                textureName: "city_obstacle_0",
                scale: 1.2,
            },
            {
                textureName: "city_obstacle_1",
                scale: 1.2,
            },
            {
                textureName: "city_obstacle_2",
                scale: 1.2,
            },
            {
                textureName: "city_obstacle_3",
                scale: 1.2,
            }
        ],
        backgroundImageKeys: [
            "city_background_0",
            "city_background_1",
        ]
    }
}

export const VehicleItemsPackProvider: ItemsPackProvider = {
    ItemPack: createItemPack(),
    PreloadItemsImagesDataCollection: [
        //512x512
        IFBCreatePreloadData("img_car", "vehicles/car.png"),
        IFBCreatePreloadData("img_bus", "vehicles/bus.png"),
        IFBCreatePreloadData("img_bicycle", "vehicles/bicycle.png"),
        IFBCreatePreloadData("img_train", "vehicles/train.png"),
        IFBCreatePreloadData("img_motorcycle", "vehicles/motorcycle.png"),
    
    ],
    PreloadObstaclesImagesDataCollection: [
        //256x256
        IFBCreatePreloadData("city_obstacle_0", "vehicles/city_obstacle_0.png"),
        IFBCreatePreloadData("city_obstacle_1", "vehicles/city_obstacle_1.png"),
        IFBCreatePreloadData("city_obstacle_2", "vehicles/city_obstacle_2.png"),
        IFBCreatePreloadData("city_obstacle_3", "vehicles/city_obstacle_3.png"),
    ],
    PreloadBackgroundsImagesDataCollection: [
        //1920x1080
       IFBCreatePreloadData("city_background_0", "vehicles/city_background_0.jpg"),
       IFBCreatePreloadData("city_background_1", "vehicles/city_background_1.jpg"),
    ],
    PreloadVoicesDataCollection: [
        ...IFBGetMultilangVoiceImageData("the_vehicles", "the_vehicles"),
        ...IFBGetMultilangVoiceImageData("car", "car"),
        ...IFBGetMultilangVoiceImageData("bus", "bus"),
        ...IFBGetMultilangVoiceImageData("bicycle", "bicycle"),
        ...IFBGetMultilangVoiceImageData("motorcycle", "motorcycle"),
        ...IFBGetMultilangVoiceImageData("train", "train"),
    ],
    PreloadSfxDataCollection: [
        IFBCreatePreloadData("sfx_car", "audio/sfx/sfx_car.mp3"),
        IFBCreatePreloadData("sfx_bus", "audio/sfx/sfx_bus.mp3"),
        IFBCreatePreloadData("sfx_bicycle", "audio/sfx/sfx_bicycle.mp3"),
        IFBCreatePreloadData("sfx_train", "audio/sfx/sfx_train.mp3"),
        IFBCreatePreloadData("sfx_motorcycle", "audio/sfx/sfx_motorcycle.mp3"),
    ]
}