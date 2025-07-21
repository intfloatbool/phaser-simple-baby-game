import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { IFBVector2 } from '../../ifb-utilz/IFBMath';
import { IResizable, ResizableDataMementoResizable, ResizableGO, ResizeData } from '../../ifb-utilz/ResponseInterfaces';
import { IFB_LOG, PerfectScreenSize } from '../AppGlobals';
import { GameEvents } from '../GameConstants';

export class MainMenuOld extends Scene implements IResizable
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    //logoTween: Phaser.Tweens.Tween | null;

    private _logoBasePos: IFBVector2;

    private _titleBasePos: IFBVector2;

    private _isReady: boolean = false;
    private _resizables: IResizable[]
    private _resizableMemento: ResizableDataMementoResizable;

    constructor ()
    {
        super('MainMenuOld');
        const width = PerfectScreenSize.x;
        const height = PerfectScreenSize.y;

        this._logoBasePos = {
            x: width / 2,
            y: height / 2
        };

        this._titleBasePos = {
            x: width / 2,
            y: height / 2 + 150
        };

        this._resizableMemento = new ResizableDataMementoResizable();
        this._resizables = [
            this._resizableMemento
        ];
    }
    
    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(this._logoBasePos.x, this._logoBasePos.y, 'logo').setDepth(100);
        this.logo.name = "logo";
    

        this.title = this.add.text(this._titleBasePos.x, this._titleBasePos.y, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.title.name = "title";

       

        this._resizables.push(new ResizableGO(
            this._logoBasePos,

            {
                x:  this.logo.scaleX,
                y: this.logo.scaleY
            },

            (x, y) => {
                this.logo.setPosition(x, y);
            },
            (x, y) => {
                this.logo.setScale(x, y)
            },

            true
        ));

        this._resizables.push(new ResizableGO(
            this._titleBasePos,

            {
                x:  this.title.scaleX,
                y: this.title.scaleY
            },

            (x, y) => {
                this.title.setPosition(x, y);
            },
            (x, y) => {
                this.title.setScale(x, y)
            },

            true
        ));

        this._resizableMemento.tryRestoreResizing(this);
        this._isReady = true;
        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
    }

    onResize(resizeData: ResizeData): void {
        
        if(!this._isReady) {
            return;
        }

        this._resizables.forEach(rsz => rsz.onResize(resizeData));
    }
    
    changeScene ()
    {
        this.scene.start('Game');
    }
}
