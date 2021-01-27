///<reference path="./ShopEntry.ts"/>

class Shops implements Feature {
    name = 'Shops';
    saveKey = 'shops';
    defaults: Record<string, any>;

    public shopEntries: Record<string, ShopEntryData>;

    constructor() {
        this.shopEntries = {};
        Object.keys(ShopEntriesList).forEach(shopEntry => {
            this.shopEntries[shopEntry] = new ShopEntryData();
        });
    }

    initialize() { }

    canAccess(): boolean {
        return true;
    }

    update(delta: number) {
    }

    lowerItemMultipliers(multiplierDecreaser: MultiplierDecreaser, amount = 1) {
        for (const obj in ShopEntriesList) {
            const shopEntry = ShopEntriesList[obj];
            shopEntry.decreasePriceMultiplier(amount, multiplierDecreaser);
        }
    }

    toJSON(): Record<string, any> {
        const json = {};
        json['shopEntries'] = {};
        Object.keys(this.shopEntries).forEach(shopEntry => {
            json['shopEntries'][shopEntry] = this.shopEntries[shopEntry].toJSON();
        });

        return json;
    }

    fromJSON(json: Record<string, any>) {
        if (!json) {
            return;
        }
        if (json.hasOwnProperty('shopEntries')) {
            Object.keys(this.shopEntries).forEach(shopEntry => {
                if (json.shopEntries.hasOwnProperty(shopEntry)) {
                    this.shopEntries[shopEntry].fromJSON(json.shopEntries[shopEntry]);
                }
            });
        }
    }

}

const ShopEntriesList: { [name: string]: ShopEntry } = {};
