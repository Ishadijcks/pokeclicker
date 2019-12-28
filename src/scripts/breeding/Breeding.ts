import Currency = GameConstants.Currency;

class Breeding implements Feature {
    name: string = "Breeding";
    saveKey: string = "breeding";

    private _eggList: Array<KnockoutObservable<Egg | void>>;
    private _eggSlots: KnockoutObservable<number>;

    private hatchList: { [name: number]: string[][] } = {};

    constructor() {
        this._eggList = [ko.observable(null), ko.observable(null), ko.observable(null), ko.observable(null)];
        this._eggSlots = ko.observable(1);
    }

    initialize(): void {
        this.hatchList[GameConstants.EggType.Fire] = [
            ["Charmander", "Vulpix", "Growlithe", "Ponyta"],
            ["Cyndaquil", "Slugma", "Houndour", "Magby"],
        ];
        this.hatchList[GameConstants.EggType.Water] = [
            ["Squirtle", "Lapras", "Staryu", "Psyduck"],
            ["Totodile", "Wooper", "Marill", "Qwilfish"],
        ];
        this.hatchList[GameConstants.EggType.Grass] = [
            ["Bulbasaur", "Oddish", "Tangela", "Bellsprout"],
            ["Chikorita", "Hoppip", "Sunkern"],
        ];
        this.hatchList[GameConstants.EggType.Fighting] = [
            ["Hitmonlee", "Hitmonchan", "Machop", "Mankey"],
            ["Tyrogue"],
        ];
        this.hatchList[GameConstants.EggType.Electric] = [
            ["Magnemite", "Pikachu", "Voltorb", "Electabuzz"],
            ["Chinchou", "Mareep", "Elekid"],
        ];
        this.hatchList[GameConstants.EggType.Dragon] = [
            ["Dratini", "Dragonair", "Dragonite"],
            [],
        ];

    }

    update(delta: number): void {
    }

    canAccess(): boolean {
        return player.hasKeyItem("Mystery egg");
    }

    fromJSON(json: object): void {
        if (json == null) {
            return;
        }

        let saveEggList: object[] = json["eggList"];

        for (let i = 0; i < this._eggList.length; i++) {
            if (saveEggList[i] != null) {
                let egg: Egg = new Egg(null, null, null);
                egg.fromJSON(saveEggList[i]);
                this._eggList[i](egg);
            }
        }
        this.eggSlots = json["eggSlots"];
    }


    toJSON(): object {
        let breedingSave = {};
        breedingSave["eggList"] = this.eggList.map(function (egg: any) {
                return egg() === null ? null : egg().toJSON();
            }
        );
        breedingSave["eggSlots"] = this.eggSlots;
        return breedingSave;
    }

    public canBreedPokemon(): boolean {
        return player.hasMaxLevelPokemon() && this.hasFreeEggSlot();
    }

    public hasFreeEggSlot(): boolean {
        let counter = 0;
        for (let egg of this._eggList) {
            if (egg() !== null) {
                counter++;
            }
        }
        return counter < this._eggSlots();
    }

    public gainEgg(e: Egg) {
        for (let i = 0; i < this._eggList.length; i++) {
            if (this._eggList[i]() == null) {
                this._eggList[i](e);
                return true;
            }
        }
        console.log("Error: Could not place " + GameConstants.EggType[e.type] + " Egg");
        return false;
    }

    public gainRandomEgg() {
        return this.gainEgg(this.createRandomEgg());
    }

    public progressEggs(amount: number) {
        if (OakItemRunner.isActive(GameConstants.OakItem.Blaze_Cassette)) {
            amount *= (1 + OakItemRunner.calculateBonus(GameConstants.OakItem.Blaze_Cassette) / 100)
        }
        amount = Math.round(amount);
        for (let obj of this._eggList) {
            // TODO(@Isha) fix this properly.
            let egg: any = obj();
            if (egg == null || egg.notified) {
                continue;
            }
            egg.steps(egg.steps() + amount);
            if (OakItemRunner.isActive(GameConstants.OakItem.Shiny_Charm)) {
                egg.shinySteps += amount;
            }
            if (egg.steps() >= egg.totalSteps) {
                if (egg.type == GameConstants.EggType.Pokemon) {
                    Notifier.notify(egg.pokemon + " is ready to hatch!", GameConstants.NotificationOption.success);
                } else {
                    Notifier.notify("An egg is ready to hatch!", GameConstants.NotificationOption.success);
                }
                egg.notified = true;
            }
        }
    }

    public gainPokemonEgg(pokemon: CaughtPokemon) {
        if (!this.hasFreeEggSlot()) {
            Notifier.notify("You don't have any free egg slots", GameConstants.NotificationOption.warning);
            return;
        }
        let egg = this.createEgg(pokemon.name);
        pokemon.breeding(true);
        this.gainEgg(egg);
        pokemon.attackBonus(pokemon.attackBonus() + GameConstants.BREEDING_ATTACK_BONUS);
    }

