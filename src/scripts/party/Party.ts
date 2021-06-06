/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Feature.d.ts" />
/// <reference path="CaughtStatus.ts" />

class Party implements Feature {
    name = 'Pokemon Party';
    saveKey = 'party';

    _caughtPokemon: KnockoutObservableArray<PartyPokemon>;

    defaults = {
        caughtPokemon: [],
    };

    hasMaxLevelPokemon: KnockoutComputed<boolean>;


    constructor(private multiplier: Multiplier) {
        this._caughtPokemon = ko.observableArray([]);

        this.hasMaxLevelPokemon = ko.pureComputed(() => {
            for (let i = 0; i < this.caughtPokemon.length; i++) {
                if (this.caughtPokemon[i].level === 100) {
                    return true;
                }
            }
            return false;
        }).extend({rateLimit: 1000});

    }

    gainPokemonById(id: number, shiny = false, suppressNotification = false) {
        this.gainPokemon(PokemonFactory.generatePartyPokemon(id, shiny), suppressNotification);
    }

    gainPokemon(pokemon: PartyPokemon, suppressNotification = false) {
        GameHelper.incrementObservable(App.game.statistics.pokemonCaptured[pokemon.id]);
        GameHelper.incrementObservable(App.game.statistics.totalPokemonCaptured);

        if (pokemon.shiny) {
            GameHelper.incrementObservable(App.game.statistics.shinyPokemonCaptured[pokemon.id]);
            GameHelper.incrementObservable(App.game.statistics.totalShinyPokemonCaptured);
            // Add all shiny catches to the log book
            App.game.logbook.newLog(LogBookTypes.CAUGHT, `You have captured a shiny ${pokemon.name}!`);
            // Already caught (shiny)
            if (this.alreadyCaughtPokemon(pokemon.id, true)) {
                return;
            }
            // Notify if not already caught
            Notifier.notify({
                message: `✨ You have captured a shiny ${pokemon.name}! ✨`,
                type: NotificationConstants.NotificationOption.warning,
                sound: NotificationConstants.NotificationSound.new_catch,
            });

            // Already caught (non shiny) we need to update the party pokemon directly
            if (this.alreadyCaughtPokemon(pokemon.id, false)) {
                this.getPokemon(pokemon.id).shiny = true;
                return;
            }
        }

        // Already caught (non shiny)
        if (this.alreadyCaughtPokemon(pokemon.id, false)) {
            return;
        }

        if (!suppressNotification) {
            Notifier.notify({
                message: `You have captured ${GameHelper.anOrA(pokemon.name)} ${pokemon.name}!`,
                type: NotificationConstants.NotificationOption.success,
                sound: NotificationConstants.NotificationSound.new_catch,
            });
        }

        App.game.logbook.newLog(LogBookTypes.CAUGHT, `You have captured ${GameHelper.anOrA(pokemon.name)} ${pokemon.name}!`);
        this._caughtPokemon.push(pokemon);

        // Trigger sorting update of PokemonList UI
        PartyController.sortList();
    }

    public gainExp(exp = 0, level = 1, trainer = false) {
        const multBonus = this.multiplier.getBonus('exp', true);
        const trainerBonus = trainer ? 1.5 : 1;
        const expTotal = Math.floor(exp * level * trainerBonus * multBonus / 9);

        const maxLevel = (App.game.badgeCase.badgeCount() + 2) * 20;
        for (const pokemon of this.caughtPokemon) {
            if (pokemon.level < maxLevel) {
                pokemon.gainExp(expTotal);
            }
        }
    }

    /**
     * Calculate the attack of all your Pokémon
     * @param type1
     * @param type2 types of the enemy we're calculating damage against.
     * @returns {number} damage to be done.
     */
    public calculatePokemonAttack(type1: PokemonType = PokemonType.None, type2: PokemonType = PokemonType.None, ignoreRegionMultiplier = false, region: GameConstants.Region = player.region, includeBreeding = false, useBaseAttack = false, includeWeather = true): number {
        let attack = 0;
        for (const pokemon of this.caughtPokemon) {
            attack += this.calculateOnePokemonAttack(pokemon, type1, type2, region, ignoreRegionMultiplier, includeBreeding, useBaseAttack, includeWeather);
        }

        const bonus = this.multiplier.getBonus('pokemonAttack');

        return Math.round(attack * bonus);
    }

