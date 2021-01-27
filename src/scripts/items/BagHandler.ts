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
                return ItemList[item.id].displayName;
            case ItemType.underground:
                return this.getUndergroundItem(item.id).displayName;
            case ItemType.berry:
                return ItemList[this.getBerryName(item.id)].displayName;
            case ItemType.shard:
                return ItemList[this.getShard(item.id)].displayName;
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
                return ItemList[item.id].image;
            case ItemType.underground:
                return this.getUndergroundItem(item.id).image;
            case ItemType.berry:
                return ItemList[this.getBerryName(item.id)].image;
            case ItemType.shard:
                return ItemList[this.getShard(item.id)].image;
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
                return ItemList[item.id].amount;
            case ItemType.underground:
                return player.mineInventory()[player.mineInventoryIndex(this.getUndergroundItem(item.id).id)].amount;
            case ItemType.berry:
                return ItemList[this.getBerryName(item.id)].amount;
            case ItemType.shard:
                return ItemList[this.getShard(item.id)].amount;
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
                ItemList[item.id].gain(amount);
                return;
            case ItemType.underground:
                Underground.gainMineItem(this.getUndergroundItem(item.id).id, amount);
                return;
            case ItemType.berry:
                ItemList[this.getBerryName(item.id)].gain(amount);
                return;
            case ItemType.shard:
                ItemList[this.getShard(item.id)].gain(amount);
                return;
        }
    }

    //#region Item getters

    private static getUndergroundItem(id: string | number): UndergroundItem {
        if (typeof id === 'string') {
            return Underground.getMineItemByName(id);
        } else {
            return Underground.getMineItemById(id);
        }
    }

    private static getBerryName(id: string | number): string {
        if (typeof id === 'string') {
            return id;
        }
        return BerryType[id];
    }

    private static getShard(id: string | number): string {
        if (typeof id === 'string') {
            return id;
        }
        return `${PokemonType[id]} Shard`;
    }

    //#endregion

}
