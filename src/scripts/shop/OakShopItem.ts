///<reference path="../oakItems/OakItems.ts"/>
///<reference path="./Shops.ts"/>

class OakShopItem extends ShopEntry {

    constructor(
        name: string,
        public item: OakItems.OakItem,
        basePrice: number,
        currency: GameConstants.Currency = GameConstants.Currency.money
    ) {
        super(name, basePrice, currency, { maxAmount: 1 });
    }

    buy(amount: number): number {
        const boughtAmount = super.buy(amount);
        if (boughtAmount) {
            const oakItem = App.game.oakItems.itemList[this.item];
            if (oakItem instanceof BoughtOakItem) {
                oakItem.purchased = true;
            }
        }
        return boughtAmount;
    }

    get displayName(): string {
        return App.game.oakItems.itemList[this.item].displayName;
    }
    get description(): string {
        return App.game.oakItems.itemList[this.item].description;
    }
    get image(): string {
        return `assets/images/oakitems/${OakItems.OakItem[this.item]}.png`;
    }

}

ShopEntriesList['Squirtbottle'] = new OakShopItem('Squirtbottle', OakItems.OakItem.Squirtbottle, 5000, Currency.farmPoint);
ShopEntriesList['Sprinklotad'] = new OakShopItem('Sprinklotad', OakItems.OakItem.Sprinklotad, 10000, Currency.farmPoint);
ShopEntriesList['Explosive Charge'] = new OakShopItem('Explosive Charge', OakItems.OakItem.Explosive_Charge, 5000, Currency.questPoint);
ShopEntriesList['Treasure Scanner'] = new OakShopItem('Treasure Scanner', OakItems.OakItem.Treasure_Scanner, 5000, Currency.questPoint);
