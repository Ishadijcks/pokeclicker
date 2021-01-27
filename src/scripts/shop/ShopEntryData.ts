
class ShopEntryData implements Saveable {
    saveKey = 'shopEntry';

    defaults = {
        currentMultiplier: 1,
        amountPurchased: 0,
    }

    public currentMultiplier: KnockoutObservable<number>;
    public amountPurchased: KnockoutObservable<number>;

    constructor() {
        this.currentMultiplier = ko.observable(this.defaults.currentMultiplier);
        this.amountPurchased = ko.observable(this.defaults.amountPurchased);
    }

    toJSON(): Record<string, any> {
        return {
            currentMultiplier: this.currentMultiplier(),
            amountPurchased: this.amountPurchased(),
        };
    }
    fromJSON(json: Record<string, any>): void {
        if (!json) {
            this.currentMultiplier(this.defaults.currentMultiplier);
            this.amountPurchased(this.defaults.amountPurchased);
        } else {
            this.currentMultiplier(json.hasOwnProperty('currentMultiplier') ? json['currentMultiplier'] : this.defaults.currentMultiplier);
            this.amountPurchased(json.hasOwnProperty('amountPurchased') ? json['amountPurchased'] : this.defaults.amountPurchased);
        }
    }
}
