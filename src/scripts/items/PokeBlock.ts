class PokeBlock extends Item {

    type: GameConstants.PokeBlockColor;

    constructor(color: GameConstants.PokeBlockColor, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.money) {
        super(`PokeBlock_${GameConstants.PokeBlockColor[color]}`, basePrice, currency);
        this.type = color;
    }
}

ItemList['PokeBlock_Black']  = new PokeBlock(GameConstants.PokeBlockColor.Black, Infinity);
ItemList['PokeBlock_Red']    = new PokeBlock(GameConstants.PokeBlockColor.Red, Infinity);
ItemList['PokeBlock_Gold']   = new PokeBlock(GameConstants.PokeBlockColor.Gold, Infinity);
ItemList['PokeBlock_Purple'] = new PokeBlock(GameConstants.PokeBlockColor.Purple, Infinity);
ItemList['PokeBlock_Gray']   = new PokeBlock(GameConstants.PokeBlockColor.Gray, Infinity);
ItemList['PokeBlock_White']  = new PokeBlock(GameConstants.PokeBlockColor.White, Infinity);
