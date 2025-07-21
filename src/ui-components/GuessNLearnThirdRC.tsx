import { useEffect, useState } from "react"
import { GameEvents, IFB_LOG_NOT_IMPLEMENTED_ERR, SceneNames } from "../game/AppGlobals"
import { EventBus } from "../game/EventBus"
import { TopLeftButtonRC } from "./common/TopLeftButtonRC"
import { TopRightButtonRC } from "./common/TopRightButtonRC"
import { FinishButtonRC } from "./common/FinishButtonRC"

export type GuessNLearnThirdRCProps = {
    setSceneAction: (sceneKey: string) => void,
    goToMainMenuAction: () => void,
}

export const GuessNLearnThirdRC: React.FC<GuessNLearnThirdRCProps> = (props) => {

    const goToNextSceneAction = () => {
        props.setSceneAction(SceneNames.GAME_GUESS_N_LEARN_3);
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

            <TopRightButtonRC {...{ onClick: () => {
                goToNextSceneAction();
            }, iconSrc:"./assets/right_button_0.png", alt: "" }}/>

            {isTapToContinueRequired && 
                <FinishButtonRC onClick={goToNextSceneAction} locKey="continue" />
            }
        </div>
    )
}