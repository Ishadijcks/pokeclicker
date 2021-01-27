

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
    maxAmount?: number,
    multiplier?: number,
    multiplierDecrease?: boolean,
    multiplierDecreaser?: MultiplierDecreaser,
    available?: OneFromManyRequirement | MultiRequirement | Requirement,
}

abstract class ShopEntry {

    defaults = {
        maxAmount: Number.MAX_SAFE_INTEGER,
        multiplier: GameConstants.ITEM_PRICE_MULTIPLIER,
        multiplierDecrease: true,
        multiplierDecreaser: MultiplierDecreaser.Battle,
    }

    public maxAmount?: number;
    public multiplier?: number;
    public multiplierDecrease?: boolean;
    public multiplierDecreaser?: MultiplierDecreaser;
    public available?: OneFromManyRequirement | MultiRequirement | Requirement;

    public price: KnockoutComputed<number>;

    constructor(
        public name: string,
        public basePrice: number,
        public currency: GameConstants.Currency = GameConstants.Currency.money,
        options?: ShopOptions
    ) {
        this.maxAmount = options?.maxAmount ?? this.defaults.maxAmount;
        this.multiplier = Math.max(1, options?.multiplier ?? this.defaults.multiplier);
        this.multiplierDecrease = options?.multiplierDecrease ?? this.defaults.multiplierDecrease;
        this.multiplierDecreaser = options?.multiplierDecreaser ?? this.defaults.multiplierDecreaser;
        this.available = options?.available;

        this.price = ko.pureComputed(() => {
            return this.basePrice * this.currentMultiplier();
        });
    }

    get currentMultiplier(): KnockoutObservable<number> {
        return App.game.shops.shopEntries[this.name].currentMultiplier;
    }

    get amountPurchased(): KnockoutObservable<number> {
        return App.game.shops.shopEntries[this.name].amountPurchased;
    }

    /**
     * Determines whether this ShopEntry is purchasable
     */
    isAvailable(): boolean {

        // Checking availability function
        if (this.available && !this.available.isCompleted()) {
            return false;
        }

        // Checking max amount
        if (this.maxAmount && this.amountPurchased() >= this.maxAmount) {
            return false;
        }

        return true;
    }

    /**
     * Calculates the total price given the amount, based on the multiplier price increase
     * @param amount The amount to be bought
     */
    totalPrice(amount: number): number {
        if (this.multiplier === 1) {
            return Math.max(0, this.basePrice * amount);
        } else {
            // multiplier caps at 100, so work out how many purchases are affected by increasing multipliers,
            // and how many are bought at max price.
            //    (currentMultiplier) * (multiplier^k) = 100
            // => k = (2 - log(currentMultiplier)) / log(multiplier)
            const mStart = this.currentMultiplier();
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

    /**
     * Purchases the ShopEntry
     * @param amount Amount to purchase
     * @return The amount actually purchased
     */
    buy(amount: number): number {
        // Sanity Check
        if (amount <= 0) {
            return 0;
        }

        // Limiting by maxAmount
        amount = Math.min(amount, this.maxAmount - this.amountPurchased());
        if (amount <= 0) {
            Notifier.notify({
                message: `You can only buy ${this.maxAmount} &times; ${this.displayName}!`,
                type: NotificationConstants.NotificationOption.danger,
            });
            return 0;
        }

        // Checking availablility
        if (!this.isAvailable()) {
            Notifier.notify({
                message: `${this.displayName} unavailable for purchase!`,
                type: NotificationConstants.NotificationOption.danger,
            });
            return 0;
        }

        const multiple = amount > 1 ? 's' : '';

        // Checking wallet
        if (App.game.wallet.hasAmount(new Amount(this.totalPrice(amount), this.currency))) {
            App.game.wallet.loseAmount(new Amount(this.totalPrice(amount), this.currency));
            this.gain(amount);
            this.increasePriceMultiplier(amount);
            Notifier.notify({
                message: `You bought ${amount} ${this.displayName}${multiple}`,
                type: NotificationConstants.NotificationOption.success,
            });
            return amount;
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
                message: `You don't have enough ${curr} to buy ${amount} ${this.displayName}${multiple}`,
                type: NotificationConstants.NotificationOption.danger,
            });
            return 0;
        }
    }

    /**
     * Gain the associated item
     * @param amount The amount to gain
     */
    gain(amount: number) {
        GameHelper.incrementObservable(this.amountPurchased, amount);
    }

    abstract get displayName(): string;

    abstract get description(): string;

    abstract get image(): string;

    /**
     * Increases the price multiplier
     * @param amount Amount to increase by
     */
    increasePriceMultiplier(amount = 1) {
        this.currentMultiplier(Math.min(100, this.currentMultiplier() * Math.pow(this.multiplier, amount)));
    }

    /**
     * Decreases the price multiplier
     * @param amount Amount to decrease by
     * @param multiplierDecreaser The type of MultiplierDecreaser
     */
    decreasePriceMultiplier(amount = 1, multiplierDecreaser: MultiplierDecreaser) {
        if (!this.multiplierDecrease) {
            return;
        }
        if (this.multiplierDecreaser !== multiplierDecreaser) {
            return;
        }
        this.currentMultiplier(Math.max(1, (this.currentMultiplier() / Math.pow(this.multiplier, amount))));
    }

}
