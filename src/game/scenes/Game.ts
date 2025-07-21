import { IFB_LOG } from '../AppGlobals';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameEvents } from '../GameConstants';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    preload() {
        // preload resources, calls before create()
        //this.load.image() // добавление ресурсов к load'у
        
        this.load.on("complete", () => {
            //IFB_LOG("GAME SCENE complete callback");
        } );

        this.load.start();
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameText = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
