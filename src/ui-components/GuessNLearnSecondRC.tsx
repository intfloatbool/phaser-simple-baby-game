import { useEffect, useState } from "react"
import { GameEvents, SceneNames } from "../game/AppGlobals"
import { TopLeftButtonRC } from "./common/TopLeftButtonRC"
import { EventBus } from "../game/EventBus"
import { TopRightButtonRC } from "./common/TopRightButtonRC"
import { FinishButtonRC } from "./common/FinishButtonRC"

export type GuessNLearnSecondRCRCProps = {
    onBackClickAction: () => void,
    onNextClickAction: () => void,
    setSceneAction: (key: string) => void
}

export const GuessNLearnSecondRC: React.FC<GuessNLearnSecondRCRCProps> = (props) => {


    const goToNextSceneAction = () => {
        props.setSceneAction(SceneNames.GAME_GUESS_N_LEARN_2)
    }

    const [isTapToContinueRequired, setIsTapToContinueRequired] = useState<boolean>(false);

    useEffect(() => {
        const onSubLevelDone = () => {
            setIsTapToContinueRequired(true);
        };

        EventBus.on(GameEvents.SUB_LEVEL_DONE, onSubLevelDone);

        return () => {
            EventBus.off(GameEvents.SUB_LEVEL_DONE, onSubLevelDone);
        };
    }, []);

    return (
        
        <div className="w-full h-full flex justify-center items-center">
            <TopLeftButtonRC {...{ onClick: () => {
                props.onBackClickAction();
            }, iconSrc:"./assets/close_btn_0.png", alt: "" }}/>

            <TopRightButtonRC {...{ onClick: () => {
                props.onNextClickAction();
            }, iconSrc:"./assets/right_button_0.png", alt: "" }}/>

            {isTapToContinueRequired && 
                <FinishButtonRC onClick={goToNextSceneAction} locKey="continue" />
            }

            <div className="flex flex-col items-center gap-4">

                <div className="flex flex-col items-center gap-4">
                    
                </div>
          
            </div>
           
        </div>
    )
}