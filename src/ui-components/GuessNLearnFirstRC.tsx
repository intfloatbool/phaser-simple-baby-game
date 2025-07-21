import { useEffect, useState } from "react"
import { SceneNames } from "../game/AppGlobals"
import { GNLItem, GNLItemsPack } from "../game/scenes/minigames/guess_n_learn/GNLGameData"
import { GNLGameDataProviderInstance } from "../game/scenes/minigames/guess_n_learn/GNLGameDataProvider"
import { GameConfigInstance } from "../GameConfig"
import { IFBShuffleArray } from "../ifb-utilz/IFBUtils"
import { LocProviderInstance } from "../services/localization/LocProvider"
import { TopLeftButtonRC } from "./common/TopLeftButtonRC"
import { GameServiceInstance, LanguageType } from "../game/GameService"
import { SettingsRC } from "./common/SettingsRC"
import { GameButtonRC, HighlightGameButtonRC } from "./GameButtonRC"

export type GuessNLearnFirstRCProps = {
    onBackClickAction: () => void,
    setSceneAction: (key: string) => void
}

export const GuessNLearnFirstRC: React.FC<GuessNLearnFirstRCProps> = (props) => {

    const itemPacks: GNLItemsPack[] = [ ...GameConfigInstance.gnrConfig.itemPacks ];

    itemPacks.forEach(ip => {
        IFBShuffleArray(ip.items);
    });

    const setCurrentSelectedItemPack = (pack: GNLItemsPack) => {
        const packCopy = {...pack};
        const itemsCopy = IFBShuffleArray([...packCopy.items]);
        const capItems = [];
        const maxItems = 4;
        for(let i = 0; i < maxItems; i++) {
            const item = itemsCopy[i];
            if(!item) {
                continue;
            }
            capItems.push(item);
        }
        packCopy.items = capItems;
        GNLGameDataProviderInstance.AllItems = [...{...pack}.items];
        GNLGameDataProviderInstance.GameData.isReady = true;
        GNLGameDataProviderInstance.GameData.itemsPack = packCopy;
    }

    const getFullPack = () => {
        const fullItems: GNLItem[] = [];
        const fullBackgroundsKeys: string[] = [];

        itemPacks.forEach(ip => {
            fullItems.push(...ip.items);
            fullBackgroundsKeys.push(...ip.backgroundImageKeys);
        });

        const shuffledBackgrounds = IFBShuffleArray(fullBackgroundsKeys);

        const pack: GNLItemsPack = {
            iconName: "guess",
            locKey: "",
            presentSfxKey: "",
            items: fullItems,
            obstacles: [],
            backgroundImageKeys: [
                ...shuffledBackgrounds
            ]
        }
        return pack;
    }
    const goToGuessSceneAction = () => {
        props.setSceneAction(SceneNames.GAME_GUESS_N_LEARN_3);
    }
    const goToNextSceneAction = () => {
        props.setSceneAction(GameConfigInstance.gnrConfig.firstScene);
    }

    return (
        
        <div className="flex flex-col flex-wrap justify-center items-center h-screen">

            <SettingsRC />


            <div className="flex justify-center">
                <HighlightGameButtonRC key={0}  {...{iconName: "guess", onClick: () => {
                    setCurrentSelectedItemPack(getFullPack());
                    goToGuessSceneAction();
                }}} />
            </div>

            <div className="flex flex-wrap  justify-center gap-4">

                

                {itemPacks.map((item, index) => (

                    <GameButtonRC key={index + 1}  {...{iconName: item.iconName, onClick: () => {
                            setCurrentSelectedItemPack(item);
                            goToNextSceneAction();
                        }}} />
                ))}
                
            </div>    
          
        </div>
    )
}