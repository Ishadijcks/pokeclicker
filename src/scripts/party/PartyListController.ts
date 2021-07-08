///<reference path="../party/CaughtStatus.ts"/>
/// <reference path="../../declarations/breeding/EggType.d.ts" />

class PartyListController {

    public static initialize() {}

    public static filter = {
        search: ko.observable(new RegExp('', 'i')),
        category: ko.observable(-1).extend({ numeric: 0 }),
        shinyStatus: ko.observable(-1).extend({ numeric: 0 }),
        // All = -2
        type1: ko.observable(-2).extend({ numeric: 0 }),
        type2: ko.observable(-2).extend({ numeric: 0 }),
        region: ko.observable(-2).extend({ numeric: 0 }),
    }

    public static applyFilters(partyPokemon: PartyPokemon): boolean {
        if (!PartyListController.filter.search().test(partyPokemon.name)) {
            return false;
        }

        // Check based on category
        if (PartyListController.filter.category() >= 0) {
            if (partyPokemon.category !== PartyListController.filter.category()) {
                return false;
            }
        }

        // Check based on shiny status
        if (PartyListController.filter.shinyStatus() >= 0) {
            if (+partyPokemon.shiny !== PartyListController.filter.shinyStatus()) {
                return false;
            }
        }

        // Check based on native region
        if (PartyListController.filter.region() > -2) {
            if (PokemonHelper.calcNativeRegion(partyPokemon.name) !== PartyListController.filter.region()) {
                return false;
            }
        }

        // Check if either of the types match
        const type1: (PokemonType | null) = PartyListController.filter.type1() > -2 ? PartyListController.filter.type1() : null;
        const type2: (PokemonType | null) = PartyListController.filter.type2() > -2 ? PartyListController.filter.type2() : null;
        if (type1 !== null || type2 !== null) {
            const { type: types } = pokemonMap[partyPokemon.name];
            if ([type1, type2].includes(PokemonType.None)) {
                const type = (type1 == PokemonType.None) ? type2 : type1;
                if (!PartyListController.isPureType(partyPokemon, type)) {
                    return false;
                }
            } else if ((type1 !== null && !types.includes(type1)) || (type2 !== null && !types.includes(type2))) {
                return false;
            }
        }
        return true;
    }

    private static isPureType(pokemon: PartyPokemon, type: (PokemonType | null)): boolean {
        const pokemonData = pokemonMap[pokemon.name];
        return ((type == null || pokemonData.type[0] === type) && (pokemonData.type[1] == undefined || pokemonData.type[1] == PokemonType.None));
    }

    /**
     * Determines whether this pokemon should be visible in the list.
     * To be overridden in child classes
     * @param partyPokemon The PartyPokemon to be displayed
     */
    public static visible(partyPokemon: PartyPokemon) {
        return ko.pureComputed(() => {
            return this.applyFilters(partyPokemon);
        });
    }

    /**
     * Determines whether the pokemon list element should be disabled from clicks.
     * To be overridden in child classes
     * @param partyPokemon The PartyPokemon being clicked
     */
    public static disabled(partyPokemon: PartyPokemon) {
        return false;
    }

    /**
     * Click handler for Party Lists
     * To be overridden in child classes
     * @param partyPokemon The PartyPokemon being clicked
     */
    public static handleClick(partyPokemon: PartyPokemon) {
        return;
    }

    // Value displayed at bottom of image
    public static displayValue = ko.observable('attack');

    public static getDisplayValue(pokemon: PartyPokemon): string {
        const pokemonData = pokemonMap[pokemon.name];
        switch (this.displayValue()) {
            case 'attack': return `Attack: ${pokemon.attack.toLocaleString('en-US')}`;
            case 'attackBonus': return `Attack Bonus: ${Math.floor(pokemon.baseAttack * (GameConstants.BREEDING_ATTACK_BONUS / 100) + pokemon.proteinsUsed()).toLocaleString('en-US')}`;
            case 'baseAttack': return `Base Attack: ${pokemon.baseAttack.toLocaleString('en-US')}`;
            case 'eggSteps': return `Egg Steps: ${App.game.breeding.getSteps(pokemonData.eggCycles).toLocaleString('en-US')}`;
            case 'timesHatched': return `Hatches: ${App.game.statistics.pokemonHatched[pokemonData.id]() || 0}`;
            case 'breedingEfficiency': return `Efficiency: ${((pokemon.baseAttack * (GameConstants.BREEDING_ATTACK_BONUS / 100) + pokemon.proteinsUsed()) / pokemonMap[pokemon.name].eggCycles).toLocaleString('en-US', { maximumSignificantDigits: 2 })}`;
            case 'stepsPerAttack': return `Steps/Att: ${(App.game.breeding.getSteps(pokemonMap[pokemon.name].eggCycles) / (pokemon.baseAttack * (GameConstants.BREEDING_ATTACK_BONUS / 100) + pokemon.proteinsUsed())).toLocaleString('en-US', { maximumSignificantDigits: 2 })}`;
            case 'dexId': return `#${pokemon.id <= 0 ? '???' : Math.floor(pokemon.id).toString().padStart(3,'0')}`;
        }
    }
}