    public hatchPokemonEgg(index: number) {
        // TODO(@Isha) fix this properly.
        let egg: any = this._eggList[index]();
        let shinyChance = GameConstants.SHINY_CHANCE_BREEDING - (0.5 * GameConstants.SHINY_CHANCE_BREEDING * Math.min(1, egg.shinySteps / egg.steps()));
        let shiny = PokemonFactory.generateShiny(shinyChance);

        for (let i = 0; i < player._caughtPokemonList().length; i++) {
            if (player._caughtPokemonList()[i].name == egg.pokemon) {
                if (player._caughtPokemonList()[i].breeding()) {
                    player._caughtPokemonList()[i].exp(0);
                    player._caughtPokemonList()[i].breeding(false);
                    player._caughtPokemonList()[i].checkForEvolution(true);
                }
            }
        }

        if (shiny) {
            Notifier.notify(`✨ You hatched a shiny ${egg.pokemon}! ✨`, GameConstants.NotificationOption.warning);
        } else {
            Notifier.notify(`You hatched ${GameHelper.anOrA(egg.pokemon)} ${egg.pokemon}!`, GameConstants.NotificationOption.success);
        }

        player.capturePokemon(egg.pokemon, shiny);

        // Capture base form if not already caught. This helps players get Gen2 Pokemon that are base form of Gen1
        let baseForm = this.calculateBaseForm(egg.pokemon);
        if (egg.pokemon != baseForm && !player.alreadyCaughtPokemon(baseForm)) {
            Notifier.notify(`You also found ${GameHelper.anOrA(baseForm)} ${baseForm} nearby!`, GameConstants.NotificationOption.success);
            player.capturePokemon(baseForm, false, true);
        }

        this._eggList[index](null);
        GameHelper.incrementObservable(player.statistics.hatchedEggs);
        OakItemRunner.use(GameConstants.OakItem.Blaze_Cassette);
    }

    public createEgg(pokemonName: string, type = GameConstants.EggType.Pokemon): Egg {
        let dataPokemon: DataPokemon = PokemonHelper.getPokemonByName(pokemonName);
        return new Egg(this.getSteps(dataPokemon.eggCycles), pokemonName, type);
    }

    public createTypedEgg(type: GameConstants.EggType): Egg {
        const hatchList = this.hatchList[type];
        const hatchable = hatchList.slice(0, player.highestRegion() + 1);
        let possibleHatches = [];
        hatchable.forEach((pokemon, index) => {
            if (!pokemon.length) return;
            const toAdd = possibleHatches.length || 1;
            for (let i = 0; i < toAdd; i++) {
                possibleHatches.push(pokemon);
            }
        });
        possibleHatches = possibleHatches[Math.floor(Math.random() * possibleHatches.length)];
        const pokemon = possibleHatches[Math.floor(Math.random() * possibleHatches.length)];
        return this.createEgg(pokemon, type);
    }

    public createRandomEgg(): Egg {
        let type = Math.floor(Math.random() * (Object.keys(this.hatchList).length - 1));
        let egg = this.createTypedEgg(type);
        egg.type = GameConstants.EggType.Mystery;
        return egg;
    }

    public createFossilEgg(fossil: string): Egg {
        let pokemonName = GameConstants.FossilToPokemon[fossil];
        return this.createEgg(pokemonName, GameConstants.EggType.Fossil);
    }

    public getSteps(eggCycles: number) {
        if (eggCycles === undefined) {
            return 500;
        } else {
            return eggCycles * 40;
        }
    };

    public getEggSlotCost(slot: number): number {
        return 500 * slot;
    }

    public calculateBaseForm(pokemonName: string): string {
        // Base form of Pokemon depends on which regions players unlocked
        if (!(pokemonName in pokemonDevolutionMap)) {
            // No devolutions at all
            return pokemonName;
        } else if (PokemonHelper.calcNativeRegion(pokemonDevolutionMap[pokemonName]) > player.highestRegion()) {
            // No further devolutions in current unlocked regions
            return pokemonName;
        } else {
            // Recurse onto its devolution
            return this.calculateBaseForm(pokemonDevolutionMap[pokemonName]);
        }
    }

    public buyEggSlot() {
        let cost: Cost = this.nextEggSlotCost();
        if (player.canAfford(cost)) {
            player.payCost(cost);
            this.gainEggSlot();
        }
    }

    public nextEggSlotCost(): Cost {
        return new Cost(this.getEggSlotCost(this.eggSlots + 1), Currency.questPoint);
    }

    // Knockout getters/setters
    get eggSlots(): number {
        return this._eggSlots();
    }

    set eggSlots(value: number) {
        this._eggSlots(value);
    }

    public gainEggSlot() {
        this.eggSlots += 1;
    }

    get eggList(): Array<KnockoutObservable<Egg | void>> {
        return this._eggList;
    }

    set eggList(value: Array<KnockoutObservable<Egg | void>>) {
        this._eggList = value;
    }

}
