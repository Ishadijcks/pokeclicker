import {
    Observable as KnockoutObservable,
    Computed as KnockoutComputed,
} from 'knockout';

// For helper functions that may be needed across all files
// TODO: Convert this to not be a class after everything is TS modules
export default class GameHelper {
    public static counter = 0;
    public static currentTime: KnockoutObservable<Date> = ko.observable(new Date());
    public static tomorrow: Date = GameHelper.getTomorrow();

    public static msUntilTomorrow: KnockoutComputed<number>
    = ko.pureComputed<number>(() => Number(GameHelper.tomorrow) - Number(GameHelper.currentTime()));

    public static formattedTimeUntilTomorrow: KnockoutComputed<string>
    = ko.pureComputed<string>(() => {
        let milliseconds = GameHelper.msUntilTomorrow();
        const hours = Math.floor(milliseconds / GameHelper.MS_IN_HOUR);
        milliseconds -= hours * GameHelper.MS_IN_HOUR;
        const minutes = Math.floor(milliseconds / GameHelper.MS_IN_MIN);
        return `${hours}:${GameHelper.twoDigitNumber(minutes)}`;
    });

    public static formattedLetterTimeUntilTomorrow: KnockoutComputed<string>
    = ko.pureComputed<string>(() => {
        let milliseconds = GameHelper.msUntilTomorrow();
        const hours = Math.floor(milliseconds / GameHelper.MS_IN_HOUR);
        milliseconds -= hours * GameHelper.MS_IN_HOUR;
        const minutes = Math.floor(milliseconds / GameHelper.MS_IN_MIN);
        return `${hours}h${GameHelper.twoDigitNumber(minutes)}m`;
    });

    private static readonly MS_IN_MIN = 1000 * 60;
    private static readonly MS_IN_HOUR = GameHelper.MS_IN_MIN * 60;

    public static incrementObservable(obs: KnockoutObservable<number>, amt = 1): void {
        if (typeof obs !== 'function') { return; }
        const trueAmount = (Number.isNaN(amt) || amt === 0) ? 1 : amt;
        obs(obs() + trueAmount);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static enumLength(enumerable: any): number {
        return Object.keys(enumerable).length / 2;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static enumStrings(enumerable: any): string[] {
        return Object.keys(enumerable).filter((k) => Number.isNaN(Number(k)));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public static enumNumbers(enumerable: any): number[] {
        return Object.keys(enumerable).map(Number).filter((k) => !Number.isNaN(k));
    }

    // default value as a function so objects/arrays as defaults creates a new one for each key
    public static objectFromEnumStrings<T extends {}, V>(enumerable: T, defaultValue: () => V): Record<keyof T, V> {
        return (this.enumStrings(enumerable).reduce((keys, type) => ({ ...keys, [type]: defaultValue() }), {}) as Record<keyof T, V>);
    }

    public static tick(): void {
        this.counter = 0;
        this.updateTime();
    }

    public static updateTime(): void {
        const now = new Date();
        if (now.getDate() === GameHelper.tomorrow.getDate()) {
            GameHelper.tomorrow = GameHelper.getTomorrow();
        }
        GameHelper.currentTime(new Date());
    }

    public static formatAmount(n: number): string {
        if (n >= 1e9) { return `${Math.floor(n / 1e9)}b`; }
        if (n >= 1e6) { return `${Math.floor(n / 1e6)}m`; }
        if (n >= 1e3) { return `${Math.floor(n / 1e3)}k`; }
        return `${n}`;
    }

    public static getIndexFromDistribution(a: number[]): number {
        const rand = Math.random();
        for (let i = 0; i < a.length; i += 1) {
            if (rand <= a[i]) {
                return i;
            }
        }
        // If none matched for whatever reason (should never happen) return the
        // last index
        return a.length - 1;
    }

    public static createArray(start: number, max: number, step: number): Array<number> {
        const array = [];
        for (let i = start; i <= max; i += step) {
            array.push(i);
        }
        return array;
    }

    public static anOrA(name: string, capitalize = false): string {
        if (['a', 'e', 'i', 'o', 'u'].includes(name[0].toLowerCase())) {
            return capitalize ? 'An' : 'an';
        }
        return capitalize ? 'A' : 'a';
    }

    public static shallowEqual(object1, object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        return keys1.every((key) => object1[key] === object2[key]);
    }

    // Find the largest integer between min and max that does not return true when passed to testTooHigh, using a binary search
    public static binarySearch(testTooHigh: (guess: number) => boolean, min: number, max: number): number {
        if (max - min <= 1) return min;

        const mid = Math.floor((max + min) / 2);
        const [newMin, newMax] = testTooHigh(mid) ? [min, mid] : [mid, max];

        return this.binarySearch(testTooHigh, newMin, newMax);
    }

    public static arrayEquals(a, b) {
        return Array.isArray(a)
            && Array.isArray(b)
            && a.length === b.length
            && a.every((val, index) => val === b[index]);
    }

    private static getTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0);
        tomorrow.setMinutes(0);
        tomorrow.setSeconds(0);
        tomorrow.setMilliseconds(0);
        return tomorrow;
    }

    private static twoDigitNumber(n: number): string {
        // For use in clocks / showing time
        // Turns 4 into 04, does nothing to 23, turns 173 into 73
        return (`0${n}`).slice(-2);
    }
}
