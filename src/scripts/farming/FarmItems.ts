///<reference path="../items/Item.ts"/>
///<reference path="./MulchType.ts"/>
///<reference path="../shop/Shops.ts"/>
///<reference path="../shop/ShopItem.ts"/>

class Mulch extends Item {
    type: MulchType;

    constructor(type: MulchType, displayName: string, description: string) {
        super(MulchType[type], {displayName: displayName, description: description, imageDirectory: 'farm' });
        this.type = type;
    }

}

ItemList['Boost_Mulch']   = new Mulch(MulchType.Boost_Mulch, 'Boost Mulch', 'Increases Berry growth rate.');
ItemList['Rich_Mulch']  = new Mulch(MulchType.Rich_Mulch, 'Rich Mulch', 'Increases Berry harvest rate.');
ItemList['Surprise_Mulch']  = new Mulch(MulchType.Surprise_Mulch, 'Surprise Mulch', 'Increases Berry mutation rate.');
ItemList['Amaze_Mulch'] = new Mulch(MulchType.Amaze_Mulch, 'Amaze Mulch', 'Increases all Berry effects.');

ShopEntriesList['Boost Mulch']      = new ShopItem('Boost Mulch', ItemList['Boost_Mulch'], 50, Currency.farmPoint, { multiplierDecreaser: MultiplierDecreaser.Berry });
ShopEntriesList['Rich Mulch']       = new ShopItem('Rich Mulch', ItemList['Rich_Mulch'], 100, Currency.farmPoint, { multiplierDecreaser: MultiplierDecreaser.Berry });
ShopEntriesList['Surprise Mulch']   = new ShopItem('Surprise Mulch', ItemList['Surprise_Mulch'], 150, Currency.farmPoint, { multiplierDecreaser: MultiplierDecreaser.Berry });
ShopEntriesList['Amaze Mulch']      = new ShopItem('Amaze Mulch', ItemList['Amaze_Mulch'], 200, Currency.farmPoint, { multiplierDecreaser: MultiplierDecreaser.Berry });

ItemList['Berry_Shovel'] = new Item('Berry_Shovel', { displayName: 'Berry Shovel', description: 'Removes Berry Plants in the Farm.', imageDirectory: 'farm' });

ShopEntriesList['Berry Shovel'] = new ShopItem('Berry Shovel', ItemList['Berry_Shovel'], 300, Currency.farmPoint, { multiplierDecreaser: MultiplierDecreaser.Berry });
