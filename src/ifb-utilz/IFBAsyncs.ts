export class IFBOpCancelledException extends Error {};


export async function IFBCancellablePromiseVoidAsync(promise: Promise<void>): Promise<boolean> {
    try {
        await promise
        return false;
    } catch(ex) {
        if(IFBIsCancelledException(ex)) {
            return true;
        }
        throw ex;
    }
    return false;
}

export async function IFBCancellablePromiseAsync<T>(promise: Promise<T>, defaultValue: T): Promise<[boolean, T]> {
    try {
        const res = await promise;
        return [true, res];
    } catch(ex) {
        if(IFBIsCancelledException(ex)) {
            return [true, defaultValue];
        }
        throw ex;
    }
    return [false, defaultValue];
}

export const IFBIsCancelledException = (ex: any): boolean => ex instanceof IFBOpCancelledException;

export const IFBDelayAsync = (delayTimeSeconds: number, signal: AbortSignal) => {
    return new Promise<void>((res, rej) => {
        signal.addEventListener("abort", () => {
            const ex = new IFBOpCancelledException();
            rej(ex);
            return;
        });
        setTimeout(() => {
            if(signal.aborted) {
                const ex = new IFBOpCancelledException();
                rej(ex);
                return;
            }
            res();
        }, delayTimeSeconds * 1000);
    })
}

export const IFBDelayAsyncNonAbortable = (delayTimeSeconds: number) => {
    return new Promise<void>((res) => {
        setTimeout(() => {
            res();
        }, delayTimeSeconds * 1000);
    })
}

export const IFBWaitForSecondsAsync = (delayTimeSeconds: number) => IFBDelayAsyncNonAbortable(delayTimeSeconds);