    public calculateOnePokemonAttack(pokemon: PartyPokemon, type1: PokemonType = PokemonType.None, type2: PokemonType = PokemonType.None, region: GameConstants.Region = player.region, ignoreRegionMultiplier = false, includeBreeding = false, useBaseAttack = false, includeWeather = true): number {
        let multiplier = 1, attack = 0;
        const pAttack = useBaseAttack ? pokemon.baseAttack : pokemon.attack;
        const nativeRegion = PokemonHelper.calcNativeRegion(pokemon.name);

        if (!ignoreRegionMultiplier && nativeRegion != region && nativeRegion != GameConstants.Region.none) {
            // Pokemon only retain a % of their total damage in other regions based on highest region.
            multiplier = this.getRegionAttackMultiplier();
        }

        // Check if the Pokemon is currently breeding (no attack)
        if (includeBreeding || !pokemon.breeding) {
            if (type1 == PokemonType.None) {
                attack = pAttack * multiplier;
            } else {
                const dataPokemon = PokemonHelper.getPokemonByName(pokemon.name);
                attack = pAttack * TypeHelper.getAttackModifier(dataPokemon.type1, dataPokemon.type2, type1, type2) * multiplier;
            }
        }

        // Should we take weather boost into account
        if (includeWeather) {
            const weather = Weather.weatherConditions[Weather.currentWeather()];
            const dataPokemon = PokemonHelper.getPokemonByName(pokemon.name);
            weather.multipliers?.forEach(value => {
                if (value.type == dataPokemon.type1) {
                    attack *= value.multiplier;
                }
                if (value.type == dataPokemon.type2) {
                    attack *= value.multiplier;
                }
            });
        }

        return attack;
    }

    public getRegionAttackMultiplier(highestRegion = player.highestRegion()): number {
        // between 0.2 -> 1 based on highest region
        return Math.min(1, Math.max(0.2, 0.1 + (highestRegion / 10)));
    }

    public pokemonAttackObservable: KnockoutComputed<number> = ko.pureComputed(() => {
        return App.game.party.calculatePokemonAttack();
    }).extend({rateLimit: 1000});

    public getPokemon(id: number) {
        for (let i = 0; i < this.caughtPokemon.length; i++) {
            if (this.caughtPokemon[i].id === id) {
                return this.caughtPokemon[i];
            }
        }
    }

    alreadyCaughtPokemonByName(name: PokemonNameType, shiny = false) {
        return this.alreadyCaughtPokemon(PokemonHelper.getPokemonByName(name).id, shiny);
    }

    alreadyCaughtPokemon(id: number, shiny = false) {
        const pokemon = this.caughtPokemon.find(p => p.id == id);
        if (pokemon) {
            return (!shiny || pokemon.shiny);
        }
        return false;
    }

    calculateClickAttack(useItem = false): number {
        // Base power
        // Shiny pokemon help with a 50% boost
        const clickAttack = Math.pow(this.caughtPokemon.length + (this.caughtPokemon.filter(p => p.shiny).length / 2) + 1, 1.4);
        const bonus = this.multiplier.getBonus('clickAttack', useItem);

        return Math.floor(clickAttack * bonus);
    }

    canAccess(): boolean {
        return true;
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        const caughtPokemonSave = json['caughtPokemon'];
        for (let i = 0; i < caughtPokemonSave.length; i++) {
            const partyPokemon = PokemonFactory.generatePartyPokemon(caughtPokemonSave[i].id);
            partyPokemon.fromJSON(caughtPokemonSave[i]);
            this._caughtPokemon.push(partyPokemon);
        }
    }

    initialize(): void {
    }

    toJSON(): Record<string, any> {
        return {
            caughtPokemon: this._caughtPokemon().map(x => x.toJSON()),
        };
    }

    update(delta: number): void {
        // This method intentionally left blank
    }

    get caughtPokemon() {
        return this._caughtPokemon();
    }

    set caughtPokemon(pokemon: PartyPokemon[]) {
        this._caughtPokemon(pokemon);
    }

}
