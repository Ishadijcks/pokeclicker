/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Feature.d.ts" />
/// <reference path="../../declarations/breeding/EggType.d.ts" />

import Currency = GameConstants.Currency;

class Breeding implements Feature {
    name = 'Breeding';
    saveKey = 'breeding';

    defaults = {
        eggList: [ko.observable(new Egg()), ko.observable(new Egg()), ko.observable(new Egg()), ko.observable(new Egg())],
        eggSlots: 1,
        queueList: [],
        queueSlots: 0,
        batchFill: 4,
    };

    private _eggList: Array<KnockoutObservable<Egg>>;
    private _eggSlots: KnockoutObservable<number>;
    private _batchFill: KnockoutObservable<number>;

    private queueList: KnockoutObservableArray<PokemonNameType>;
    private queueSlots: KnockoutObservable<number>;

    public hatchList: { [name: number]: PokemonNameType[][] } = {};

    constructor(private multiplier: Multiplier) {
        this._eggList = this.defaults.eggList;
        this._eggSlots = ko.observable(this.defaults.eggSlots);
        this.queueList = ko.observableArray(this.defaults.queueList);
        this.queueSlots = ko.observable(this.defaults.queueSlots);
        this._batchFill = ko.observable(this.defaults.batchFill);

        this._eggList.forEach((egg) => {
            egg.extend({deferred: true});
        });
        BreedingController.filter.category(Settings.getSetting('breedingCategoryFilter').value);
        BreedingController.filter.region(Settings.getSetting('breedingRegionFilter').value);
        BreedingController.filter.type1(Settings.getSetting('breedingTypeFilter1').value);
        BreedingController.filter.type2(Settings.getSetting('breedingTypeFilter2').value);
        BreedingController.filter.shinyStatus(Settings.getSetting('breedingShinyFilter').value);
        BreedingController.displayValue(Settings.getSetting('breedingDisplayFilter').value);
    }

    initialize(): void {
        this.hatchList[EggType.Fire] = [
            ['Charmander', 'Vulpix', 'Growlithe', 'Ponyta'],
            ['Cyndaquil', 'Slugma', 'Houndour', 'Magby'],
            ['Torchic', 'Numel'],
            ['Chimchar'],
            ['Tepig', 'Pansear'],
            ['Fennekin'],
            ['Litten'],
            ['Scorbunny', 'Sizzlipede'],
        ];
        this.hatchList[EggType.Water] = [
            ['Squirtle', 'Lapras', 'Staryu', 'Psyduck'],
            ['Totodile', 'Wooper', 'Marill', 'Qwilfish'],
            ['Mudkip', 'Feebas', 'Clamperl'],
            ['Piplup', 'Finneon', 'Buizel'],
            ['Oshawott', 'Panpour'],
            ['Froakie'],
            ['Popplio', 'Wimpod'],
            ['Sobble', 'Chewtle'],
        ];
        this.hatchList[EggType.Grass] = [
            ['Bulbasaur', 'Oddish', 'Tangela', 'Bellsprout'],
            ['Chikorita', 'Hoppip', 'Sunkern'],
            ['Treecko', 'Tropius', 'Roselia'],
            ['Turtwig', 'Carnivine', 'Budew'],
            ['Snivy', 'Pansage'],
            ['Chespin'],
            ['Rowlet', 'Morelull'],
            ['Grookey', 'Gossifleur'],
        ];
        this.hatchList[EggType.Fighting] = [
            ['Hitmonlee', 'Hitmonchan', 'Machop', 'Mankey'],
            ['Tyrogue'],
            ['Makuhita', 'Meditite'],
            ['Riolu'],
            ['Throh', 'Sawk'],
            [],
            ['Crabrawler'],
            ['Falinks'],
        ];
        this.hatchList[EggType.Electric] = [
            ['Magnemite', 'Pikachu', 'Voltorb', 'Electabuzz'],
            ['Chinchou', 'Mareep', 'Elekid'],
            ['Plusle', 'Minun', 'Electrike'],
            ['Pachirisu', 'Shinx'],
            ['Blitzle'],
            [],
            [],
            ['Toxel', 'Pincurchin'],
        ];
        this.hatchList[EggType.Dragon] = [
            ['Dratini', 'Dragonair', 'Dragonite'],
            [],
            ['Bagon', 'Shelgon', 'Salamence'],
            ['Gible', 'Gabite', 'Garchomp'],
            ['Deino', 'Zweilous', 'Hydreigon'],
            ['Goomy'],
            ['Turtonator', 'Drampa', 'Jangmo-o', 'Hakamo-o', 'Kommo-o'],
            ['Dreepy', 'Drakloak', 'Dragapult'],
        ];
        BreedingController.initialize();
    }

