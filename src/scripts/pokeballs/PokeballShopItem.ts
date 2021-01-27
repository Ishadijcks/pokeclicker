

class PokeballShopItem extends ShopItem {

    /**
     * Gain the associated item
     * @param amount The amount to gain
     */
    gain(amount: number) {
        super.gain(amount);
        GameHelper.incrementObservable(App.game.statistics.pokeballsBought[(<Pokeball> this.item).type], amount);
    }

}

ShopEntriesList['Pokeball'] = new PokeballShopItem('Pokeball', ItemList['Pokeball'], 100, Currency.money, { multiplier: 1 });
ShopEntriesList['Greatball'] = new PokeballShopItem('Greatball', ItemList['Greatball'], 500);
ShopEntriesList['Ultraball'] = new PokeballShopItem('Ultraball', ItemList['Ultraball'], 2000);
ShopEntriesList['Masterball'] = new PokeballShopItem('Masterball', ItemList['Masterball'], 10000000, GameConstants.Currency.money, { multiplier: 1.35, multiplierDecrease: false });
ShopEntriesList['Masterball DT'] = new PokeballShopItem('Masterball DT', ItemList['Masterball'], 75000, GameConstants.Currency.dungeonToken, { multiplier: 1.35, multiplierDecrease: false });
ShopEntriesList['Masterball QP'] = new PokeballShopItem('Masterball QP', ItemList['Masterball'], 3000, GameConstants.Currency.questPoint, { multiplier: 1.35, multiplierDecrease: false });
ShopEntriesList['Masterball FP'] = new PokeballShopItem('Masterball FP', ItemList['Masterball'], 3000, GameConstants.Currency.farmPoint, { multiplier: 1.35, multiplierDecrease: false });
ShopEntriesList['Masterball D'] = new PokeballShopItem('Masterball D', ItemList['Masterball'], 50, GameConstants.Currency.diamond, { multiplier: 1.35, multiplierDecrease: false });

ShopEntriesList['Ultraball BP'] = new PokeballShopItem('Ultraball BP', ItemList['Ultraball'], 1, Currency.battlePoint);
ShopEntriesList['Masterball BP'] = new PokeballShopItem('Masterball BP', ItemList['Masterball'], 500, Currency.battlePoint, { multiplier: 1.35, multiplierDecrease: false });
