class PokeBlock extends Item {

    type: GameConstants.PokeBlockColor;

    constructor(color: GameConstants.PokeBlockColor) {
        super(`PokeBlock_${GameConstants.PokeBlockColor[color]}`);
        this.type = color;
    }

}

ItemList['PokeBlock_Black']  = new PokeBlock(GameConstants.PokeBlockColor.Black);
ItemList['PokeBlock_Red']    = new PokeBlock(GameConstants.PokeBlockColor.Red);
ItemList['PokeBlock_Gold']   = new PokeBlock(GameConstants.PokeBlockColor.Gold);
ItemList['PokeBlock_Purple'] = new PokeBlock(GameConstants.PokeBlockColor.Purple);
ItemList['PokeBlock_Gray']   = new PokeBlock(GameConstants.PokeBlockColor.Gray);
ItemList['PokeBlock_White']  = new PokeBlock(GameConstants.PokeBlockColor.White);
