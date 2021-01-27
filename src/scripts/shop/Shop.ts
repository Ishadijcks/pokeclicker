class Shop {

    constructor(
        public shopEntries: string[],
        public name?: string
    ) { }

    get shopItems(): ShopEntry[] {
        return this.shopEntries.map(entry => ShopEntriesList[entry]).filter(shopItem => !!shopItem);
    }
}

