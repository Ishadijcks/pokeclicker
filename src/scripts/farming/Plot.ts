class Plot implements Saveable {
    saveKey = '';
    defaults = {
        isUnlocked: false,
        berry: BerryType.None,
        age: 0,
        mulch: MulchType.None,
        mulchTimeLeft: 0,
    };

    _isUnlocked: KnockoutObservable<boolean>;
    _berry: KnockoutObservable<BerryType>;
    _age: KnockoutObservable<number>;

    _mulch: KnockoutObservable<MulchType>;
    _mulchTimeLeft: KnockoutObservable<number>;

    _auras: KnockoutObservable<number>[];

    _hasWarnedAboutToWither: boolean;

    formattedStageTimeLeft: KnockoutComputed<string>;
    formattedTimeLeft: KnockoutComputed<string>;
    formattedMulchTimeLeft: KnockoutComputed<string>;
    formattedAuras: KnockoutComputed<string>;

    auraGrowth: KnockoutComputed<number>;
    auraHarvest: KnockoutComputed<number>;
    auraMutation: KnockoutComputed<number>;
    auraReplant: KnockoutComputed<number>;
    auraDeath: KnockoutComputed<number>;
    auraBoost: KnockoutComputed<number>;

    isEmpty: KnockoutComputed<boolean>;
    isMulched: KnockoutComputed<boolean>;
    stage: KnockoutComputed<number>;
    tooltip: KnockoutComputed<string>;
    notifications: FarmNotificationType[];

    constructor(isUnlocked: boolean, berry: BerryType, age: number, mulch: MulchType, mulchTimeLeft: number) {
        this._isUnlocked = ko.observable(isUnlocked);
        this._berry = ko.observable(berry).extend({ numeric: 0 });
        this._age = ko.observable(age).extend({ numeric: 3 });
        this._mulch = ko.observable(mulch).extend({ numeric: 0 });
        this._mulchTimeLeft = ko.observable(mulchTimeLeft).extend({ numeric: 3 });

        this._auras = [];
        this._auras[AuraType.Growth] = ko.observable(1);
        this._auras[AuraType.Harvest] = ko.observable(1);
        this._auras[AuraType.Mutation] = ko.observable(1);
        this._auras[AuraType.Replant] = ko.observable(1);
        this._auras[AuraType.Death] = ko.observable(1);
        this._auras[AuraType.Boost] = ko.observable(1);

        this.formattedStageTimeLeft = ko.pureComputed(() => {
            if (this.berry === BerryType.None) {
                return '';
            }
            const growthTime = this.berryData.growthTime.find(t => this.age < t);
            const timeLeft = Math.ceil(growthTime - this.age);
            const growthMultiplier = App.game.farming.getGrowthMultiplier() * this.getGrowthMultiplier();
            return GameConstants.formatTime(timeLeft / growthMultiplier);
        });

        this.formattedTimeLeft = ko.pureComputed(() => {
            if (this.berry === BerryType.None) {
                return '';
            }
            let timeLeft = 0;
            if (this.age < this.berryData.growthTime[3]) {
                timeLeft = Math.ceil(this.berryData.growthTime[3] - this.age);
            } else {
                timeLeft = Math.ceil(this.berryData.growthTime[4] - this.age);
            }
            const growthMultiplier = App.game.farming.getGrowthMultiplier() * this.getGrowthMultiplier();
            return GameConstants.formatTime(timeLeft / growthMultiplier);
        });

        this.formattedMulchTimeLeft = ko.pureComputed(() => {
            if (this.mulch === MulchType.None) {
                return '';
            }
            return GameConstants.formatTime(this.mulchTimeLeft);
        });

        this.auraGrowth = ko.pureComputed(() => {
            return this._auras[AuraType.Growth]();
        });
        this.auraHarvest = ko.pureComputed(() => {
            return this._auras[AuraType.Harvest]();
        });
        this.auraMutation = ko.pureComputed(() => {
            return this._auras[AuraType.Mutation]();
        });
        this.auraReplant = ko.pureComputed(() => {
            return this._auras[AuraType.Replant]();
        });
        this.auraDeath = ko.pureComputed(() => {
            return this._auras[AuraType.Death]();
        });
        this.auraBoost = ko.pureComputed(() => {
            return this._auras[AuraType.Boost]();
        });

        this.formattedAuras = ko.pureComputed(() => {
            const auraStr = [];
            if (this.auraGrowth() !== 1) {
                auraStr.push(`Growth: ${this.auraGrowth().toFixed(2)}x`);
            }

            if (this.auraHarvest() !== 1) {
                auraStr.push(`Harvest: ${this.auraHarvest().toFixed(2)}x`);
            }

            if (this.auraMutation() !== 1) {
                auraStr.push(`Mutation: ${this.auraMutation().toFixed(2)}x`);
            }

            if (this.auraReplant() !== 1) {
                auraStr.push(`Replant: ${this.auraReplant().toFixed(2)}x`);
            }

            if (this.auraDeath() !== 1) {
                auraStr.push(`Death: ${this.auraDeath().toFixed(2)}x`);
            }

            if (this.auraBoost() !== 1) {
                auraStr.push(`Boost: ${this.auraBoost().toFixed(2)}x`);
            }
            return auraStr.join('<br/>');
        });

        this.isEmpty = ko.pureComputed(() => {
            return this.berry === BerryType.None;
        });

        this.stage = ko.pureComputed(() => {
            if (this.berry === BerryType.None) {
                return PlotStage.Seed;
            }
            return this.berryData.growthTime.findIndex(t => this.age <= t);
        });

        this.tooltip = ko.pureComputed(() => {
            const tooltip = [];

            // Time
            if (this.berry !== BerryType.None) {

                tooltip.push(`<u>${BerryType[this.berry]}</u>`);

                // Petaya Effect
                if (App.game.farming.berryInFarm(BerryType.Petaya) && this.berry !== BerryType.Petaya && this.stage() == PlotStage.Berry) {
                    tooltip.push('∞ until death');
                // Normal Time
                } else {
                    const timeType = Settings.getSetting('farmDisplay').observableValue();
                    if (timeType === 'nextStage') {
                        const formattedTime = this.formattedStageTimeLeft();
                        switch (this.stage()) {
                            case PlotStage.Seed:
                                tooltip.push(`${formattedTime} until sprout`);
                                break;
                            case PlotStage.Sprout:
                                tooltip.push(`${formattedTime} until grown`);
                                break;
                            case PlotStage.Taller:
                                tooltip.push(`${formattedTime} until bloom`);
                                break;
                            case PlotStage.Bloom:
                                tooltip.push(`${formattedTime} until ripe`);
                                break;
                            case PlotStage.Berry:
                                tooltip.push(`${formattedTime} until death`);
                                break;
                        }
                    } else {
                        const formattedTime = this.formattedTimeLeft();
                        switch (this.stage()) {
                            case PlotStage.Seed:
                            case PlotStage.Sprout:
                            case PlotStage.Taller:
                            case PlotStage.Bloom:
                                tooltip.push(`${formattedTime} until ripe`);
                                break;
                            case PlotStage.Berry:
                                tooltip.push(`${formattedTime} until death`);
                                break;
                        }
                    }
                }
            }

            // Aura
            if (this.stage() >= PlotStage.Taller && this.berryData.aura) {
                tooltip.push('<u>Aura Emitted:</u>');
                const emittedAura = this.berryData.aura.getAuraValue(this.stage()) * this._auras[AuraType.Boost]();
                tooltip.push(`${AuraType[this.berryData.aura.auraType]}: ${emittedAura.toFixed(2)}x`);
            }
            const auraStr = this.formattedAuras();
            if (auraStr) {
                tooltip.push('<u>Aura Received:</u>');
                tooltip.push(auraStr);
            }

            // Mulch
            if (this.mulch !== MulchType.None) {
                const mulchTime = this.formattedMulchTimeLeft();
                tooltip.push('<u>Mulch</u>');
                tooltip.push(`${MulchType[this.mulch].replace('_Mulch','')} : ${mulchTime}`);
            }

            return tooltip.join('<br/>');
        });

        this.notifications = [];
    }

    /**
     * Handles updating the berry plant
     * @param seconds Number of seconds to add to the plants age
     * @returns Whether the plot stage has changed this update
     */
    update(seconds: number): boolean {
        // Updating Berry
        let change = false;

        if (this.berry !== BerryType.None) {
            const growthTime = seconds * App.game.farming.getGrowthMultiplier() * this.getGrowthMultiplier();

            const oldAge = this.age;
            this.age += growthTime;

            // Checking for Petaya Berries
            if (App.game.farming.berryInFarm(BerryType.Petaya) && this.berry !== BerryType.Petaya) {
                this.age = Math.min(this.age, this.berryData.growthTime[3] + 1);
            }

            const updatedStage = this.stageUpdated(oldAge, this.age);

            if (updatedStage !== PlotStage.Seed) {
                change = true;
            }

            if (updatedStage === PlotStage.Berry) {
                this.notifications.push(FarmNotificationType.Ripe);
                change = true;
            }

            if (!this._hasWarnedAboutToWither && this.age + 15 > this.berryData.growthTime[4]) {
                this.notifications.push(FarmNotificationType.AboutToWither);
                this._hasWarnedAboutToWither = true;
            }

            if (this.age > this.berryData.growthTime[4]) {
                this.die();
                change = true;
            }
        }

        // Updating Mulch
        if (this.mulch !== MulchType.None) {
            this.mulchTimeLeft = Math.max(this.mulchTimeLeft - seconds, 0);
            if (this.mulchTimeLeft === 0) {
                this.notifications.push(FarmNotificationType.MulchRanOut);
                this.mulch = MulchType.None;
            }
        }

        return change;
    }

    private stageUpdated(oldAge: number, newAge: number): PlotStage {
        const oldStage = this.berryData.growthTime.findIndex(t => oldAge < t);
        const newStage = this.berryData.growthTime.findIndex(t => newAge < t);
        if (oldStage !== newStage) {
            return newStage;
        }
        return PlotStage.Seed;
    }

    /**
     * Handles planting a berry on the plot
     * @param berry The BerryType
     */
    plant(berry: BerryType): void {
        this.berry = berry;
        this.age = 0;
        this.notifications = [];
        this._hasWarnedAboutToWither = false;
    }

    /**
     * Returns how many berries will be harvested
     */
    harvestAmount(): number {
        return this.berryData.harvestAmount * this.getHarvestMultiplier();
    }

    /**
     * Handles killing the berry plant
     * @param harvested Whether this death was due to the player harvesting manually, or by withering
     */
    die(harvested = false): void {
        if (!harvested) {
            // Withered Berry plant drops half of the berries
            const amount = Math.ceil(this.harvestAmount() / 2);
            if (amount) {
                App.game.farming.gainBerry(this.berry, amount);
                this.notifications.push(FarmNotificationType.Dropped);
            }

            // Check if berry replants itself
            const replantChance = this.berryData.replantRate * App.game.farming.getReplantMultiplier() * this.getReplantMultiplier();
            if (Math.random() < replantChance) {
                this.age = 0;
                this.notifications.push(FarmNotificationType.Replanted);
                App.game.oakItems.use(OakItems.OakItem.Sprinklotad);
                GameHelper.incrementObservable(App.game.statistics.totalBerriesReplanted, 1);
                return;
            }

            this.notifications.push(FarmNotificationType.Withered);

            // Check for Kasib berry mutation/replant chance
            if (App.game.farming.highestUnlockedBerry() > BerryType.Occa) {
                if (!App.game.farming.berryInFarm(BerryType.Colbur)) {
                    if (Math.random() < 0.05) {
                        this.notifications.push(FarmNotificationType.Mutated);
                        this.berry = BerryType.Kasib;
                        this.age = 0;
                        App.game.farming.unlockBerry(BerryType.Kasib);
                        return;
                    }
                }
            }
        }

        // Reset plant
        this.berry = BerryType.None;
        this.age = 0;
    }

    generateWanderPokemon(): any {
        // Check if plot is eligible for wandering Pokemon
        if (!this.isUnlocked || this.berry === BerryType.None || this.stage() !== PlotStage.Berry) {
            return undefined;
        }
        // Chance to generate wandering Pokemon
        if (Math.random() < GameConstants.WANDER_RATE * App.game.farming.externalAuras[AuraType.Attract]()) {
            // Get a random Pokemon from the list of possible encounters
            const availablePokemon = this.berryData.wander.filter(pokemon => PokemonHelper.calcNativeRegion(pokemon) <= player.highestRegion());
            const wanderPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];

            const shiny = PokemonFactory.generateShiny(GameConstants.SHINY_CHANCE_FARM);

            // Add to log book
            const pokemonStr = shiny ? `shiny ${wanderPokemon}` : wanderPokemon;
            App.game.logbook.newLog(LogBookTypes.WANDER, `A wild ${pokemonStr} has wandered onto the farm!`);

            // Gain Pokemon
            App.game.party.gainPokemonById(PokemonHelper.getPokemonByName(wanderPokemon).id, shiny, true);

            // Check for Starf berry generation
            if (shiny) {
                const emptyPlots = App.game.farming.plotList.filter(plot => plot.isUnlocked && plot.isEmpty());
                // No Starf generation if no empty plots :(
                if (emptyPlots.length) {
                    const chosenPlot = emptyPlots[Math.floor(Math.random() * emptyPlots.length)];
                    chosenPlot.plant(BerryType.Starf);
                    App.game.farming.unlockBerry(BerryType.Starf);
                }
            }

            return {pokemon: wanderPokemon, shiny: shiny};
        }
        return undefined;
    }

    /**
     * Gets the growth multiplier for this plot
     */
    getGrowthMultiplier(): number {
        let multiplier = 1;
        if (this.mulch === MulchType.Boost_Mulch) {
            multiplier = GameConstants.BOOST_MULCH_MULTIPLIER;
        } else if (this.mulch === MulchType.Amaze_Mulch) {
            multiplier =  GameConstants.AMAZE_MULCH_GROWTH_MULTIPLIER;
        }

        multiplier *= this._auras[AuraType.Growth]();

        // Handle Death Aura
        if (this.stage() == PlotStage.Berry && this.berry != BerryType.Kasib) {
            multiplier *= this._auras[AuraType.Death]();
        }

        return multiplier;
    }

    /**
     * Gets the harvest multiplier for this plot
     */
    getHarvestMultiplier(): number {
        let multiplier = 1;
        if (this.mulch === MulchType.Rich_Mulch) {
            multiplier = GameConstants.RICH_MULCH_MULTIPLIER;
        } else if (this.mulch === MulchType.Amaze_Mulch) {
            multiplier = GameConstants.AMAZE_MULCH_PRODUCE_MULTIPLIER;
        }

        multiplier *= this._auras[AuraType.Harvest]();

        return multiplier;
    }

    /**
     * Gets the replant multiplier for this plot
     */
    getReplantMultiplier(): number {
        let multiplier = 1;
        if (this.mulch === MulchType.Rich_Mulch) {
            multiplier = GameConstants.RICH_MULCH_MULTIPLIER;
        } else if (this.mulch === MulchType.Amaze_Mulch) {
            multiplier = GameConstants.AMAZE_MULCH_PRODUCE_MULTIPLIER;
        }

        multiplier *= this._auras[AuraType.Replant]();

        return multiplier;
    }

    /**
     * Gets the mutation multiplier for this plot
     */
    getMutationMultiplier(): number {
        let multiplier = 1;
        if (this.mulch === MulchType.Surprise_Mulch) {
            multiplier = GameConstants.SURPRISE_MULCH_MULTIPLIER;
        } else if (this.mulch === MulchType.Amaze_Mulch) {
            multiplier = GameConstants.AMAZE_MULCH_MUTATE_MULTIPLIER;
        }

        multiplier *= this._auras[AuraType.Mutation]();

        return multiplier;
    }

    /**
     * Handles adding a multiplicative aura to the Plot
     * @param auraType The AuraType
     * @param multiplier The multiplier to modify the current aura by
     */
    addAura(auraType: AuraType, multiplier: number): void {
        const currentMultiplier = this._auras[auraType]();
        this._auras[auraType](currentMultiplier * multiplier);
    }

    /**
     * Handles setting the value of an aura to the Plot
     * @param auraType The AuraType
     * @param value The value to be set
     */
    setAura(auraType: AuraType, value: number): void {
        // Death Aura doesn't apply to Kasib
        if (auraType == AuraType.Death && this.berry === BerryType.Kasib) {
            return;
        }
        // Boost Aura doesn't apply to Lum
        if (auraType == AuraType.Boost && this.berry === BerryType.Lum) {
            return;
        }
        this._auras[auraType](value);
    }

    clearAuras(): void {
        this._auras.forEach(aura => aura(1));
    }

    emitAura(index: number): void {
        if (this.berry === BerryType.None) {
            return;
        }
        this.berryData.aura?.emitAura(index);
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        this.isUnlocked = json['isUnlocked'] ?? this.defaults.isUnlocked;
        this.berry = json['berry'] ?? this.defaults.berry;
        this.age = json['age'] ?? this.defaults.age;
        this.mulch = json['mulch'] ?? this.defaults.mulch;
        this.mulchTimeLeft = json['mulchTimeLeft'] ?? this.defaults.mulchTimeLeft;
    }

    toJSON(): Record<string, any> {
        return {
            isUnlocked: this.isUnlocked,
            berry: this.berry,
            age: this.age,
            mulch: this.mulch,
            mulchTimeLeft: this.mulchTimeLeft,
        };
    }

    /**
     * Finds the plot indices that are around the plot in a 3x3 square
     * @param index The plot index
     */
    public static findNearPlots(index: number): number[] {
        const plots = [];

        const posX = index % Farming.PLOT_WIDTH;
        const posY = (index - posX) / Farming.PLOT_HEIGHT;

        for (let y = posY - 1; y <= posY + 1; y++) {
            for (let x = posX - 1; x <= posX + 1; x++) {
                if (y < 0 || y > Farming.PLOT_HEIGHT - 1 || x < 0 || x >  Farming.PLOT_WIDTH - 1) {
                    continue;
                }
                if (y === posY && x === posX) {
                    continue;
                }
                const id = y * Farming.PLOT_HEIGHT + x;
                plots.push(id);
            }
        }

        return plots;
    }

    /**
     * Finds the plot indices that are directly next to the plot (aka a plus sign)
     * @param index The plot index
     */
    public static findPlusPlots(index: number, filter?: (n: number) => boolean): number[] {
        const posX = index % Farming.PLOT_WIDTH;
        const posY = (index - posX) / Farming.PLOT_HEIGHT;

        const possiblePlots = [[posY - 1, posX], [posY, posX - 1], [posY, posX + 1], [posY + 1, posX]];

        return possiblePlots.filter(([y, x]) => {
            return y >= 0 && y < Farming.PLOT_HEIGHT && x >= 0 && x < Farming.PLOT_WIDTH;
        }).map(([y, x]) => y * Farming.PLOT_HEIGHT + x);
    }

    get berryData(): Berry {
        return App.game.farming.berries[this.berry];
    }

    // Knockout getters
    get isUnlocked(): boolean {
        return this._isUnlocked();
    }

    set isUnlocked(value: boolean) {
        this._isUnlocked(value);
    }

    get berry(): BerryType {
        return this._berry();
    }

    set berry(berry: BerryType) {
        this._berry(berry);
    }

    get age(): number {
        return this._age();
    }

    set age(value: number) {
        this._age(value);
    }

    get mulch(): MulchType {
        return this._mulch();
    }

    set mulch(value: MulchType) {
        this._mulch(value);
    }

    get mulchTimeLeft(): number {
        return this._mulchTimeLeft();
    }

    set mulchTimeLeft(value: number) {
        this._mulchTimeLeft(value);
    }

    get auras(): number[] {
        return this._auras.map(aura => aura());
    }

}