    update(delta: number): void {
    }

    canAccess(): boolean {
        return App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Mystery_egg);
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        this.eggSlots = json['eggSlots'] ?? this.defaults.eggSlots;

        if (json['eggList'] == null) {
            this._eggList = this.defaults.eggList;
        } else {
            const saveEggList: Record<string, any>[] = json['eggList'];

            for (let i = 0; i < this._eggList.length; i++) {
                if (saveEggList[i] != null) {
                    const egg: Egg = new Egg(null, null, null);
                    egg.fromJSON(saveEggList[i]);
                    this._eggList[i](egg);
                }
            }
        }
        this.queueSlots(json['queueSlots'] ?? this.defaults.queueSlots);
        this.queueList(json['queueList'] ? json['queueList'] : this.defaults.queueList);
    }


    toJSON(): Record<string, any> {
        return {
            eggList: this.eggList.map(egg => egg() === null ? new Egg() : egg().toJSON()),
            eggSlots: this.eggSlots,
            queueList: this.queueList(),
            queueSlots: this.queueSlots(),
        };
    }

    public canBreedPokemon(): boolean {
        return App.game.party.hasMaxLevelPokemon() && (this.hasFreeEggSlot() || this.hasFreeQueueSlot());
    }

    public hasFreeEggSlot(): boolean {
        let counter = 0;
        for (const egg of this._eggList) {
            if (!egg().isNone()) {
                counter++;
            }
        }
        return counter < this._eggSlots();
    }

    public hasFreeQueueSlot(): boolean {
        const slots = this.queueSlots();
        return slots && this.queueList().length < slots;
    }

    public gainEgg(e: Egg) {
        if (e.isNone()) {
            return false;
        }
        for (let i = 0; i < this._eggList.length; i++) {
            if (this._eggList[i]().isNone()) {
                this._eggList[i](e);
                return true;
            }
        }
        console.error(`Error: Could not place ${EggType[e.type]} Egg`);
        return false;
    }

    public gainRandomEgg() {
        return this.gainEgg(this.createRandomEgg());
    }

    public progressEggsBattle(route: number, region: GameConstants.Region) {
        route = MapHelper.normalizeRoute(route, region);
        return this.progressEggs(+Math.sqrt(route).toFixed(2));
    }

    public progressEggs(amount: number) {
        amount *= this.getStepMultiplier();

        amount = Math.round(amount);
        let index =  this.eggList.length;
        while (index-- > 0) {
            const egg = this.eggList[index]();
            egg.addSteps(amount, this.multiplier);
            if (this.queueList().length && egg.progress() >= 100) {
                this.hatchPokemonEgg(index);
            }
        }
    }

    private getStepMultiplier() {
        return this.multiplier.getBonus('eggStep');
    }

    public fillHatcheryQueue() {
        let index = 0;
        let count = 0;
        while (this.hasFreeQueueSlot() && index < App.game.party.caughtPokemon.length && count <= this._batchFill()) {
            const pokemon: PartyPokemon = App.game.party.caughtPokemon[index];
            if (BreedingController.visible(pokemon)()) {
                this.addPokemonToHatchery(pokemon);
                count++;
            }
            index++;
        }
    }

    public addPokemonToHatchery(pokemon: PartyPokemon): boolean {
        // If they have a free eggslot, add the pokemon to the egg now
        if (this.hasFreeEggSlot()) {
            return this.gainPokemonEgg(pokemon);
        }
        // If they have a free queue, add the pokemon to the queue now
        if (this.hasFreeQueueSlot()) {
            return this.addToQueue(pokemon);
        }
        let message = 'You don\'t have any free egg slots';
        if (this.queueSlots()) {
            message += '<br/>Your queue is full';
        }
        Notifier.notify({
            message,
            type: NotificationConstants.NotificationOption.warning,
        });
        return false;
    }

    public addToQueue(pokemon: PartyPokemon): boolean {
        const queueSize = this.queueList().length;
        if (queueSize < this.queueSlots()) {
            pokemon.breeding = true;
            this.queueList.push(pokemon.name);
            return true;
        }
        return false;
    }

    public removeFromQueue(index: number): boolean {
        const queueSize = this.queueList().length;
        if (queueSize > index) {
            const pokemonName = this.queueList.splice(index, 1)[0];
            App.game.party._caughtPokemon().find(p => p.name == pokemonName).breeding = false;
            return true;
        }
        return false;
    }

    public gainPokemonEgg(pokemon: PartyPokemon | PokemonListData): boolean {
        if (!this.hasFreeEggSlot()) {
            Notifier.notify({
                message: 'You don\'t have any free egg slots',
                type: NotificationConstants.NotificationOption.warning,
            });
            return false;
        }
        const egg = this.createEgg(pokemon.name);

        if (pokemon instanceof PartyPokemon) {
            pokemon.breeding = true;
        }

        return this.gainEgg(egg);
    }

    public hatchPokemonEgg(index: number): void {
        const egg: Egg = this._eggList[index]();
        const hatched = egg.hatch();
        if (hatched) {
            this._eggList[index](new Egg());
            this.moveEggs();
            if (this.queueList().length) {
                const nextEgg = this.createEgg(this.queueList.shift());
                this.gainEgg(nextEgg);
                if (!this.queueList().length) {
                    Notifier.notify({
                        message: 'Hatchery queue is empty',
                        type: NotificationConstants.NotificationOption.success,
                        timeout: 1e4,
                        sound: NotificationConstants.NotificationSound.empty_queue,
                        setting: NotificationConstants.NotificationSetting.empty_queue,
                    });
                }
            }
        }
    }

    public moveEggs(): void {
        const tempEggList = App.game.breeding._eggList.filter(egg => egg().type != EggType.None);

        this._eggList.forEach((egg, index) => {
            egg(tempEggList[index] ? tempEggList[index]() : new Egg());
        });
    }

    public createEgg(pokemonName: PokemonNameType, type = EggType.Pokemon): Egg {
        const dataPokemon: DataPokemon = PokemonHelper.getPokemonByName(pokemonName);
        return new Egg(type, this.getSteps(dataPokemon.eggCycles), pokemonName);
    }

    public createTypedEgg(type: EggType): Egg {
        const hatchList = this.hatchList[type];
        const hatchable = hatchList.slice(0, player.highestRegion() + 1).filter(list => list.length);

        // highest region has 1/ratio chance, next highest has 1/(ratio ^ 2), etc.
        // Leftover is given to Kanto, making Kanto and Johto equal chance
        const ratio = 2;
        const possibleHatches = GameConstants.expRandomElement(hatchable, ratio);

        const pokemon = GameConstants.randomElement(possibleHatches);
        return this.createEgg(pokemon, type);
    }

    public createRandomEgg(): Egg {
        const type = Math.floor(Math.random() * Object.keys(this.hatchList).length);
        const egg = this.createTypedEgg(type);
        egg.type = EggType.Mystery;
        return egg;
    }

    public createFossilEgg(fossil: string): Egg {
        const pokemonName: PokemonNameType = GameConstants.FossilToPokemon[fossil];
        const pokemonNativeRegion = PokemonHelper.calcNativeRegion(pokemonName);
        if (pokemonNativeRegion > player.highestRegion()) {
            Notifier.notify({
                message: 'You must progress further before you can uncover this fossil Pokémon!',
                type: NotificationConstants.NotificationOption.warning,
                timeout: 5e3,
            });
            return new Egg();
        }
        return this.createEgg(pokemonName, EggType.Fossil);
    }

    public getSteps(eggCycles: number) {
        if (eggCycles === undefined) {
            return 500;
        } else {
            return eggCycles * 40;
        }
    }

    public calculateBaseForm(pokemonName: PokemonNameType): PokemonNameType {
        const devolution = pokemonBabyPrevolutionMap[pokemonName];
        // Base form of Pokemon depends on which regions players unlocked
        if (!devolution || PokemonHelper.calcNativeRegion(devolution) > player.highestRegion()) {
            // No devolutions at all
            // No further devolutions in current unlocked regions
            return pokemonName;
        } else {
            // Recurse onto its devolution
            return this.calculateBaseForm(devolution);
        }
    }

    public getEggSlotCost(slot: number): number {
        return 500 * slot;
    }

    public buyEggSlot(): void {
        const cost: Amount = this.nextEggSlotCost();
        if (App.game.wallet.hasAmount(cost)) {
            App.game.wallet.loseAmount(cost);
            this.gainEggSlot();
        }
    }

    public nextEggSlotCost(): Amount {
        return new Amount(this.getEggSlotCost(this.eggSlots + 1), Currency.questPoint);
    }

    // Knockout getters/setters
    get eggSlots(): number {
        return this._eggSlots();
    }

    set eggSlots(value: number) {
        this._eggSlots(value);
    }

    get batchFill(): number {
        return this._batchFill();
    }

    set batchFill(value: number) {
        this._batchFill(value);
    }

    public gainEggSlot(): void {
        if (this.eggSlots === this.eggList.length) {
            console.error('Cannot gain another eggslot.');
            return;
        }
        this.eggSlots += 1;
    }

    public gainQueueSlot(amt = 1): void {
        GameHelper.incrementObservable(this.queueSlots, amt);
    }

    public queueSlotsGainedFromRegion(region: GameConstants.Region): number {
        return Math.max(4, 4 * Math.pow(2, region - 1));
    }

    get eggList(): Array<KnockoutObservable<Egg>> {
        return this._eggList;
    }

    set eggList(value: Array<KnockoutObservable<Egg>>) {
        this._eggList = value;
    }

    getAllCaughtStatus(): CaughtStatus {
        return GameHelper.enumNumbers(EggType).reduce((status: CaughtStatus, type: EggType) => {
            return this.hatchList[type]
                ? Math.min(status, this.getTypeCaughtStatus(type))
                : status;
        }, CaughtStatus.CaughtShiny);
    }

    getTypeCaughtStatus(type: EggType): CaughtStatus {
        const hatchList = this.hatchList[type];
        if (!hatchList) {
            return CaughtStatus.NotCaught;
        }

        const hatchable = hatchList.slice(0, player.highestRegion() + 1).flat();

        return hatchable.reduce((status: CaughtStatus, pname: PokemonNameType) => {
            return Math.min(status, PartyController.getCaughtStatusByName(pname));
        }, CaughtStatus.CaughtShiny);
    }

    checkCloseModal(): void {
        if (Settings.getSetting('hideHatchery').value == 'queue' && !this.hasFreeEggSlot() && !this.hasFreeQueueSlot()) {
            $('#breedingModal').modal('hide');
        }
        if (Settings.getSetting('hideHatchery').value == 'egg' && !this.hasFreeEggSlot()) {
            $('#breedingModal').modal('hide');
        }
    }

}
