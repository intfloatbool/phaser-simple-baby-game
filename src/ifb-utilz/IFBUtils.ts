export function IFBStringIsNullUndefinedOrEmpty(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0;
}

export function IFBShuffleArray<T>(arr: Array<T>) {
    return arr.sort(() => Math.random() - 0.5);
}

export function IFBGetRandomElementFromArray<T>(arr: Array<T>) {
    return arr[Math.floor(Math.random() * arr.length)];
}