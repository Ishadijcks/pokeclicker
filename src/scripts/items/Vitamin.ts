class Vitamin extends Item {
    type: GameConstants.VitaminType;

    constructor(type: GameConstants.VitaminType, displayName?: string, description?: string) {
        super(GameConstants.VitaminType[type], { displayName: displayName, description: description });
        this.type = type;
    }

}

ItemList.RareCandy = new Vitamin(GameConstants.VitaminType.RareCandy, 'Rare Candy', 'A rare to find candy that currently has no use.');
ItemList.Protein   = new Vitamin(GameConstants.VitaminType.Protein, undefined, 'Increases Pokemon attack bonus<br/><i>(attack gained per breeding cycle)</i>');

ShopEntriesList['Rare Candy'] = new ShopItem('Rare Candy', ItemList['RareCandy'], Infinity, Currency.money);
ShopEntriesList['Protein'] = new ShopItem('Protein', ItemList['Protein'], 10000, Currency.money, { multiplier: 1.1, multiplierDecrease: false });
