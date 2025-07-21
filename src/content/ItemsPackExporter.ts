import { InsectsItemsPackProvider } from "./InsectsItemsPackProvider";
import { ItemsPackProvider } from "./ItemsPackProvider";
import { SeaAnimalsItemsPackProvider } from "./SeaAnimalsItemsPackProvider";
import { VehicleItemsPackProvider } from "./VehicleItemsPackProvider";

export const ItemsPacksExportData: ItemsPackProvider[] = [

    VehicleItemsPackProvider,
    SeaAnimalsItemsPackProvider,
    InsectsItemsPackProvider,
];