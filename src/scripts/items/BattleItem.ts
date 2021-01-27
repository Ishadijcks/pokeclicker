///<reference path="Item.ts"/>
///<reference path="../shop/Shops.ts"/>
///<reference path="../shop/ShopItem.ts"/>
class BattleItem extends Item {

    type: GameConstants.BattleItemType;

    constructor(
        type: GameConstants.BattleItemType,
        description: string,
        displayName?: string,
        public multiplierType?: keyof typeof MultiplierType,
        public multiplyBy?: number
    ) {
        super(GameConstants.BattleItemType[type],{ displayName: displayName, description: description, imageDirectory: 'battleItem'});
        this.type = type;
    }

    use(): boolean {
        EffectEngineRunner.addEffect(this.name, ItemHandler.amountToUse);
        return true;
    }

}

ItemList['xAttack']         = new BattleItem(GameConstants.BattleItemType.xAttack, '+50% Bonus to Pokémon attack', undefined, 'pokemonAttack', 1.5);
ItemList['xClick']          = new BattleItem(GameConstants.BattleItemType.xClick, '+50% Bonus to click attack', undefined, 'clickAttack', 1.5);
ItemList['Lucky_egg']       = new BattleItem(GameConstants.BattleItemType.Lucky_egg, '+50% Bonus to experience gained', 'Lucky Egg', 'exp', 1.5);
ItemList['Token_collector'] = new BattleItem(GameConstants.BattleItemType.Token_collector, '+50% Bonus to dungeon tokens gained', 'Token Collector', 'dungeonToken', 1.5);
ItemList['Item_magnet']     = new BattleItem(GameConstants.BattleItemType.Item_magnet, '+50% Chance of gaining an extra item', 'Item Magnet');
ItemList['Lucky_incense']   = new BattleItem(GameConstants.BattleItemType.Lucky_incense, '+50% Bonus to money gained', 'Lucky Incense', 'money', 1.5);

ShopEntriesList['xAttack'] = new ShopItem('xAttack', ItemList['xAttack'], 600);
ShopEntriesList['xClick'] = new ShopItem('xClick', ItemList['xClick'], 400);
ShopEntriesList['Lucky Egg'] = new ShopItem('Lucky Egg', ItemList['Lucky_egg'], 800);
ShopEntriesList['Token Collector'] = new ShopItem('Token Collector', ItemList['Token_collector'], 1000);
ShopEntriesList['Item Magnet'] = new ShopItem('Item Magnet', ItemList['Item_magnet'], 1500);
ShopEntriesList['Lucky Incense'] = new ShopItem('Lucky Incense', ItemList['Lucky_incense'], 2000);
