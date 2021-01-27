///<reference path="Item.ts"/>
class EvolutionStone extends CaughtIndicatingItem {

    type: GameConstants.StoneType;

    constructor(type: GameConstants.StoneType, displayName?: string) {
        super(GameConstants.StoneType[type], { displayName: displayName, imageDirectory: 'evolution' });
        this.type = type;
    }

    public use(pokemon?: PokemonNameType): boolean {
        const partyPokemon: PartyPokemon = App.game.party.getPokemon(PokemonHelper.getPokemonByName(pokemon).id);
        const shiny = partyPokemon.useStone(this.type);
        return shiny;
    }

    getCaughtStatus(): CaughtStatus {
        const unlockedEvolutions = pokemonList.filter((p: PokemonListData) => p.evolutions)
            .map((p: PokemonListData) => p.evolutions.find(e => e.type.includes(EvolutionType.Stone) && (e as StoneEvolution).stone === this.type))
            .filter(evolution => evolution)
            .filter(evolution => PokemonHelper.calcNativeRegion(evolution.getEvolvedPokemon() as PokemonNameType) <= player.highestRegion())
            .map(evolution => evolution.getEvolvedPokemon());

        return unlockedEvolutions.reduce((status: CaughtStatus, pokemonName: PokemonNameType) => {
            return Math.min(status, PartyController.getCaughtStatusByName(pokemonName));
        }, CaughtStatus.CaughtShiny);
    }

}

