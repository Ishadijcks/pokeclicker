
class ShopItem extends ShopEntry {

    constructor(
        name: string,
        public item: Item,
        basePrice: number,
        currency: GameConstants.Currency = GameConstants.Currency.money,
        options?: ShopOptions
    ) {
        super(name, basePrice, currency, options);
    }

    /**
     * Gain the associated item
     * @param amount The amount to gain
     */
    gain(amount: number) {
        super.gain(amount);
        this.item.gain(amount);
    }

    get displayName(): string {
        return this.item.displayName;
    }
    get description(): string {
        return this.item.description;
    }
    get image(): string {
        return this.item.image;
    }

}
