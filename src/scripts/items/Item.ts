
interface ItemOptions {
    description?: string,
    displayName?: string,
    imageDirectory?: string,
    initialValue?: number,
    initialUnlocked?: boolean,
}

class Item {

    _description?: string;
    _displayName: string;
    imageDirectory?: string;
    initialValue?: number;
    initialUnlocked?: boolean;

    constructor(
        public name: string,
        options?: ItemOptions
    ) {
        this._displayName = options?.displayName ?? name;
        this._description = options?.description;
        this.imageDirectory = options?.imageDirectory;
        this.initialValue = options?.initialValue;
        this.initialUnlocked = options?.initialUnlocked;
    }

    get amount(): KnockoutObservable<number> {
        return App.game.items.itemList[this.name].amount;
    }

    get unlocked(): KnockoutObservable<boolean> {
        return App.game.items.itemList[this.name].unlocked;
    }

    /**
     * Handles updating the amount
     * @param amount The amount to gain. Can be negative for removal
     */
    gain(amount: number) {
        GameHelper.incrementObservable(this.amount, amount);
        if (amount > 0) {
            this.unlock();
        }
    }

    unlock() {
        if (!this.unlocked()) {
            this.unlocked(true);
        }
    }

    use(): boolean {
        return true;
    }

    get displayName(): string {
        return GameConstants.humanifyString(this._displayName);
    }

    get description(): string {
        return this._description;
    }

    get image() {
        const subDirectory = this.imageDirectory ? `${this.imageDirectory}/` : '';
        return `assets/images/items/${subDirectory}${decodeURI(this.name)}.png`;
    }

}

const ItemList: { [name: string]: Item } = {};
