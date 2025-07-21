import { GNLGameData, GNLItem } from "./GNLGameData";

class GNLGameDataProvider {
    public GameData: GNLGameData = {
        isReady: false,
        itemsPack: {
            locKey: "",
            items: [],
            obstacles: [],
            backgroundImageKeys: [],
        },
    };

    public AllItems: GNLItem[] = []
}

export const GNLGameDataProviderInstance = new GNLGameDataProvider();