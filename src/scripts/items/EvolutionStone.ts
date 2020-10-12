///<reference path="Item.ts"/>
class EvolutionStone extends Item {

    type: GameConstants.StoneType;

    constructor(type: GameConstants.StoneType, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.questPoint) {
        super(GameConstants.StoneType[type], basePrice, currency);
        this.type = type;
    }

    public gain(n: number) {
        player.gainItem(GameConstants.StoneType[this.type], n);
    }

    public use(pokemon?: string) {
        const partyPokemon: PartyPokemon = App.game.party.getPokemon(PokemonHelper.getPokemonByName(pokemon).id);
        const shiny = partyPokemon.useStone(this.type);
        return shiny;
    }
}

// TODO: Set prices for different kinds of stones
ItemList['Fire_stone']    = new EvolutionStone(GameConstants.StoneType.Fire_stone, 2500);
ItemList['Water_stone']   = new EvolutionStone(GameConstants.StoneType.Water_stone, 2500);
ItemList['Thunder_stone'] = new EvolutionStone(GameConstants.StoneType.Thunder_stone, 2500);
ItemList['Leaf_stone']    = new EvolutionStone(GameConstants.StoneType.Leaf_stone, 2500);
ItemList['Moon_stone']    = new EvolutionStone(GameConstants.StoneType.Moon_stone, 2500);
ItemList['Sun_stone']     = new EvolutionStone(GameConstants.StoneType.Sun_stone, 2500);
ItemList['Trade_stone']   = new EvolutionStone(GameConstants.StoneType.Trade_stone, 2500);
ItemList['Dragon_scale']  = new EvolutionStone(GameConstants.StoneType.Dragon_scale, 2500);
ItemList['Metal_coat']    = new EvolutionStone(GameConstants.StoneType.Metal_coat, 2500);
ItemList['Kings_rock']    = new EvolutionStone(GameConstants.StoneType.Kings_rock, 2500);
ItemList['Upgrade']       = new EvolutionStone(GameConstants.StoneType.Upgrade, 2500);
ItemList['Soothe_bell']   = new EvolutionStone(GameConstants.StoneType.Soothe_bell, 2500);
ItemList['Deepsea_tooth'] = new EvolutionStone(GameConstants.StoneType.Deepsea_tooth, 2500);
ItemList['Deepsea_scale'] = new EvolutionStone(GameConstants.StoneType.Deepsea_scale, 2500);
ItemList['Dawn_stone']    = new EvolutionStone(GameConstants.StoneType.Dawn_stone, 2500);
ItemList['Dusk_stone']    = new EvolutionStone(GameConstants.StoneType.Dusk_stone, 2500);
ItemList['Shiny_stone']   = new EvolutionStone(GameConstants.StoneType.Shiny_stone, 2500);
ItemList['Dubious_disc']  = new EvolutionStone(GameConstants.StoneType.Dubious_disc, 2500);
ItemList['Electirizer']    = new EvolutionStone(GameConstants.StoneType.Electirizer, 2500);
ItemList['Magmarizer']    = new EvolutionStone(GameConstants.StoneType.Magmarizer, 2500);
ItemList['Protector']     = new EvolutionStone(GameConstants.StoneType.Protector, 2500);
ItemList['Reaper_cloth']  = new EvolutionStone(GameConstants.StoneType.Reaper_cloth, 2500);
ItemList['Razor_claw']    = new EvolutionStone(GameConstants.StoneType.Razor_claw, 2500);
ItemList['Razor_fang']    = new EvolutionStone(GameConstants.StoneType.Razor_fang, 2500);
ItemList['Prism_scale']    = new EvolutionStone(GameConstants.StoneType.Prism_scale, 2500);
ItemList['Black_DNA']    = new EvolutionStone(GameConstants.StoneType.Black_DNA, 2500);
ItemList['White_DNA']    = new EvolutionStone(GameConstants.StoneType.White_DNA, 2500);
ItemList['Sachet']         = new EvolutionStone(GameConstants.StoneType.Sachet, 2500);
ItemList['Whipped_dream']  = new EvolutionStone(GameConstants.StoneType.Whipped_dream, 2500);
