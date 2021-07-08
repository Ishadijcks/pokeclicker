///<reference path="Item.ts"/>
class EvolutionStone extends CaughtIndicatingItem {

    type: GameConstants.StoneType;

    constructor(type: GameConstants.StoneType, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.questPoint, displayName?: string) {
        super(GameConstants.StoneType[type], basePrice, currency, undefined, displayName, undefined, 'evolution');
        this.type = type;
    }

    gain(n: number) {
        player.gainItem(GameConstants.StoneType[this.type], n);
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
            .filter(evolution => PokemonHelper.calcNativeRegion(evolution.getEvolvedPokemon()) <= player.highestRegion())
            .map(evolution => evolution.getEvolvedPokemon());

        return unlockedEvolutions.reduce((status: CaughtStatus, pokemonName: PokemonNameType) => {
            return Math.min(status, PartyController.getCaughtStatusByName(pokemonName));
        }, CaughtStatus.CaughtShiny);
    }

}

// TODO: Set prices for different kinds of stones
ItemList['Fire_stone']        = new EvolutionStone(GameConstants.StoneType.Fire_stone, 2500, undefined, 'Fire Stone');
ItemList['Water_stone']       = new EvolutionStone(GameConstants.StoneType.Water_stone, 2500, undefined, 'Water Stone');
ItemList['Thunder_stone']     = new EvolutionStone(GameConstants.StoneType.Thunder_stone, 2500, undefined, 'Thunder Stone');
ItemList['Leaf_stone']        = new EvolutionStone(GameConstants.StoneType.Leaf_stone, 2500, undefined, 'Leaf Stone');
ItemList['Moon_stone']        = new EvolutionStone(GameConstants.StoneType.Moon_stone, 2500, undefined, 'Moon Stone');
ItemList['Sun_stone']         = new EvolutionStone(GameConstants.StoneType.Sun_stone, 2500, undefined, 'Sun Stone');
ItemList['Trade_stone']       = new EvolutionStone(GameConstants.StoneType.Trade_stone, 2500, undefined, 'Trade Stone');
ItemList['Dragon_scale']      = new EvolutionStone(GameConstants.StoneType.Dragon_scale, 2500, undefined, 'Dragon Scale');
ItemList['Metal_coat']        = new EvolutionStone(GameConstants.StoneType.Metal_coat, 2500, undefined , 'Metal Coat');
ItemList['Kings_rock']        = new EvolutionStone(GameConstants.StoneType.Kings_rock, 2500, undefined , 'King\'s Rock');
ItemList['Upgrade']           = new EvolutionStone(GameConstants.StoneType.Upgrade, 2500, undefined , 'Upgrade');
ItemList['Soothe_bell']       = new EvolutionStone(GameConstants.StoneType.Soothe_bell, 2500, undefined , 'Soothe Bell');
ItemList['Deepsea_tooth']     = new EvolutionStone(GameConstants.StoneType.Deepsea_tooth, 2500, undefined , 'Deep Sea Tooth');
ItemList['Deepsea_scale']     = new EvolutionStone(GameConstants.StoneType.Deepsea_scale, 2500, undefined , 'Deep Sea Scale');
ItemList['Dawn_stone']        = new EvolutionStone(GameConstants.StoneType.Dawn_stone, 2500, undefined , 'Dawn Stone');
ItemList['Dusk_stone']        = new EvolutionStone(GameConstants.StoneType.Dusk_stone, 2500, undefined , 'Dusk Stone');
ItemList['Shiny_stone']       = new EvolutionStone(GameConstants.StoneType.Shiny_stone, 2500, undefined , 'Shiny Stone');
ItemList['Dubious_disc']      = new EvolutionStone(GameConstants.StoneType.Dubious_disc, 2500, undefined , 'Dubious Disc');
ItemList['Electirizer']       = new EvolutionStone(GameConstants.StoneType.Electirizer, 2500, undefined , 'Electirizer');
ItemList['Magmarizer']        = new EvolutionStone(GameConstants.StoneType.Magmarizer, 2500, undefined , 'Magmarizer');
ItemList['Protector']         = new EvolutionStone(GameConstants.StoneType.Protector, 2500, undefined , 'Protector');
ItemList['Reaper_cloth']      = new EvolutionStone(GameConstants.StoneType.Reaper_cloth, 2500, undefined , 'Reaper Cloth');
ItemList['Razor_claw']        = new EvolutionStone(GameConstants.StoneType.Razor_claw, 2500, undefined , 'Razor Claw');
ItemList['Razor_fang']        = new EvolutionStone(GameConstants.StoneType.Razor_fang, 2500, undefined , 'Razor Fang');
ItemList['Prism_scale']       = new EvolutionStone(GameConstants.StoneType.Prism_scale, 2500, undefined , 'Prism Scale');
ItemList['Sachet']            = new EvolutionStone(GameConstants.StoneType.Sachet, 2500, undefined , 'Sachet');
ItemList['Whipped_dream']     = new EvolutionStone(GameConstants.StoneType.Whipped_dream, 2500, undefined , 'Whipped Dream');
ItemList['Ice_stone']         = new EvolutionStone(GameConstants.StoneType.Ice_stone, 2500, undefined , 'Ice Stone');
