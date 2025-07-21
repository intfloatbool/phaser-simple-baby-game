import { Scene } from 'phaser';
import { IFB_LOG, SceneNames } from '../AppGlobals';
import { AppConfigInstance } from '../../AppConfig';
import { GameConfigInstance } from '../../GameConfig';

function normalizeAssetPath(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, "background");
        this.add.image(512, 384, 'black_bg');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('./assets');

        this.load.audio("music_0", normalizeAssetPath("/music/child-music-0.mp3"));
        this.load.audio("music_1", normalizeAssetPath("/music/child-music-1.mp3"));

        this.load.image("main-menu-bg-0", normalizeAssetPath("/main-menu/main-menu-bg-0.jpg"));
        
        for(const imageData of GameConfigInstance.preloadImageDataCollection){
            this.load.image(imageData.key, normalizeAssetPath(imageData.pathRelativeToAssets));
        }

        for(const soundData of GameConfigInstance.preloadSoundsCollection){
            IFB_LOG(`Load audio '${soundData.key}' , path: '${soundData.pathRelativeToAssets}'`)
            this.load.audio(soundData.key, normalizeAssetPath(soundData.pathRelativeToAssets));
            
        }

        this.load.atlas('bubbles', normalizeAssetPath('particles/bubbles.png'), normalizeAssetPath('particles/bubbles.json'));
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start(AppConfigInstance.firstSceneToLoadAfterPreloadKey);
        IFB_LOG("PRELOADER")
    }
}
