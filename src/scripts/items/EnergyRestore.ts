///<reference path="Item.ts"/>
class EnergyRestore extends Item {

    type: GameConstants.EnergyRestoreSize;

    constructor(type: GameConstants.EnergyRestoreSize, displayName?: string) {
        super(GameConstants.EnergyRestoreSize[type], { displayName: displayName });
        this.type = type;
    }

    use(): boolean {
        if (this.amount() <= 0) {
            return false;
        }
        if (App.game.underground.energy === App.game.underground.getMaxEnergy()) {
            Notifier.notify({
                message: 'Your mining energy is already full!',
                type: NotificationConstants.NotificationOption.danger,
            });
            return false;
        }
        App.game.underground.gainEnergyThroughItem(this.type);
        this.gain(-1);
        return true;
    }

}

ItemList['SmallRestore']  = new EnergyRestore(GameConstants.EnergyRestoreSize.SmallRestore,'Small Restore');
ItemList['MediumRestore'] = new EnergyRestore(GameConstants.EnergyRestoreSize.MediumRestore, 'Medium Restore');
ItemList['LargeRestore']  = new EnergyRestore(GameConstants.EnergyRestoreSize.LargeRestore, 'Large Restore');

ShopEntriesList['Small Restore']  = new ShopItem('Small Restore', ItemList['SmallRestore'], 30000);
ShopEntriesList['Medium Restore'] = new ShopItem('Medium Restore', ItemList['MediumRestore'], 100000);
ShopEntriesList['Large Restore']  = new ShopItem('Large Restore', ItemList['LargeRestore'], 400000);

ShopEntriesList['Small Restore BP']  = new ShopItem('Small Restore BP', ItemList['SmallRestore'], 10, Currency.battlePoint);
ShopEntriesList['Medium Restore BP'] = new ShopItem('Medium Restore BP', ItemList['MediumRestore'], 20, Currency.battlePoint);
ShopEntriesList['Large Restore BP']  = new ShopItem('Large Restore BP', ItemList['LargeRestore'], 40, Currency.battlePoint);