ItemList['Fire_stone']        = new EvolutionStone(GameConstants.StoneType.Fire_stone,          'Fire Stone');
ItemList['Water_stone']       = new EvolutionStone(GameConstants.StoneType.Water_stone,         'Water Stone');
ItemList['Thunder_stone']     = new EvolutionStone(GameConstants.StoneType.Thunder_stone,       'Thunder Stone');
ItemList['Leaf_stone']        = new EvolutionStone(GameConstants.StoneType.Leaf_stone,          'Leaf Stone');
ItemList['Moon_stone']        = new EvolutionStone(GameConstants.StoneType.Moon_stone,          'Moon Stone');
ItemList['Sun_stone']         = new EvolutionStone(GameConstants.StoneType.Sun_stone,           'Sun Stone');
ItemList['Trade_stone']       = new EvolutionStone(GameConstants.StoneType.Trade_stone,         'Trade Stone');
ItemList['Dragon_scale']      = new EvolutionStone(GameConstants.StoneType.Dragon_scale,        'Dragon Scale');
ItemList['Metal_coat']        = new EvolutionStone(GameConstants.StoneType.Metal_coat,          'Metal Coat');
ItemList['Kings_rock']        = new EvolutionStone(GameConstants.StoneType.Kings_rock,          'King\'s Rock');
ItemList['Upgrade']           = new EvolutionStone(GameConstants.StoneType.Upgrade,             'Upgrade');
ItemList['Soothe_bell']       = new EvolutionStone(GameConstants.StoneType.Soothe_bell,         'Soothe Bell');
ItemList['Deepsea_tooth']     = new EvolutionStone(GameConstants.StoneType.Deepsea_tooth,       'Deep Sea Tooth');
ItemList['Deepsea_scale']     = new EvolutionStone(GameConstants.StoneType.Deepsea_scale,       'Deep Sea Scale');
ItemList['Dawn_stone']        = new EvolutionStone(GameConstants.StoneType.Dawn_stone,          'Dawn Stone');
ItemList['Dusk_stone']        = new EvolutionStone(GameConstants.StoneType.Dusk_stone,          'Dusk Stone');
ItemList['Shiny_stone']       = new EvolutionStone(GameConstants.StoneType.Shiny_stone,         'Shiny Stone');
ItemList['Dubious_disc']      = new EvolutionStone(GameConstants.StoneType.Dubious_disc,        'Dubious Disc');
ItemList['Electirizer']       = new EvolutionStone(GameConstants.StoneType.Electirizer,         'Electirizer');
ItemList['Magmarizer']        = new EvolutionStone(GameConstants.StoneType.Magmarizer,          'Magmarizer');
ItemList['Protector']         = new EvolutionStone(GameConstants.StoneType.Protector,           'Protector');
ItemList['Reaper_cloth']      = new EvolutionStone(GameConstants.StoneType.Reaper_cloth,        'Reaper Cloth');
ItemList['Razor_claw']        = new EvolutionStone(GameConstants.StoneType.Razor_claw,          'Razor Claw');
ItemList['Razor_fang']        = new EvolutionStone(GameConstants.StoneType.Razor_fang,          'Razor Fang');
ItemList['Prism_scale']       = new EvolutionStone(GameConstants.StoneType.Prism_scale,         'Prism Scale');
ItemList['Sachet']            = new EvolutionStone(GameConstants.StoneType.Sachet,              'Sachet');
ItemList['Whipped_dream']     = new EvolutionStone(GameConstants.StoneType.Whipped_dream,       'Whipped Dream');
ItemList['Ice_stone']         = new EvolutionStone(GameConstants.StoneType.Ice_stone,           'Ice Stone');
ItemList['Strawberry_sweet']  = new EvolutionStone(GameConstants.StoneType.Strawberry_sweet,    'Strawberry Sweet');
ItemList['Berry_sweet']       = new EvolutionStone(GameConstants.StoneType.Berry_sweet,         'Berry Sweet');
ItemList['Love_sweet']        = new EvolutionStone(GameConstants.StoneType.Love_sweet,          'Love Sweet');
ItemList['Star_sweet']        = new EvolutionStone(GameConstants.StoneType.Star_sweet,          'Star Sweet');
ItemList['Clover_sweet']      = new EvolutionStone(GameConstants.StoneType.Clover_sweet,        'Clover Sweet');
ItemList['Flower_sweet']      = new EvolutionStone(GameConstants.StoneType.Flower_sweet,        'Flower Sweet');
ItemList['Ribbon_sweet']      = new EvolutionStone(GameConstants.StoneType.Ribbon_sweet,        'Ribbon Sweet');
ItemList['Lemon_cream']       = new EvolutionStone(GameConstants.StoneType.Lemon_cream,         'Lemon Cream');
ItemList['Salted_cream']      = new EvolutionStone(GameConstants.StoneType.Salted_cream,        'Salted Cream');
ItemList['Mint_cream']        = new EvolutionStone(GameConstants.StoneType.Mint_cream,          'Mint Cream');
ItemList['Matcha_cream']      = new EvolutionStone(GameConstants.StoneType.Matcha_cream,        'Matcha Cream');
ItemList['Ruby_cream']        = new EvolutionStone(GameConstants.StoneType.Ruby_cream,          'Ruby Cream');
ItemList['Rainbow_swirl']     = new EvolutionStone(GameConstants.StoneType.Rainbow_swirl,       'Rainbow Swirl');
ItemList['Caramel_swirl']     = new EvolutionStone(GameConstants.StoneType.Caramel_swirl,       'Caramel Swirl');
ItemList['Ruby_swirl']        = new EvolutionStone(GameConstants.StoneType.Ruby_swirl,          'Ruby Swirl');
ItemList['Tart_apple']        = new EvolutionStone(GameConstants.StoneType.Tart_apple,          'Tart Apple');
ItemList['Sweet_apple']       = new EvolutionStone(GameConstants.StoneType.Sweet_apple,         'Sweet Apple');
ItemList['Chipped_pot']       = new EvolutionStone(GameConstants.StoneType.Chipped_pot,         'Chipped Pot');
ItemList['Rusted_sword']      = new EvolutionStone(GameConstants.StoneType.Rusted_sword,        'Rusted Sword');
ItemList['Rusted_shield']     = new EvolutionStone(GameConstants.StoneType.Rusted_shield,       'Rusted Shield');
ItemList['Galarica_cuff']     = new EvolutionStone(GameConstants.StoneType.Galarica_cuff,       'Galarica Cuff');
ItemList['Galarica_wreath']   = new EvolutionStone(GameConstants.StoneType.Galarica_wreath,     'Galarica Wreath');
ItemList['Ice_stone']         = new EvolutionStone(GameConstants.StoneType.Ice_stone,           'Ice Stone');

