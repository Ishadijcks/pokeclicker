/**
 * Static class as an API for handling items.
 */
class BagHandler {

    /**
     * Gets the display name for the item
     * @param item The item identifier
     */
    public static displayName(item: BagItem): string {
        if (!item) {
            return '';
        }
        switch (item.type) {
            case ItemType.item:
                return this.getItem(item.id).displayName;
            case ItemType.underground:
                return this.getUndergroundItem(item.id).displayName;
            case ItemType.berry:
                return `${BerryType[this.getBerry(item.id)]} Berry`;
            case ItemType.shard:
                return `${PokemonType[this.getShard(item.id)]} Shard`;
            case ItemType.machine:
                return this.getMachine(item.id).name;
        }
    }

    /**
     * Gets the image path for the item
     * @param item The item identifier
     */
    public static image(item: BagItem): string {
        if (!item) {
            return '';
        }
        switch (item.type) {
            case ItemType.item:
                return this.getItem(item.id).imagePath;
            case ItemType.underground:
                return this.getUndergroundItem(item.id).imagePath;
            case ItemType.berry:
                return FarmController.getBerryImage(this.getBerry(item.id));
            case ItemType.shard:
                return Shards.image(this.getShard(item.id));
            case ItemType.machine:
                return this.getMachine(item.id).image;
        }
    }

    /**
     * Gets the amount observable for the item. NOTE: You shouldn't use this to modify the amount, as there might
     * be some additional code that needs to be run via the base gainItem API calls. Use BagHandler.gainItem instead.
     * @param item The item identifier
     */
    public static amount(item: BagItem): KnockoutObservable<number> {
        if (!item) {
            return null;
        }
        switch (item.type) {
            case ItemType.item:
                return player.itemList[this.getItem(item.id).name()];
            case ItemType.underground:
                const mineItem = player.mineInventory()[player.mineInventoryIndex(this.getUndergroundItem(item.id).id)];
                return mineItem ? mineItem.amount : ( () => 0 );
            case ItemType.berry:
                return App.game.farming.berryList[this.getBerry(item.id)];
            case ItemType.shard:
                return App.game.shards.shardWallet[this.getShard(item.id)];
            case ItemType.machine:
                return this.getMachine(item.id)._amount;
        }
    }

    /**
     * Handles updating the amount for an item. This should be used instead of modifying the amount observable
     * directly, as the base method might have additional handling.
     * @param item The item identifier
     * @param amount The amount to be added to the Bag. Defaults to 1.
     */
    public static gainItem(item: BagItem, amount = 1): void {
        if (!item) {
            return;
        }
        switch (item.type) {
            case ItemType.item:
                this.getItem(item.id).gain(amount);
                return;
            case ItemType.underground:
                Underground.gainMineItem(this.getUndergroundItem(item.id).id, amount);
                return;
            case ItemType.berry:
                App.game.farming.gainBerry(this.getBerry(item.id), amount);
                return;
            case ItemType.shard:
                App.game.shards.gainShards(amount, this.getShard(item.id));
                return;
            case ItemType.machine:
                this.getMachine(item.id).amount += amount;
                return;
        }
    }

    //#region Item getters

    private static getItem(id: string | number): Item {
        return ItemList[id];
    }

    private static getUndergroundItem(id: string | number): UndergroundItem {
        if (typeof id === 'string') {
            return Underground.getMineItemByName(id);
        } else {
            return Underground.getMineItemById(id);
        }
    }

    private static getBerry(id: string | number): BerryType {
        if (typeof id === 'string') {
            id = App.game.farming.berryData.findIndex((_, idx) => BerryType[idx] === id);
        }
        return id;
    }

    private static getShard(id: string | number): PokemonType {
        if (typeof id === 'string') {
            id = <number>PokemonType[id];
        }
        return id;
    }

    private static getMachine(id: string | number): Machine {
        if (typeof id === 'string') {
            id = <number>Lab.Machine[id];
        }
        return App.game.lab.machines[id];
    }

    //#endregion

}
