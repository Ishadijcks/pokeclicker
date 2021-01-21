/// <reference path="CaughtIndicatingItem.ts" />

class PokemonItem extends CaughtIndicatingItem {

    type: PokemonNameType;

    constructor(pokemon: PokemonNameType, basePrice: number, currency: GameConstants.Currency = GameConstants.Currency.questPoint) {
        super(pokemon, basePrice, currency);
        this.type = pokemon;
    }

    gain() {
        const shiny = PokemonFactory.generateShiny(GameConstants.SHINY_CHANCE_SHOP);
        const pokemonName = this.name() as PokemonNameType;
        if (shiny) {
            Notifier.notify({
                message: `✨ You obtained a shiny ${pokemonName}! ✨`,
                type: NotificationConstants.NotificationOption.warning,
            });
        }
        App.game.party.gainPokemonById(PokemonHelper.getPokemonByName(pokemonName).id, shiny, true);
    }

    getCaughtStatus(): CaughtStatus {
        return PartyController.getCaughtStatusByName(this.name() as PokemonNameType);
    }

}

ItemList['Eevee']                = new PokemonItem('Eevee', 5000);
ItemList['Porygon']              = new PokemonItem('Porygon', 2000);
ItemList['Jynx']                 = new PokemonItem('Jynx', 2500);
ItemList['Mr. Mime']             = new PokemonItem('Mr. Mime', 1500);
ItemList['Lickitung']            = new PokemonItem('Lickitung', 1000);
ItemList['Togepi']               = new PokemonItem('Togepi', 2500);
ItemList['Beldum']               = new PokemonItem('Beldum', 5000);
ItemList['Skorupi']              = new PokemonItem('Skorupi', 5000);
ItemList['Combee']               = new PokemonItem('Combee', 5000);
ItemList['Burmy (plant)']        = new PokemonItem('Burmy (plant)', 5000);
ItemList['Cherubi']              = new PokemonItem('Cherubi', 5000);
ItemList['Spiritomb']            = new PokemonItem('Spiritomb', 5000);
ItemList['Zorua']                = new PokemonItem('Zorua', 5000);
ItemList['Meloetta (pirouette)'] = new PokemonItem('Meloetta (pirouette)', 150000);
ItemList['Type null']            = new PokemonItem('Type: Null', 5000);
ItemList['Poipole']              = new PokemonItem('Poipole', 5000);
ItemList['Eternatus']            = new PokemonItem('Eternatus', 10000);
ItemList['Toxel']                = new PokemonItem('Toxel', 5000);
