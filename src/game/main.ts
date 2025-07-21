import { AUTO, Game } from 'phaser';
import { isResizable } from '../ifb-utilz/ResponseInterfaces';
import { IFBDelayAsync, IFBOpCancelledException } from '../ifb-utilz/IFBAsyncs';
import { IFB_LOG_ERR, PerfectScreenSize } from './AppGlobals';
import { AppConfigInstance } from '../AppConfig';
import { IFB_HEX_COLORS } from '../ifb-utilz/IFBMath';

let resizeAbortController = new AbortController();

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: IFB_HEX_COLORS.BLACK,
    scene: AppConfigInstance.gameScenes,
};


const StartGame = (parent: string) => {

    const game = new Game({ ...config, parent });
    if(game) {

        if(game.scale) {
            onResize(game, game.scale.gameSize);
            game.scale.on("resize", ()=> {
                onResize(game, game.scale.gameSize);
            }, this);
        }
    }

    return game;
}

function onResize(game: Game, gameSize: Phaser.Structs.Size) {
    resizeAbortController.abort();
    resizeAbortController = new AbortController();
    const width = gameSize.width;
    const height = gameSize.height;
    
    const widthFactor = width / PerfectScreenSize.x;
    const heightFactor = height / PerfectScreenSize.y;

    game.scene.scenes.forEach((scene) => {
        if(isResizable(scene)) {
            IFBDelayAsync(0.25, resizeAbortController.signal).then(() => {
                scene.onResize({
                                perfectWidth: PerfectScreenSize.x,
                                perfectHeight: PerfectScreenSize.y,
                                currentWidth: width,
                                currentHeight: height,
                                widthFactor,
                                heightFactor                            
                            })
            }).catch(ex => {
                if(ex instanceof IFBOpCancelledException) {
                    return;
                }

                IFB_LOG_ERR(ex);
            });
        }
    });
}

export default StartGame;
