/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Saveable.d.ts" />
/// <reference path="../../declarations/breeding/EggType.d.ts" />

class Egg implements Saveable {
    saveKey = 'egg';

    defaults = {};

    steps: KnockoutObservable<number>;
    pokemonType1: PokemonType;
    pokemonType2: PokemonType;
    progress: KnockoutComputed<number>;
    progressText: KnockoutComputed<string>;
    stepsRemaining: KnockoutComputed<number>;

    constructor(
        public type = EggType.None,
        public totalSteps = 0,
        public pokemon: PokemonNameType = 'MissingNo.',
        steps = 0,
        public shinyChance = GameConstants.SHINY_CHANCE_BREEDING,
        public notified = false
    ) {
        this.steps = ko.observable(steps);
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

    updateShinyChance(steps: number, multiplier) {
        const stepsChance = GameConstants.SHINY_CHANCE_BREEDING / multiplier.getBonus('shiny');
        const newChance = ((this.shinyChance * this.steps()) + (stepsChance * steps)) / (this.steps() + steps);

        this.shinyChance = newChance;
    }

    addSteps(amount: number, multiplier: Multiplier) {
        if (this.isNone() || this.notified) {
            return;
        }
        if (!+amount) {
            amount = 1;
        }
        this.updateShinyChance(amount, multiplier);
        this.steps(this.steps() + amount);
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
        const shiny = PokemonFactory.generateShiny(this.shinyChance, true);

        const partyPokemon = App.game.party.caughtPokemon.find(p => p.name == this.pokemon);
        // If the party pokemon exist, increase it's damage output
        if (partyPokemon) {
            // Increase attack
            partyPokemon.attackBonusPercent += GameConstants.BREEDING_ATTACK_BONUS;
            partyPokemon.attackBonusAmount += partyPokemon.proteinsUsed();

            // If breeding (not store egg), reset level, reset evolution check
            if (partyPokemon.location === PartyLocation.Hatchery) {
                if (partyPokemon.evolutions !== undefined) {
                    partyPokemon.evolutions.forEach(evo => evo instanceof LevelEvolution ? evo.triggered = false : undefined);
                }
                partyPokemon.exp = 0;
                partyPokemon.level = 1;
                partyPokemon.location = PartyLocation.Battle;
                partyPokemon.level = partyPokemon.calculateLevelFromExp();
                partyPokemon.checkForLevelEvolution();
            }

            // Recalculate current attack
            partyPokemon.attack = partyPokemon.calculateAttack();
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
            shinyChance: this.shinyChance,
            pokemon: this.pokemon,
            type: this.type,
            notified: this.notified,
        };

    }

    fromJSON(json: Record<string, any>): void {
        this.totalSteps = json['totalSteps'];
        this.steps = ko.observable(json['steps']);
        this.shinyChance = json['shinyChance'];
        this.pokemon = json['pokemon'];
        this.type = json['type'];
        this.notified = json['notified'];
        this.init();
    }
}
