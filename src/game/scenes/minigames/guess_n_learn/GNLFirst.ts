import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../../../EventBus';
import { IFBVector2 } from '../../../../ifb-utilz/IFBMath';
import { IResizable, ResizableDataMementoResizable, ResizableGO, ResizeData } from '../../../../ifb-utilz/ResponseInterfaces';
import { GameEvents, GetCurrentScreenFactorFromScene, IFB_LOG, PerfectScreenSize, SceneNames } from '../../../AppGlobals';


type SceneBasePositions = {
    background: IFBVector2,
}

export class GNLFirst extends Scene implements IResizable
{
    private _background: GameObjects.Image;

    private _positions: SceneBasePositions

    private _isReady: boolean = false;
    private _resizables: IResizable[]
    private _resizableMemento: ResizableDataMementoResizable;

    private _isMusicRun: boolean;
    private _music: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    constructor ()
    {
        super(SceneNames.GAME_GUESS_N_LEARN_0);
        this._isMusicRun = false;
        const width = PerfectScreenSize.x;
        const height = PerfectScreenSize.y;

        this._positions = {
            background: {
                x: width / 2,
                y: height / 2
            },
        }
        this._resizableMemento = new ResizableDataMementoResizable();
        this._resizables = [
            this._resizableMemento
        ];
    }

    preload() {
        
    }
    
    create ()
    {
        IFB_LOG(SceneNames.GAME_GUESS_N_LEARN_0)
        this._background = this.add.image(this._positions.background.x, this._positions.background.y, "main-menu-bg-0");
        this._background.setScale(1, 1);

        this._resizables.push(new ResizableGO(
            this._positions.background,
            {
                x: this._background.scaleX,
                y: this._background.scaleY
            },

            (x, y) => {
                this._background.setPosition(x, y);
            },
            (x, y) => {
                this._background.setScale(x, y)
            },

            true
        ).resizeByCurrentScreenFactor(GetCurrentScreenFactorFromScene(this)));

    

        this._resizableMemento.tryRestoreResizing(this);
        this._isReady = true;
        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
        EventBus.emit(GameEvents.LOADING_SCREEN_DONE);

        if(this._isMusicRun === false) {
            const sound = this.sound.add("music_1", {volume: 0.6, loop: true});
            sound.play();
            this._music = sound;
            this._isMusicRun = true;
            EventBus.on("music_mute_option", (isMuted: boolean) => {
                this._music.mute = isMuted;
            });
        }
       
    }

    onResize(resizeData: ResizeData): void {
        
        if(!this._isReady) {
            return;
        }

        this._resizables.forEach(rsz => rsz.onResize(resizeData));
    }

}
