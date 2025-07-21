import { GameObjects } from "phaser";
import { IFBVector2 } from "./IFBMath";

export type ResizeData = {
    perfectWidth: number,
    perfectHeight: number,
    currentWidth: number,
    currentHeight: number,
    widthFactor: number,
    heightFactor: number
}

export interface IResizable {
    onResize(resizeData: ResizeData): void
}

export function isResizable(obj: any): obj is IResizable {
    return typeof obj.onResize === 'function';
}


export const DefaultGetPositionFunction = (transform: GameObjects.Components.Transform): IFBVector2 => {
    return {
        x: transform.x,
        y: transform.y
    }
}

export const DefaultGetScaleFunction = (transform: GameObjects.Components.Transform): IFBVector2 => {
    return {
        x: transform.scaleX,
        y: transform.scaleY
    }
}

export const DefaultSetPosAction = (transform: GameObjects.Components.Transform): (x: number, y: number) => void => {
    return (x,y) => {
        transform.setPosition(x, y);
    }
}

export const DefaultSetScaleAction = (transform: GameObjects.Components.Transform): (x: number, y: number) => void => {
    return (x,y) => {
        transform.setScale(x, y);
    }
}

export const CreateResiableGO = (initialPos: IFBVector2, initialScale: IFBVector2, setPosFunc: (x: number, y: number) => void, setScaleFunc: (x: number, y: number) => void, isAffectScale: boolean) => {
    return new ResizableGO(initialPos, initialScale, setPosFunc, setScaleFunc, isAffectScale);
}

export const CreateDefaultResizableGO = (transform: GameObjects.Components.Transform, screenFactor: IFBVector2, isScaleAffect?: boolean) => {
    return CreateResiableGO(
                    DefaultGetPositionFunction(transform),
                    DefaultGetScaleFunction(transform),
                    DefaultSetPosAction(transform),
                    DefaultSetScaleAction(transform),
                    isScaleAffect ?? false
                ).resizeByCurrentScreenFactor(screenFactor);
}

export class ResizableGO implements IResizable {

    private _setPositionFunc: (x: number, y: number) => void;
    private _setScaleFunc: (x: number, y: number) => void;

    private _initialPos: IFBVector2;
    private _initialScale: IFBVector2;

    private _isAffectScale: boolean;
    private _isOneDimensionalScaling: boolean;

    constructor(initialPos: IFBVector2, initialScale: IFBVector2, setPosFunc: (x: number, y: number) => void, setScaleFunc: (x: number, y: number) => void, isAffectScale: boolean) {
        this._setPositionFunc = setPosFunc;
        this._setScaleFunc = setScaleFunc;
        this._initialPos = initialPos;
        this._initialScale = initialScale;
        this._isAffectScale = isAffectScale;
    }

    public resizeByCurrentScreenFactor(screenFactor: IFBVector2): ResizableGO {
        this.resizeByWHFactor(screenFactor.x, screenFactor.y);

        return this;
    }

    public forceOneDimensionalScale() {
        this._isOneDimensionalScaling = true;
        return this;
    }

    public get initialPos() {
        return this._initialPos;
    }
    public set initialPos(v: IFBVector2) {
        this._initialPos = v;
    }

    public get initialScale() {
        return this._initialScale;
    }
    public set initialScale(v: IFBVector2) {
        this._initialScale = v;
    }

    onResize(resizeData: ResizeData): void {

        this.resizeByWHFactor(resizeData.widthFactor, resizeData.heightFactor);
    }

    resizeByWHFactor(widthFactor: number, heightFactor: number) {
        this._setPositionFunc(
            this._initialPos.x * widthFactor,
            this._initialPos.y * heightFactor,
        );
        
        if(!this._isAffectScale) {
            return;
        }

        if(this._isOneDimensionalScaling && this._isOneDimensionalScaling === true) {
            this._setScaleFunc(
                this._initialScale.x * widthFactor,
                this._initialScale.y * widthFactor,
            );

        } else {
            this._setScaleFunc(
                this._initialScale.x * widthFactor,
                this._initialScale.y * heightFactor,
            );
        }
        
    }
    
}

export class ResizableDataMementoResizable implements IResizable {

    private _lastResizeData?: ResizeData;

    tryRestoreResizing(resizable: IResizable) {
        if(!this._lastResizeData) {
           return
        }
        resizable.onResize(this._lastResizeData)
    }

    onResize(resizeData: ResizeData): void {
        this._lastResizeData = resizeData
    }
}