ShopEntriesList['Fire Stone']        = new ShopItem('Fire Stone', ItemList['Fire_stone'], 2500, Currency.questPoint);
ShopEntriesList['Water Stone']       = new ShopItem('Water Stone', ItemList['Water_stone'], 2500, Currency.questPoint);
ShopEntriesList['Thunder Stone']     = new ShopItem('Thunder Stone', ItemList['Thunder_stone'], 2500, Currency.questPoint);
ShopEntriesList['Leaf Stone']        = new ShopItem('Leaf Stone', ItemList['Leaf_stone'], 2500, Currency.questPoint);
ShopEntriesList['Moon Stone']        = new ShopItem('Moon Stone', ItemList['Moon_stone'], 2500, Currency.questPoint);
ShopEntriesList['Sun Stone']         = new ShopItem('Sun Stone', ItemList['Sun_stone'], 2500, Currency.questPoint);
ShopEntriesList['Trade Stone']       = new ShopItem('Trade Stone', ItemList['Trade_stone'], 2500, Currency.questPoint);
ShopEntriesList['Dragon Scale']      = new ShopItem('Dragon Scale', ItemList['Dragon_scale'], 2500, Currency.questPoint);
ShopEntriesList['Metal Coat']        = new ShopItem('Metal Coat', ItemList['Metal_coat'], 2500,  Currency.questPoint);
ShopEntriesList['King\'s Rock']       = new ShopItem('King\'s Rock', ItemList['Kings_rock'], 2500, Currency.questPoint);
ShopEntriesList['Upgrade']           = new ShopItem('Upgrade', ItemList['Upgrade'], 2500, Currency.questPoint);
ShopEntriesList['Soothe Bell']       = new ShopItem('Soothe Bell', ItemList['Soothe_bell'], 2500, Currency.questPoint);
ShopEntriesList['Deep Sea Tooth']    = new ShopItem('Deep Sea Tooth', ItemList['Deepsea_tooth'], 2500, Currency.questPoint);
ShopEntriesList['Deep Sea Scale']    = new ShopItem('Deep Sea Scale', ItemList['Deepsea_scale'], 2500, Currency.questPoint);
ShopEntriesList['Dawn Stone']        = new ShopItem('Dawn Stone', ItemList['Dawn_stone'], 2500, Currency.questPoint);
ShopEntriesList['Dusk Stone']        = new ShopItem('Dusk Stone', ItemList['Dusk_stone'], 2500, Currency.questPoint);
ShopEntriesList['Shiny Stone']       = new ShopItem('Shiny Stone', ItemList['Shiny_stone'], 2500, Currency.questPoint);
ShopEntriesList['Dubious Disc']      = new ShopItem('Dubious Disc', ItemList['Dubious_disc'], 2500, Currency.questPoint);
ShopEntriesList['Electirizer']       = new ShopItem('Electirizer', ItemList['Electirizer'], 2500, Currency.questPoint);
ShopEntriesList['Magmarizer']        = new ShopItem('Magmarizer', ItemList['Magmarizer'], 2500, Currency.questPoint);
ShopEntriesList['Protector']         = new ShopItem('Protector', ItemList['Protector'], 2500, Currency.questPoint);
ShopEntriesList['Reaper Cloth']      = new ShopItem('Reaper Cloth', ItemList['Reaper_cloth'], 2500, Currency.questPoint);
ShopEntriesList['Razor Claw']        = new ShopItem('Razor Claw', ItemList['Razor_claw'], 2500, Currency.questPoint);
ShopEntriesList['Razor Fang']        = new ShopItem('Razor Fang', ItemList['Razor_fang'], 2500, Currency.questPoint);
ShopEntriesList['Prism Scale']       = new ShopItem('Prism Scale', ItemList['Prism_scale'], 2500, Currency.questPoint);
ShopEntriesList['Sachet']            = new ShopItem('Sachet', ItemList['Sachet'], 2500, Currency.questPoint);
ShopEntriesList['Whipped Dream']     = new ShopItem('Whipped Dream', ItemList['Whipped_dream'], 2500, Currency.questPoint);
ShopEntriesList['Ice Stone']         = new ShopItem('Ice Stone', ItemList['Ice_stone'], 2500, Currency.questPoint);
ShopEntriesList['Strawberry Sweet']  = new ShopItem('Strawberry Sweet', ItemList['Strawberry_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Berry Sweet']       = new ShopItem('Berry Sweet', ItemList['Berry_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Love Sweet']        = new ShopItem('Love Sweet', ItemList['Love_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Star Sweet']        = new ShopItem('Star Sweet', ItemList['Star_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Clover Sweet']      = new ShopItem('Clover Sweet', ItemList['Clover_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Flower Sweet']      = new ShopItem('Flower Sweet', ItemList['Flower_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Ribbon Sweet']      = new ShopItem('Ribbon Sweet', ItemList['Ribbon_sweet'], 1000, Currency.questPoint);
ShopEntriesList['Lemon Cream']       = new ShopItem('Lemon Cream', ItemList['Lemon_cream'], 500, Currency.questPoint);
ShopEntriesList['Salted Cream']      = new ShopItem('Salted Cream', ItemList['Salted_cream'], 500, Currency.questPoint);
ShopEntriesList['Mint Cream']        = new ShopItem('Mint Cream', ItemList['Mint_cream'], 500, Currency.questPoint);
ShopEntriesList['Matcha Cream']      = new ShopItem('Matcha Cream', ItemList['Matcha_cream'], 500, Currency.questPoint);
ShopEntriesList['Ruby Cream']        = new ShopItem('Ruby Cream', ItemList['Ruby_cream'], 500, Currency.questPoint);
ShopEntriesList['Rainbow Swirl']     = new ShopItem('Rainbow Swirl', ItemList['Rainbow_swirl'], 500, Currency.questPoint);
ShopEntriesList['Caramel Swirl']     = new ShopItem('Caramel Swirl', ItemList['Caramel_swirl'], 500, Currency.questPoint);
ShopEntriesList['Ruby Swirl']        = new ShopItem('Ruby Swirl', ItemList['Ruby_swirl'], 500, Currency.questPoint);
ShopEntriesList['Tart Apple']        = new ShopItem('Tart Apple', ItemList['Tart_apple'], 2500, Currency.questPoint);
ShopEntriesList['Sweet Apple']       = new ShopItem('Sweet Apple', ItemList['Sweet_apple'], 2500, Currency.questPoint);
ShopEntriesList['Chipped Pot']       = new ShopItem('Chipped Pot', ItemList['Chipped_pot'], 2500, Currency.questPoint);
ShopEntriesList['Rusted Sword']      = new ShopItem('Rusted Sword', ItemList['Rusted_sword'], 10000, Currency.questPoint);
ShopEntriesList['Rusted Shield']     = new ShopItem('Rusted Shield', ItemList['Rusted_shield'], 10000, Currency.questPoint);
ShopEntriesList['Galarica Cuff']     = new ShopItem('Galarica Cuff', ItemList['Galarica_cuff'], 2500, Currency.questPoint);
ShopEntriesList['Galarica Wreath']   = new ShopItem('Galarica Wreath', ItemList['Galarica_wreath'], 2500, Currency.questPoint);
ShopEntriesList['Ice Stone']         = new ShopItem('Ice Stone', ItemList['Ice_stone'], 2500, Currency.questPoint);
