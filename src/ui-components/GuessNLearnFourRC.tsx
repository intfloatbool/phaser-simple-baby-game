import { useState, useEffect } from "react";
import { SceneNames, GameEvents } from "../game/AppGlobals";
import { EventBus } from "../game/EventBus";
import { TopLeftButtonRC } from "./common/TopLeftButtonRC";
import { FinishButtonRC } from "./common/FinishButtonRC";

export type GuessNLearnFourRCProps = {
    setSceneAction: (sceneKey: string) => void,
    goToMainMenuAction: () => void,
}

export const GuessNLearnFourRC: React.FC<GuessNLearnFourRCProps> = (props) => {

    const goToNextSceneAction = () => {
        props.setSceneAction(SceneNames.GAME_GUESS_N_LEARN_1);
    }
    
    const [isTapToContinueRequired, setIsTapToContinueRequired] = useState<boolean>(false);

    useEffect(() => {

        const onSubLevelDone = () => {
            setIsTapToContinueRequired(true);
        }

        EventBus.on(GameEvents.SUB_LEVEL_DONE, onSubLevelDone);

        return () => {
            EventBus.off(GameEvents.SUB_LEVEL_DONE, onSubLevelDone);
        }
    }, []);

    return (
        <div className="w-full h-full flex justify-center items-center">

            <TopLeftButtonRC {...{onClick: props.goToMainMenuAction, iconSrc: "./assets/close_btn_0.png", alt: ""}}/>

            {isTapToContinueRequired && 
                <FinishButtonRC onClick={goToNextSceneAction} locKey="choose_another_game" />
            }
        </div>
    )
}