import React, { Children, forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from './game/main';
import { EventBus } from './game/EventBus';
import { GameEvents, IFB_LOG, SceneNames } from './game/AppGlobals';

export interface IRefPhaserGame
{
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
    setScene: (key: string) => void;
}

interface IProps
{
    currentActiveScene?: (scene_instance: Phaser.Scene) => void
    children?: React.ReactNode
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene, children }, ref)
{

    const [currentSceneKey, setCurrentSceneKey] = useState<string>("");
    const currentSceneKeyRef = useRef(currentSceneKey);
    useEffect(() => {
        currentSceneKeyRef.current = currentSceneKey;
    }, [currentSceneKey]);

    const game = useRef<Phaser.Game | null>(null!);
    const setLoadingScreen = (isLoading: boolean) => {
        const ev = isLoading ? GameEvents.LOADING_SCREEN_START : GameEvents.LOADING_SCREEN_DONE;
        EventBus.emit(ev);
    };

    const setSceneWrapper = (game: Phaser.Game, key: string) => {
        setLoadingScreen(true);
        const currentKey = currentSceneKeyRef.current;
        if(currentKey && currentKey != "") {
            game.scene.stop(currentKey);
        }
        
        game.scene.start(key);
        setLoadingScreen(false);
    };

    useLayoutEffect(() =>
    {

        if (game.current === null)
        {
            const newGame = StartGame("game-container");
            game.current = newGame;
        
            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: null, setScene: (k) => {
                    setSceneWrapper(newGame, k);
                }});
            } else if (ref)
            {
                ref.current = { game: game.current, scene: null, setScene: (k) => {
                    setSceneWrapper(newGame, k);
                } };
            }

        }

        return () =>
        {
            if (game.current)
            {
                game.current.destroy(true);
                if (game.current !== null)
                {
                    game.current = null;
                }
            }
        }
    }, [ref]);

    useEffect(() =>
    {
        EventBus.on(GameEvents.CURRENT_SCENE_READY, (scene_instance: Phaser.Scene) =>
        {
            setCurrentSceneKey(scene_instance.scene.key);

            if (currentActiveScene && typeof currentActiveScene === 'function')
            {
                currentActiveScene(scene_instance);        
            }
            if (typeof ref === 'function')
            {
                ref({ game: game.current, scene: scene_instance, setScene: (key) => {
                    setSceneWrapper(game.current!, key);
                } });
            } else if (ref)
            {
                ref.current = { game: game.current, scene: scene_instance, setScene: (key) => {
                     setSceneWrapper(game.current!, key);
                } };
            }
            
        });
        return () =>
        {
            EventBus.removeListener(GameEvents.CURRENT_SCENE_READY);
        }
    }, [currentActiveScene, ref]);

    return (
        <div id="game-container">
            {children}
        </div>
    );

});
