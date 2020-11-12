/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Saveable.d.ts" />

class Egg implements Saveable {
    saveKey = 'egg';

    defaults = {};

    totalSteps: number;
    steps: KnockoutObservable<number>;
    shinySteps: number;
    pokemon: PokemonNameType;
    type: EggType;
    pokemonType1: PokemonType;
    pokemonType2: PokemonType;
    notified: boolean;
    progress: KnockoutComputed<number>;
    progressText: KnockoutComputed<string>;
    stepsRemaining: KnockoutComputed<number>;

    constructor(type = EggType.None, totalSteps = 0, pokemon: PokemonNameType = 'MissingNo.', steps = 0, shinySteps = 0, notified = false) {
        this.totalSteps = totalSteps;
        this.steps = ko.observable(steps);
        this.shinySteps = shinySteps;
        this.pokemon = pokemon;
        this.type = type;
        this.notified = notified;

        this.init();
    }

    private init() {
        this.progress = ko.pureComputed(function () {
            return this.steps() / this.totalSteps * 100;
        }, this);

        this.progressText = ko.pureComputed(function () {
            return `${this.steps()} / ${this.totalSteps}`;
        }, this);

        this.stepsRemaining = ko.pureComputed(function () {
            return this.totalSteps - this.steps();
        }, this);

        if (this.pokemon) {
            const dataPokemon: DataPokemon = PokemonHelper.getPokemonByName(this.pokemon);
            this.pokemonType1 = dataPokemon.type1;
            this.pokemonType2 = dataPokemon.type2 === PokemonType.None ? dataPokemon.type1 : dataPokemon.type2;
        } else {
            this.pokemonType1 = PokemonType['Normal'];
            this.pokemonType2 = PokemonType['Normal'];
        }
    }

    isNone() {
        return this.type === EggType.None;
    }

    addSteps(amount: number) {
        if (this.isNone() || this.notified) {
            return;
        }
        if (!+amount) {
            amount = 1;
        }
        this.steps(this.steps() + amount);
        if (App.game.oakItems.isActive(OakItems.OakItem.Shiny_Charm)) {
            this.shinySteps += amount;
        }
        if (this.canHatch()) {
            if (this.type == EggType.Pokemon) {
                Notifier.notify({
                    message: `${this.pokemon} is ready to hatch!`,
                    type: NotificationConstants.NotificationOption.success,
                    sound: NotificationConstants.NotificationSound.ready_to_hatch,
                    setting: NotificationConstants.NotificationSetting.ready_to_hatch,
                });
            } else {
                Notifier.notify({
                    message: 'An egg is ready to hatch!',
                    type: NotificationConstants.NotificationOption.success,
                    sound: NotificationConstants.NotificationSound.ready_to_hatch,
                    setting: NotificationConstants.NotificationSetting.ready_to_hatch,
                });
            }
            this.notified = true;
        }
    }

    canHatch(): boolean {
        return !this.isNone() && this.steps() >= this.totalSteps;
    }

    hatch(): boolean {
        if (!this.canHatch()) {
            return false;
        }
        const shinyChance = GameConstants.SHINY_CHANCE_BREEDING - (0.5 * GameConstants.SHINY_CHANCE_BREEDING * Math.min(1, this.shinySteps / this.steps()));
        const shiny = PokemonFactory.generateShiny(shinyChance);

        const partyPokemon = App.game.party.caughtPokemon.find(p => p.name == this.pokemon);
        // If the party pokemon exist, increase it's damage output
        if (partyPokemon) {
            // Increase attack
            partyPokemon.attackBonusPercent += GameConstants.BREEDING_ATTACK_BONUS;
            partyPokemon.attackBonusAmount += partyPokemon.proteinsUsed();
            partyPokemon.attack = partyPokemon.calculateAttack();

            // If breeding (not store egg), reset level, reset evolution check
            if (partyPokemon.breeding) {
                if (partyPokemon.evolutions !== undefined) {
                    partyPokemon.evolutions.forEach(evo => evo instanceof LevelEvolution ? evo.triggered = false : undefined);
                }
                partyPokemon.exp = 0;
                partyPokemon.level = 1;
                partyPokemon.breeding = false;
                partyPokemon.level = partyPokemon.calculateLevelFromExp();
                partyPokemon.checkForLevelEvolution();
            }
        }

        const pokemonID = PokemonHelper.getPokemonByName(this.pokemon).id;

        App.game.party.gainPokemonById(pokemonID, shiny);

        if (shiny) {
            Notifier.notify({
                message: `✨ You hatched a shiny ${this.pokemon}! ✨`,
                type: NotificationConstants.NotificationOption.warning,
                sound: NotificationConstants.NotificationSound.shiny_long,
                setting: NotificationConstants.NotificationSetting.hatched_shiny,
            });
            App.game.logbook.newLog(LogBookTypes.SHINY, `You hatched a shiny ${this.pokemon}!`);
            GameHelper.incrementObservable(App.game.statistics.shinyPokemonHatched[pokemonID]);
            GameHelper.incrementObservable(App.game.statistics.totalShinyPokemonHatched);
        } else {
            Notifier.notify({
                message: `You hatched ${GameHelper.anOrA(this.pokemon)} ${this.pokemon}!`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.hatched,
            });
        }

        // Capture base form if not already caught. This helps players get Gen2 Pokemon that are base form of Gen1
        const baseForm = App.game.breeding.calculateBaseForm(this.pokemon);
        if (this.pokemon != baseForm && !App.game.party.alreadyCaughtPokemon(PokemonHelper.getPokemonByName(baseForm).id)) {
            Notifier.notify({
                message: `You also found ${GameHelper.anOrA(baseForm)} ${baseForm} nearby!`,
                type: NotificationConstants.NotificationOption.success,
            });
            App.game.party.gainPokemonById(PokemonHelper.getPokemonByName(baseForm).id);
        }

        // Update statistics
        GameHelper.incrementObservable(App.game.statistics.pokemonHatched[pokemonID]);
        GameHelper.incrementObservable(App.game.statistics.totalPokemonHatched);
        App.game.oakItems.use(OakItems.OakItem.Blaze_Cassette);
        return true;
    }

    toJSON(): Record<string, any> {
        return {
            totalSteps: this.totalSteps,
            steps: this.steps(),
            shinySteps: this.shinySteps,
            pokemon: this.pokemon,
            type: this.type,
            notified: this.notified,
        };

    }

    fromJSON(json: Record<string, any>): void {
        this.totalSteps = json['totalSteps'];
        this.steps = ko.observable(json['steps']);
        this.shinySteps = json['shinySteps'];
        this.pokemon = json['pokemon'];
        this.type = json['type'];
        this.notified = json['notified'];
        this.init();
    }
}
