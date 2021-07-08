///<reference path="../shop/ShopHandler.ts"/>

/**
 * Source event for decreasing shop multipliers
 */
enum MultiplierDecreaser {
    Battle = 0,
    Berry,
}

/**
 * Additional shop options for an item
 */
interface ShopOptions {
    saveName?: string,
    maxAmount?: number,
    multiplier?: number,
    multiplierDecrease?: boolean,
    multiplierDecreaser?: MultiplierDecreaser,
}

class Item {
    saveName: string;
    type: any;

    // Shop Details
    price: KnockoutObservable<number>;
    multiplier: number;
    multiplierDecrease: boolean;
    multiplierDecreaser: MultiplierDecreaser;

    maxAmount: number;
    description?: string;
    _displayName: string;
    imageDirectory?: string;

    constructor(
        public name: string,
        public basePrice: number,
        public currency: GameConstants.Currency = GameConstants.Currency.money,
        {
            saveName = '',
            maxAmount = Number.MAX_SAFE_INTEGER,
            multiplier = GameConstants.ITEM_PRICE_MULTIPLIER,
            multiplierDecrease = true,
            multiplierDecreaser = MultiplierDecreaser.Battle,
        } : ShopOptions = {},
        displayName?: string,
        description?: string,
        imageDirectory?: string) {

        this.price = ko.observable(this.basePrice);
        // If no custom save name specified, default to item name
        this.saveName = saveName || name || `${name}|${GameConstants.Currency[currency]}`;
        this.maxAmount = maxAmount || Number.MAX_SAFE_INTEGER;
        // Multiplier needs to be above 1
        this.multiplier = Math.max(1, multiplier || GameConstants.ITEM_PRICE_MULTIPLIER);
        this.multiplierDecrease = multiplierDecrease;
        this.multiplierDecreaser = multiplierDecreaser || MultiplierDecreaser.Battle;
        if (!ItemList[this.saveName]) {
            ItemList[this.saveName] = this;
        }

        this._displayName = displayName ?? name;
        this.description = description;
        this.imageDirectory = imageDirectory;
    }

    totalPrice(amount: number): number {
        if (this.name == GameConstants.Pokeball[GameConstants.Pokeball.Pokeball]) {
            return Math.max(0, this.basePrice * amount);
        } else {
            // multiplier should be capped at 100, so work out how many to buy at increasing price and how many at max
            //    (m_start) * (m^k) = 100
            // => k = (2 - log(m_start)) / log(m)
            const mStart = Math.max(player.itemMultipliers[this.saveName] || 1, 1);
            const k = (mStart < 100)
                ? Math.ceil((2 - Math.log10(mStart)) / Math.log10(this.multiplier))
                : 0;
            const incAmount = Math.min(k, amount);

            const incCost = (this.price() * (1 - Math.pow(this.multiplier, incAmount))) / (1 - this.multiplier);
            const maxCost = (this.basePrice * 100 * (amount - incAmount));
            const total = incCost + maxCost;

            return Math.max(0, Math.floor(total));
        }
    }

    buy(n: number) {
        if (n <= 0) {
            return;
        }

        if (n > this.maxAmount) {
            Notifier.notify({
                message: `You can only buy ${this.maxAmount} &times; ${GameConstants.humanifyString(this.name)}!`,
                type: NotificationConstants.NotificationOption.danger,
            });
            n = this.maxAmount;
        }

        if (!this.isAvailable()) {
            Notifier.notify({
                message: `${GameConstants.humanifyString(this.name)} is sold out!`,
                type: NotificationConstants.NotificationOption.danger,
            });
            return;
        }

        const multiple = n > 1 ? 's' : '';

        if (App.game.wallet.hasAmount(new Amount(this.totalPrice(n), this.currency))) {
            App.game.wallet.loseAmount(new Amount(this.totalPrice(n), this.currency));
            this.gain(n);
            this.increasePriceMultiplier(n);
            Notifier.notify({
                message: `You bought ${n} ${GameConstants.humanifyString(this.name)}${multiple}`,
                type: NotificationConstants.NotificationOption.success,
            });
        } else {
            let curr = GameConstants.camelCaseToString(GameConstants.Currency[this.currency]);
            switch (this.currency) {
                case GameConstants.Currency.money:
                    break;
                default:
                    curr += 's';
                    break;
            }
            Notifier.notify({
                message: `You don't have enough ${curr} to buy ${n} ${GameConstants.humanifyString(this.name) + multiple}`,
                type: NotificationConstants.NotificationOption.danger,
            });
        }
    }

    gain(n: number) {
        player.gainItem(this.name, n);
    }

    use(): boolean {
        return false;
    }

    isAvailable(): boolean {
        return true;
    }

    increasePriceMultiplier(amount = 1) {
        player.itemMultipliers[this.saveName] = Math.min(100, (player.itemMultipliers[this.saveName] || 1) * Math.pow(this.multiplier, amount));
        this.price(Math.round(this.basePrice * player.itemMultipliers[this.saveName]));
    }

    decreasePriceMultiplier(amount = 1, multiplierDecreaser: MultiplierDecreaser) {
        if (!this.multiplierDecrease) {
            return;
        }
        if (this.multiplierDecreaser !== multiplierDecreaser) {
            return;
        }
        player.itemMultipliers[this.saveName] = Math.max(1, (player.itemMultipliers[this.saveName] || 1) / Math.pow(this.multiplier, amount));
        this.price(Math.round(this.basePrice * player.itemMultipliers[this.saveName]));
    }

    get displayName() {
        return GameConstants.humanifyString(this._displayName);
    }

    get image() {
        const subDirectory = this.imageDirectory ? `${this.imageDirectory}/` : '';
        return `assets/images/items/${subDirectory}${this.name}.png`;
    }

}

const ItemList: { [name: string]: Item } = {};

ItemList['Eject_button'] = new Item('Eject_button', Infinity, undefined, {}, 'Eject Button');
ItemList['Lucky_punch'] = new Item('Lucky_punch', Infinity, undefined, {}, 'Lucky Punch');
ItemList['Macho_brace'] = new Item('Macho_brace', Infinity, undefined, {}, 'Macho Brace');
ItemList['Metronome'] = new Item('Metronome', Infinity, undefined, {}, 'Metronome');
ItemList['Ring_target'] = new Item('Ring_target', Infinity, undefined, {}, 'Ring Target');
