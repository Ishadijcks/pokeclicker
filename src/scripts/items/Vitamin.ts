class Vitamin extends Item {
    type: GameConstants.VitaminType;

    constructor(type: GameConstants.VitaminType, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.money, options?: ShopOptions, displayName?: string) {
        super(GameConstants.VitaminType[type], basePrice, currency, options, displayName);
        this.type = type;
    }

    use() {
    }
}

function getVitaminNameByType(type: GameConstants.VitaminType) {
    switch (type) {
        case GameConstants.VitaminType.RareCandy:
            return 'RareCandy';
        case GameConstants.VitaminType.HpUp:
            return 'HpUp';
        case GameConstants.VitaminType.Protein:
            return 'Protein';
        case GameConstants.VitaminType.Iron:
            return 'Iron';
        case GameConstants.VitaminType.Calcium:
            return 'Calcium';
        case GameConstants.VitaminType.Zinc:
            return 'Zinc';
        case GameConstants.VitaminType.Carbos:
            return 'Carbos';
    }
}

ItemList.RareCandy = new Vitamin(
    GameConstants.VitaminType.RareCandy,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.1,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.RareCandy]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    },
    'Rare Candy'
);
ItemList.RareCandy.description = 'A rare to find candy that increases Pokemon attack bonus<br/><i>(attack gained per breeding cycle)</i>.';
ItemList.HpUp = new Vitamin(
    GameConstants.VitaminType.HpUp,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.05,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.HpUp]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    }
);
ItemList.HpUp.description = 'Increases Pokemon hp bonus<br/><i>(attack gained per breeding cycle)</i>';
ItemList.Protein = new Vitamin(
    GameConstants.VitaminType.Protein,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.05,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.Protein]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    }
);
ItemList.Protein.description = 'Increases Pokemon attack bonus<br/><i>(attack gained per breeding cycle)</i>';
ItemList.Iron = new Vitamin(
    GameConstants.VitaminType.Iron,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.05,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.Iron]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    }
);
ItemList.Iron.description = 'Increases Pokemon defense bonus<br/><i>(attack gained per breeding cycle)</i>';
ItemList.Calcium = new Vitamin(
    GameConstants.VitaminType.Calcium,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.05,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.Calcium]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    }
);
ItemList.Calcium.description = 'Increases Pokemon special attack bonus<br/><i>(attack gained per breeding cycle)</i>';
ItemList.Zinc = new Vitamin(
    GameConstants.VitaminType.Zinc,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.05,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.Zinc]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    }
);
ItemList.Zinc.description = 'Increases Pokemon special defense bonus<br/><i>(attack gained per breeding cycle)</i>';
ItemList.Carbos = new Vitamin(
    GameConstants.VitaminType.Carbos,
    1e4,
    GameConstants.Currency.money,
    {
        multiplier: 1.05,
        multiplierDecrease: false,
        saveName: `${GameConstants.VitaminType[GameConstants.VitaminType.Carbos]}|${GameConstants.Currency[GameConstants.Currency.money]}`,
    }
);
ItemList.Carbos.description = 'Increases Pokemon speed bonus<br/><i>(attack gained per breeding cycle)</i>';
