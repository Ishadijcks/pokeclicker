///<reference path="./Item.ts"/>

class Items implements Feature {
    name = 'Items';
    saveKey = 'items';
    defaults: Record<string, any>;

    public itemList: Record<string, ItemData>;

    constructor() {
        this.itemList = {};
        Object.keys(ItemList).forEach(item => {
            this.itemList[item] = new ItemData(ItemList[item].initialValue, ItemList[item].initialUnlocked);
        });
    }

    initialize() { }

    canAccess(): boolean {
        return true;
    }

    update(delta: number) {
    }

    toJSON(): Record<string, any> {
        const json = {};
        json['itemList'] = {};
        Object.keys(this.itemList).forEach(item => {
            json['itemList'][item] = this.itemList[item].toJSON();
        });

        return json;
    }

    fromJSON(json: Record<string, any>) {
        if (!json) {
            return;
        }
        if (json.hasOwnProperty('itemList')) {
            Object.keys(this.itemList).forEach(itemList => {
                if (json.itemList.hasOwnProperty(itemList)) {
                    this.itemList[itemList].fromJSON(json.itemList[itemList]);
                }
            });
        }
    }

}

