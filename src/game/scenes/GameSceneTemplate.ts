import { Scene } from "phaser";
import { IResizable, ResizableDataMementoResizable, ResizeData } from "../../ifb-utilz/ResponseInterfaces";
import { IFB_LOG, SceneNames } from "../AppGlobals";
import { EventBus } from "../EventBus";
import { GameEvents } from "../GameConstants";

export class GameSceneTemplate extends Scene implements IResizable {
    private _resizableMemento: ResizableDataMementoResizable;
    private _resizables: IResizable[];
    private _isReady: boolean = false;
    private _abortController: AbortController;
    private _isDone: boolean = false;

    constructor() {
        super("YOUR_KEY");
        this._resizableMemento = new ResizableDataMementoResizable();
        this._resizables = [
            this._resizableMemento
        ];
    }
    preload() {

    }
    create() {

        IFB_LOG(`SCENE '${this.scene.key}' create()`);

        this._isDone = false;
        if(this._abortController) {
            this._abortController.abort();
        }

        this._abortController = new AbortController();

        this.events.on("shutdown", this.onShutdown, this);

        EventBus.emit(GameEvents.CURRENT_SCENE_READY, this);
        EventBus.emit(GameEvents.LOADING_SCREEN_DONE);
        
        this._isReady = true;
    }

    onShutdown() {
        if(this._abortController) {
            this._abortController.abort();
        }
    }

    onResize(resizeData: ResizeData): void {
        
        if(!this._isReady) {
            return;
        }

        this._resizables.forEach(rsz => rsz.onResize(resizeData));
    }

    finish() {
        if(this._isDone) {
            return;
        }
        IFB_LOG("FINISH()");
        EventBus.emit(GameEvents.SUB_LEVEL_DONE);
        this._isDone = true;
    }

}