///<reference path="Item.ts"/>
///<reference path="../farming/MulchType.ts"/>

class MulchItem extends Item {
    type: MulchType;

    constructor(type: MulchType, basePrice: number, displayName: string, description: string) {
        super(MulchType[type], basePrice, GameConstants.Currency.farmPoint, { multiplierDecreaser: MultiplierDecreaser.Berry }, displayName, description);
        this.type = type;
    }

    gain(amt: number) {
        GameHelper.incrementObservable(App.game.farming.mulchList[this.type], amt);
    }
}

ItemList['Boost_Mulch']   = new MulchItem(MulchType.Boost_Mulch, 50, 'Boost Mulch', 'Increases Berry growth rate.');
ItemList['Rich_Mulch']  = new MulchItem(MulchType.Rich_Mulch, 100, 'Rich Mulch', 'Increases Berry harvest rate.');
ItemList['Surprise_Mulch']  = new MulchItem(MulchType.Surprise_Mulch, 150, 'Surprise Mulch', 'Increases Berry mutation rate.');
ItemList['Amaze_Mulch'] = new MulchItem(MulchType.Amaze_Mulch, 200, 'Amaze Mulch', 'Increases all Berry effects.');
