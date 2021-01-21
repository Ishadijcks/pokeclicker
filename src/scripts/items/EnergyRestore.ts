///<reference path="Item.ts"/>
class EnergyRestore extends Item {

    type: GameConstants.EnergyRestoreSize;

    constructor(type: GameConstants.EnergyRestoreSize, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.money, displayName?: string) {
        super(GameConstants.EnergyRestoreSize[type], basePrice, currency, undefined, displayName);
        this.type = type;
    }

    use(): boolean {
        if (player.itemList[this.name()]() <= 0) {
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
        player.loseItem(this.name(), 1);
        return true;
    }
}

ItemList['SmallRestore']  = new EnergyRestore(GameConstants.EnergyRestoreSize.SmallRestore, 30000, undefined, 'Small Restore');
ItemList['MediumRestore'] = new EnergyRestore(GameConstants.EnergyRestoreSize.MediumRestore, 100000, undefined, 'Medium Restore');
ItemList['LargeRestore']  = new EnergyRestore(GameConstants.EnergyRestoreSize.LargeRestore, 400000, undefined, 'Large Restore');
