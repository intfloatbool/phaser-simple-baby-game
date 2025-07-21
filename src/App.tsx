import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { GameEvents, IFB_LOG, IFB_LOG_ERR, IFB_LOG_NOT_IMPLEMENTED_ERR, SceneNames } from './game/AppGlobals';
import { LoadingOverlayRC } from './ui-components/LoadingOverlayRC';
import { EventBus } from './game/EventBus';
import { IFBDelayAsync, IFBWaitForSecondsAsync } from './ifb-utilz/IFBAsyncs';
import { AppConfigInstance } from './AppConfig';
import { GuessNLearnFirstRC, GuessNLearnFirstRCProps } from './ui-components/GuessNLearnFirstRC';
import { GuessNLearnSecondRC } from './ui-components/GuessNLearnSecondRC';
import { GuessNLearnThirdRC } from './ui-components/GuessNLearnThirdRC';
import { GuessNLearnFourRC } from './ui-components/GuessNLearnFourRC';
import { GameServiceInstance } from './game/GameService';

function App()
{
    const [isLoading, setIsLoading] = useState(true);

    //useEffect это монтирование и демонтирование, вызывается 1 раз (не в дев режиме)
    useEffect(() => {        

        GameServiceInstance.InitYandexSdk().then(() => console.log("inited!"));

        const onLoadingScreenStart = () => {
            setIsLoading(true);
        };

        const onLoadingScreenDone = () => {
            IFBWaitForSecondsAsync(AppConfigInstance.loadingScreenAdditionalTime).then(() => {
                setIsLoading(false);
            });
        }

        EventBus.on(GameEvents.LOADING_SCREEN_START, onLoadingScreenStart);
        EventBus.on(GameEvents.LOADING_SCREEN_DONE, onLoadingScreenDone); 

        return () => {
            EventBus.off(GameEvents.LOADING_SCREEN_START, onLoadingScreenStart);
            EventBus.off(GameEvents.LOADING_SCREEN_DONE, onLoadingScreenDone);
        }
    }, []); // пустой массив зависимостей — эффект сработает один раз при монтировании
            // в массив можно положить стейты, тогда useEffect будет срабатывать при их изменении

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const setSceneAction = (key: string) => {
        phaserRef.current?.setScene(key)
    }

    const [currentSceneKey, setCurrentSceneKey] = useState<string>("");

    const gnlGameFirstProps: GuessNLearnFirstRCProps = {
        onBackClickAction: () => {
          
        },
        setSceneAction: setSceneAction
    };

    const componentsMap: { [key: string]: React.ReactNode } = {
        [SceneNames.GAME_GUESS_N_LEARN_0] : <GuessNLearnFirstRC {...gnlGameFirstProps} />,
        [SceneNames.GAME_GUESS_N_LEARN_1] : <GuessNLearnSecondRC {...{
            onBackClickAction: () => { setSceneAction(SceneNames.GAME_GUESS_N_LEARN_0) },
            onNextClickAction: () => { setSceneAction(SceneNames.GAME_GUESS_N_LEARN_2) },
            setSceneAction: setSceneAction
        }} />,
        [SceneNames.GAME_GUESS_N_LEARN_2] : <GuessNLearnThirdRC {...{ setSceneAction: setSceneAction, goToMainMenuAction: () => { setSceneAction(SceneNames.GAME_GUESS_N_LEARN_0) } }} />,
        [SceneNames.GAME_GUESS_N_LEARN_3] : <GuessNLearnFourRC {...{ setSceneAction: setSceneAction, goToMainMenuAction: () => { setSceneAction(SceneNames.GAME_GUESS_N_LEARN_0) } }} />,
    };

    // Event emitted from the PhaserGame component
    const handleCurrentSceneChanged = (scene: Phaser.Scene) => {

        const sceneKey = scene.scene.key;
        IFB_LOG("APP_TSX sceneKey changed: " + sceneKey)
        setCurrentSceneKey(sceneKey);
    }
 
    return (
        <div id="app" className="realtive w-full h-full">
            <PhaserGame ref={phaserRef} currentActiveScene={handleCurrentSceneChanged} />
            <LoadingOverlayRC {...{isShow: isLoading}} />
            <div className="absolute inset-0">    
                {componentsMap[currentSceneKey] ?? null}
            </div>    
        </div>
    )
}

export default App
