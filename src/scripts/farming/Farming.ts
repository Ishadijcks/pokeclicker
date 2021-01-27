/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Feature.d.ts" />

class Farming implements Feature {
    name = 'Farming';
    saveKey = 'farming';

    berries: Berry[] = [];
    mutations: Mutation[] = [];

    externalAuras: KnockoutObservable<number>[];

    mutationCounter = 0;
    wanderCounter = 0;

    // You may be wondering why this is necessary.
    // It turns out for some reason the plot age doesn't update in time in the same tick.
    // This means that if we attempt to reset the auras in the same tick, the plant that changed stages
    // will still act like it's in the previous stage, which means the wrong aura is applied.
    // Queueing an aura reset in later ticks fixes this issue, and is barely noticable to the player.
    queuedAuraReset = -1;

    static readonly PLOT_WIDTH = 5;
    static readonly PLOT_HEIGHT = 5;

    defaults = {
        plotList: new Array(Farming.PLOT_WIDTH * Farming.PLOT_HEIGHT).fill(null).map((value, index) => {
            const middle = Math.floor(Farming.PLOT_HEIGHT / 2) * Farming.PLOT_WIDTH + Math.floor(Farming.PLOT_WIDTH / 2);
            return new Plot(index === middle, BerryType.None, 0, MulchType.None, 0);
        }),
    };

    plotList: Array<Plot>;

    highestUnlockedBerry: KnockoutComputed<number>;

    constructor(private multiplier: Multiplier) {
        this.plotList = this.defaults.plotList;

        this.externalAuras = [];
        this.externalAuras[AuraType.Attract] = ko.observable<number>(1);
        this.externalAuras[AuraType.Egg] = ko.observable<number>(1);
        this.externalAuras[AuraType.Shiny] = ko.observable<number>(1);

        this.multiplier.addBonus('shiny', () => this.externalAuras[AuraType.Shiny]());
        this.multiplier.addBonus('eggStep', () => this.externalAuras[AuraType.Egg]());

        this.highestUnlockedBerry = ko.pureComputed(() => {
            for (let i = GameHelper.enumLength(BerryType) - 2; i >= 0; i--) {
                if (this.berries[i].unlocked()) {
                    return i;
                }
            }
            return 0;
        });
    }

    initialize(): void {

        // Storing Berries for easy access
        this.berries = [];
        Object.values(ItemList).filter(Berry.isBerry).forEach(berry => {
            this.berries[berry.type] = berry;
        });

        //#region Mutations

        /**
         * NOTE: ONLY ADD NEW MUTATIONS AT THE END OF THE LIST. MUTATION INDEX IS USED TO STORE HINT SEEN DATA
         */

        //#region Second Generation

        // Persim
        this.mutations.push(new GrowNearBerryMutation(.02, BerryType.Persim,
            [
                BerryType.Pecha,
                BerryType.Oran,
            ]));
        // Razz
        this.mutations.push(new GrowNearBerryMutation(.019, BerryType.Razz,
            [
                BerryType.Cheri,
                BerryType.Leppa,
            ]));
        // Bluk
        this.mutations.push(new GrowNearBerryMutation(.018, BerryType.Bluk,
            [
                BerryType.Chesto,
                BerryType.Leppa,
            ]));
        // Nanab
        this.mutations.push(new GrowNearBerryMutation(.017, BerryType.Nanab,
            [
                BerryType.Pecha,
                BerryType.Aspear,
            ]));
        // Wepear
        this.mutations.push(new GrowNearBerryMutation(.016, BerryType.Wepear,
            [
                BerryType.Rawst,
                BerryType.Oran,
            ]));
        // Pinap
        this.mutations.push(new GrowNearBerryMutation(.015, BerryType.Pinap,
            [
                BerryType.Sitrus,
                BerryType.Aspear,
            ]));

        // Figy
        this.mutations.push(new GrowNearFlavorMutation(.009, BerryType.Figy,
            [[25, 80], [0, 5], [0, 5], [0, 5], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too spicy!',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Cheri].unlocked();
                },
            }
        ));
        // Wiki
        this.mutations.push(new GrowNearFlavorMutation(.008, BerryType.Wiki,
            [[0, 5], [25, 80], [0, 5], [0, 5], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too dry!',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Chesto].unlocked();
                },
            }
        ));
        // Mago
        this.mutations.push(new GrowNearFlavorMutation(.007, BerryType.Mago,
            [[0, 5], [0, 5], [25, 80], [0, 5], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too sweet!',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Pecha].unlocked();
                },
            }
        ));
        // Aguav
        this.mutations.push(new GrowNearFlavorMutation(.006, BerryType.Aguav,
            [[0, 5], [0, 5], [0, 5], [25, 80], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too bitter!',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Rawst].unlocked();
                },
            }
        ));
        // Iapapa
        this.mutations.push(new GrowNearFlavorMutation(.005, BerryType.Iapapa,
            [[0, 5], [0, 5], [0, 5], [0, 5], [25, 80]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too sour!',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Aspear].unlocked();
                },
            }
        ));

        // Lum
        this.mutations.push(new GrowNearBerryMutation(.001, BerryType.Lum,
            [
                BerryType.Cheri,
                BerryType.Chesto,
                BerryType.Pecha,
                BerryType.Rawst,
                BerryType.Aspear,
                BerryType.Leppa,
                BerryType.Oran,
                BerryType.Sitrus,
            ], {
                hint: 'I\'ve heard that there\'s a legendary Berry that only appears when fully surrounded by unique ripe Berry plants!',
            }));

        //#endregion

        //#region Third Generation

        // Pomeg
        this.mutations.push(new GrowNearBerryMutation(.0005, BerryType.Pomeg,
            [
                BerryType.Iapapa,
                BerryType.Mago,
            ]));
        // Kelpsy
        this.mutations.push(new GrowNearBerryMutation(.0005, BerryType.Kelpsy,
            [
                BerryType.Chesto,
                BerryType.Persim,
            ]));
        // Qualot
        this.mutations.push(new GrowNearFlavorMutation(.0005, BerryType.Qualot,
            [[10, 15], [0, 0], [10, 15], [0, 0], [10, 15]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted a little spicy, a little sweet, and a little sour at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Cheri].unlocked() &&
                    App.game.farming.berries[BerryType.Pecha].unlocked() &&
                    App.game.farming.berries[BerryType.Aspear].unlocked();
                },
            }));
        // Hondew
        this.mutations.push(new GrowNearFlavorMutation(.0004, BerryType.Hondew,
            [[15, 15], [15, 15], [0, 0], [15, 15], [0, 0]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted fairly spicy, dry, and bitter at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Figy].unlocked() &&
                    App.game.farming.berries[BerryType.Wiki].unlocked() &&
                    App.game.farming.berries[BerryType.Aguav].unlocked();
                },
            }));
        // Grepa
        this.mutations.push(new GrowNearBerryMutation(.0005, BerryType.Grepa,
            [
                BerryType.Aguav,
                BerryType.Figy,
            ]));
        // Tamato
        this.mutations.push(new EvolveNearBerryMutation(.0005, BerryType.Tamato, BerryType.Razz, [BerryType.Pomeg]));
        // Cornn
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Cornn,
            [
                BerryType.Leppa,
                BerryType.Bluk,
                BerryType.Wiki,
            ]));
        // Magost
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Magost,
            [
                BerryType.Pecha,
                BerryType.Nanab,
                BerryType.Mago,
            ]));
        // Rabuta
        this.mutations.push(new EvolveNearBerryMutation(.0003, BerryType.Rabuta, BerryType.Aspear, [BerryType.Aguav]));
        // Nomel
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Nomel,
            [BerryType.Pinap]));
        // Spelon
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Spelon, BerryType.Tamato,
            [[130, 160], [0, 80], [0, 80], [0, 80], [0, 80]], {
                hint: 'I\'ve heard that a Tamato berry will change if its surroundings get extremely spicy!',
            }));
        // Pamtre
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Pamtre, BerryType.Cornn,
            [[0, 80], [130, 160], [0, 80], [0, 80], [0, 80]], {
                hint: 'I\'ve heard that a Cornn berry will change if its surroundings get extremely dry!',
            }));
        // Pamtre Overgrow
        this.mutations.push(new GrowNearBerryMutation(.0004, BerryType.Pamtre,
            [BerryType.Pamtre], { showHint: false }));
        // Watmel
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Watmel, BerryType.Magost,
            [[0, 80], [0, 80], [130, 160], [0, 80], [0, 80]], {
                hint: 'I\'ve heard that a Magost berry will change if its surroundings get extremely sweet!',
            }));
        // Durin
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Durin, BerryType.Rabuta,
            [[0, 80], [0, 80], [0, 80], [130, 160], [0, 80]], {
                hint: 'I\'ve heard that a Rabuta berry will change if its surroundings get extremely bitter!',
            }));
        // Belue
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Belue, BerryType.Nomel,
            [[0, 80], [0, 80], [0, 80], [0, 80], [130, 160]], {
                hint: 'I\'ve heard that a Nomel berry will change if its surroundings get extremely sour!',
            }));

        //#endregion

        //#region Fourth Generation

        // Occa
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Occa,
            [
                BerryType.Razz,
                BerryType.Figy,
                BerryType.Tamato,
                BerryType.Spelon,
            ]));
        // Occa Parasite
        this.mutations.push(new ParasiteMutation(.0004, BerryType.Occa));
        // Passho
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Passho,
            [
                BerryType.Oran,
                BerryType.Chesto,
                BerryType.Kelpsy,
                BerryType.Coba,
            ]));
        // Wacan
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Wacan,
            [
                BerryType.Pinap,
                BerryType.Iapapa,
                BerryType.Qualot,
                BerryType.Grepa,
            ]));
        // Rindo
        // TODO: HLXII - Change mutation to grow spontaneously when Grass pokemon in party
        this.mutations.push(new GrowNearFlavorMutation(.0001, BerryType.Rindo,
            [[10, 15], [0, 0], [0, 0], [15, 20], [0, 0]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted a little spicy and fairly bitter at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Aguav].unlocked() &&
                    App.game.farming.berries[BerryType.Cheri].unlocked();
                },
            }));
        // Rindo Overgrow
        this.mutations.push(new GrowNearBerryMutation(.0004, BerryType.Rindo, [BerryType.Rindo], {showHint: false }));
        // Yache
        this.mutations.push(new EvolveNearBerryStrictMutation(.0001, BerryType.Yache, BerryType.Passho, {}, PlotStage.Seed, {
            hint: 'I\'ve heard that growing a Passho Berry alone will cause it to change!',
        }));
        // Chople
        this.mutations.push(new OakMutation(.0001, BerryType.Chople, BerryType.Spelon, OakItems.OakItem.Blaze_Cassette));
        // Kebia
        this.mutations.push(new OakMutation(.0001, BerryType.Kebia, BerryType.Pamtre, OakItems.OakItem.Poison_Barb));
        // Kebia Parasite
        this.mutations.push(new ParasiteMutation(.0004, BerryType.Kebia));
        // Shuca
        this.mutations.push(new OakMutation(.0001, BerryType.Shuca, BerryType.Watmel, OakItems.OakItem.Sprinklotad));
        // Coba
        // TODO: HLXII - Change mutation to grow spontaneously when Flying pokemon in party
        this.mutations.push(new GrowNearFlavorMutation(.0001, BerryType.Coba,
            [[0, 0], [10, 15], [0, 0], [15, 20], [0, 0]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted a little dry and fairly bitter at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.berries[BerryType.Chesto].unlocked() &&
                    App.game.farming.berries[BerryType.Aguav].unlocked();
                },
            }));
        // Payapa
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Payapa,
            [
                BerryType.Wiki,
                BerryType.Bluk,
                BerryType.Cornn,
                BerryType.Pamtre,
            ]));
        // Tanga
        let berryReqs = {};
        berryReqs[BerryType.Rindo] = 8;
        this.mutations.push(new GrowNearBerryStrictMutation(.0001, BerryType.Tanga, berryReqs, {
            hint: 'I\'ve heard that a special Berry can appear after being surrounded by Rindo Berries!',
        }));
        // Charti
        this.mutations.push(new OakMutation(.0001, BerryType.Charti, BerryType.Cornn, OakItems.OakItem.Cell_Battery));
        // Kasib
        // No mutation, will check withers
        // Haban
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Haban,
            [
                BerryType.Occa,
                BerryType.Rindo,
                BerryType.Passho,
                BerryType.Wacan,
            ]));
        // Colbur
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Colbur,
            [
                BerryType.Rabuta,
                BerryType.Kasib,
                BerryType.Payapa,
            ]));
        // Colbur Parasite
        this.mutations.push(new ParasiteMutation(.0004, BerryType.Colbur));
        // Babiri
        berryReqs = {};
        berryReqs[BerryType.Shuca] = 4;
        berryReqs[BerryType.Charti] = 4;
        this.mutations.push(new GrowNearBerryStrictMutation(.0001, BerryType.Babiri, berryReqs, {
            hint: 'I\'ve heard that a special Berry can appear after being surrounded by Shuca and Charti Berries!',
        }));
        // Chilan
        berryReqs = {};
        berryReqs[BerryType.Chople] = 3;
        this.mutations.push(new EvolveNearBerryMinMutation(.0001, BerryType.Chilan, BerryType.Chople, berryReqs, {
            hint: 'I\'ve heard that Chople Berries will turn into a different Berry if surrounded by more than two of its own kind',
        }));
        // Roseli
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Roseli,
            [
                BerryType.Mago,
                BerryType.Nanab,
                BerryType.Magost,
                BerryType.Watmel,
            ]));
        //#endregion

        //#region Fifth Generation

        // Micle
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Micle, [0, 600, 0, 0, 0], {
            hint: 'I\'ve heard of a Berry that only appears in the driest of fields.',
            unlockReq: () => App.game.farming.berries[BerryType.Pamtre].unlocked(),
        }));
        // Custap
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Custap, [0, 0, 600, 0, 0], {
            hint: 'I\'ve heard of a Berry that only appears in the sweetest of fields.',
            unlockReq: () => App.game.farming.berries[BerryType.Watmel].unlocked(),
        }));
        // Jaboca
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Jaboca, [0, 0, 0, 600, 0], {
            hint: 'I\'ve heard of a Berry that only appears in the most bitter of fields.',
            unlockReq: () => App.game.farming.berries[BerryType.Durin].unlocked(),
        }));
        // Rowap
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Rowap, [0, 0, 0, 0, 600], {
            hint: 'I\'ve heard of a Berry that only appears in the most sour of fields.',
            unlockReq: () => App.game.farming.berries[BerryType.Belue].unlocked(),
        }));
        // Kee
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Kee,
            [
                BerryType.Liechi,
                BerryType.Ganlon,
            ]));
        // Maranga
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Maranga,
            [
                BerryType.Salac,
                BerryType.Petaya,
            ]));

        // Liechi
        this.mutations.push(new FieldMutation(.00001, BerryType.Liechi, BerryType.Passho, undefined, {
            unlockReq: () => App.game?.statistics?.pokemonCaptured[PokemonHelper.getPokemonByName('Kyogre').id](),
        }));
        // Ganlon
        this.mutations.push(new FieldMutation(.00001, BerryType.Ganlon, BerryType.Shuca, undefined, {
            unlockReq: () => App.game?.statistics?.pokemonCaptured[PokemonHelper.getPokemonByName('Groudon').id](),
        }));
        // Salac
        this.mutations.push(new FieldMutation(.00001, BerryType.Salac, BerryType.Coba, undefined, {
            unlockReq: () => App.game?.statistics?.pokemonCaptured[PokemonHelper.getPokemonByName('Rayquaza').id](),
        }));
        // Petaya
        this.mutations.push(new PetayaMutation(.00001));
        // Apicot

        // Lansat
        // TODO: HLXII - Add Mutation to evolve Payapa when Milotic, Gardevoir, Blissey, and Togekiss in party.
        // Starf
        // No mutation, obtained by wandering shiny pokemon
        // Enigma
        this.mutations.push(new EnigmaMutation(.0001));
        // Enigma Mutations
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Liechi, BerryType.Passho, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Liechi].unlocked(),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Ganlon, BerryType.Shuca, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Ganlon].unlocked(),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Salac, BerryType.Coba, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Salac].unlocked(),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Petaya, BerryType.Payapa, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Petaya].unlocked(),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Apicot, BerryType.Chilan, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Apicot].unlocked(),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Lansat, BerryType.Roseli, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Lansat].unlocked(),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Starf, BerryType.Haban, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.berries[BerryType.Starf].unlocked(),
        }));

        // Empty Mutations for hints

        // Kasib
        this.mutations.push(new BlankMutation(0, BerryType.Kasib,
            {
                hint: 'I\'ve heard of a Berry that only appears after a Berry plant has withered, but is repelled by Colbur Plants.',
                unlockReq: () => this.highestUnlockedBerry() > BerryType.Occa,
            }));

        // Starf
        this.mutations.push(new BlankMutation(0, BerryType.Starf,
            {
                hint: 'I\'ve heard of a Berry that only appears after a Shiny Pokémon wanders near open soil.',
                unlockReq: () => this.highestUnlockedBerry() > BerryType.Occa,
            }));

        //#endregion

        //#endregion

    }

    getGrowthMultiplier(): number {
        let multiplier = 1;
        multiplier *= App.game.oakItems.calculateBonus(OakItems.OakItem.Sprayduck);
        return multiplier;
    }

    getReplantMultiplier(): number {
        let multiplier = 1;
        multiplier *= App.game.oakItems.calculateBonus(OakItems.OakItem.Sprinklotad);
        return multiplier;
    }

    getMutationMultiplier(): number {
        let multiplier = 1;
        multiplier *= App.game.oakItems.calculateBonus(OakItems.OakItem.Squirtbottle);
        return multiplier;
    }

    update(delta: number): void {
        const timeToReduce = delta;

        const notifications = new Set<FarmNotificationType>();

        let change = false;

        // Handle updating auras
        if (this.queuedAuraReset >= 0) {
            this.queuedAuraReset -= 1;
            if (this.queuedAuraReset === 0) {
                this.resetAuras();
            }
        }

        // Updating Berries
        this.plotList.forEach(plot => {
            if (plot.update(timeToReduce)) {
                change = true;
            }
            if (plot.notifications) {
                plot.notifications.forEach(n => notifications.add(n));
                plot.notifications = [];
            }
        });

        // Running Mutations
        this.mutationCounter += GameConstants.TICK_TIME;
        if (this.mutationCounter >= GameConstants.MUTATION_TICK) {
            this.mutations.forEach(mutation => {
                if (mutation.mutate()) {
                    GameHelper.incrementObservable(App.game.statistics.totalBerriesMutated, 1);
                    notifications.add(FarmNotificationType.Mutated);
                    change = true;
                }
            });
            this.mutationCounter = 0;
        }

        // Wandering Pokemon
        this.wanderCounter += GameConstants.TICK_TIME;
        let wanderPokemon: any;
        if (this.wanderCounter >= GameConstants.WANDER_TICK) {
            for (let i = 0; i < this.plotList.length; i++) {
                const plot = this.plotList[i];
                wanderPokemon = plot.generateWanderPokemon();
                if (wanderPokemon !== undefined) {
                    // TODO: HLXII Handle other bonus (DT?)
                    notifications.add(FarmNotificationType.Wander);
                    break;
                }
            }
            this.wanderCounter = 0;

        }

        // Handle queueing aura reset
        if (change) {
            this.queuedAuraReset = 2;
        }

        if (notifications.size) {
            notifications.forEach((n) => this.handleNotification(n, wanderPokemon));
        }
    }

    handleNotification(farmNotiType: FarmNotificationType, wander?: any): void {
        let message = '';
        let type = NotificationConstants.NotificationOption.success;

        switch (farmNotiType) {
            case FarmNotificationType.Ripe:
                message = 'A Berry is ready to harvest!';
                break;
            case FarmNotificationType.AboutToWither:
                message = 'A Berry plant is about to wither!';
                type = NotificationConstants.NotificationOption.warning;
                break;
            case FarmNotificationType.Withered:
                message = 'A Berry plant has withered!';
                type = NotificationConstants.NotificationOption.warning;
                break;
            case FarmNotificationType.Mutated:
                message = 'A Berry plant has mutated!';
                break;
            case FarmNotificationType.Replanted:
                message = 'A Berry has been replanted!';
                break;
            case FarmNotificationType.Dropped:
                message = 'A Berry has been dropped!';
                break;
            case FarmNotificationType.MulchRanOut:
                message = 'A plot has run out of mulch!';
                type = NotificationConstants.NotificationOption.warning;
                break;
            case FarmNotificationType.Wander:
                const pokemon = wander?.shiny ? `shiny ${wander?.pokemon}` : wander?.pokemon;
                message = `A wild ${pokemon} has wandered onto the farm!`;
                type = wander?.shiny ? NotificationConstants.NotificationOption.warning : NotificationConstants.NotificationOption.success;
                break;
        }

        Notifier.notify({
            message,
            type,
            sound: NotificationConstants.NotificationSound.ready_to_harvest,
            setting: NotificationConstants.NotificationSetting.ready_to_harvest,
        });
    }

    resetAuras() {
        this.externalAuras[AuraType.Attract](1);
        this.externalAuras[AuraType.Egg](1);
        this.externalAuras[AuraType.Shiny](1);
        this.plotList.forEach(plot => plot.clearAuras());

        // Handle Boost Auras first
        this.plotList.forEach((plot, idx) => {
            if (plot.berryData?.aura && plot.berryData?.aura.auraType === AuraType.Boost) {
                plot.emitAura(idx);
            }
        });

        // Handle rest of Auras
        this.plotList.forEach((plot, idx) => {
            if (!plot.berryData?.aura || plot.berryData?.aura.auraType !== AuraType.Boost) {
                plot.emitAura(idx);
            }
        });
    }

    //#region Plot Unlocking

    static unlockMatrix = [
        BerryType.Kelpsy, BerryType.Mago, BerryType.Persim, BerryType.Wepear, BerryType.Qualot,
        BerryType.Wiki, BerryType.Aspear, BerryType.Cheri, BerryType.Leppa, BerryType.Aguav,
        BerryType.Nanab, BerryType.Rawst, BerryType.None, BerryType.Chesto, BerryType.Razz,
        BerryType.Pomeg, BerryType.Sitrus, BerryType.Pecha, BerryType.Oran, BerryType.Pinap,
        BerryType.Grepa, BerryType.Figy, BerryType.Bluk, BerryType.Iapapa, BerryType.Hondew,
    ]

    unlockPlot(index: number) {
        if (this.allPlotsUnlocked()) {
            return;
        }
        if (this.canBuyPlot(index)) {
            const berryData = this.plotBerryCost(index);
            this.gainBerry(berryData.type, -berryData.amount);
            const cost = this.plotFPCost(index);
            App.game.wallet.loseAmount(new Amount(cost, GameConstants.Currency.farmPoint));
            this.plotList[index].isUnlocked = true;
        }
    }

    allPlotsUnlocked() {
        return this.plotList.every(plot => plot.isUnlocked);
    }

    canBuyPlot(index: number): boolean {
        const berryData = this.plotBerryCost(index);
        if (this.berries[berryData.type].amount() < berryData.amount) {
            return false;
        }
        const cost = this.plotFPCost(index);
        if (!App.game.wallet.hasAmount(new Amount(cost, GameConstants.Currency.farmPoint))) {
            return false;
        }
        return true;
    }

    plotFPCost(index: number): number {
        const berryType = Farming.unlockMatrix[index];
        return 10 * Math.floor(Math.pow(berryType + 1, 2));
    }

    plotBerryCost(index: number): {type: BerryType, amount: number} {
        const berryType = Farming.unlockMatrix[index];
        return { type: berryType, amount: 10 * (berryType + 1) };
    }

    //#endregion

    plant(index: number, berry: BerryType, suppressResetAura = false) {
        const plot = this.plotList[index];
        if (!plot.isEmpty() || !plot.isUnlocked || !this.hasBerry(berry)) {
            return;
        }

        this.gainBerry(berry, -1);
        plot.plant(berry);

        if (!suppressResetAura) {
            this.resetAuras();
        }
    }

    plantAll(berry: BerryType) {
        this.plotList.forEach((plot, index) => {
            this.plant(index, berry, true);
        });
        this.resetAuras();
    }

    /**
     * Harvest a plot at the given index
     * @param index The index of the plot to harvest
     */
    harvest(index: number, suppressResetAura = false): void {
        const plot = this.plotList[index];
        if (plot.berry === BerryType.None || plot.stage() != PlotStage.Berry) {
            return;
        }

        App.game.wallet.gainFarmPoints(this.berries[plot.berry].farmValue);

        const amount = plot.harvestAmount();

        this.gainBerry(plot.berry, amount);

        App.game.oakItems.use(OakItems.OakItem.Sprayduck, this.berries[plot.berry].exp);
        GameHelper.incrementObservable(App.game.statistics.totalManualHarvests, 1);

        App.game.shops.lowerItemMultipliers(MultiplierDecreaser.Berry, this.berries[plot.berry].exp);

        plot.die(true);

        if (!suppressResetAura) {
            this.resetAuras();
        }
    }

    /**
     * Try to harvest all plots
     */
    public harvestAll() {
        this.plotList.forEach((plot, index) => {
            this.harvest(index, true);
        });
        this.resetAuras();
    }

    /**
     * Handles using the Berry Shovel to remove a Berry plant
     * @param index The plot index
     */
    public shovel(index: number): void {
        const plot = this.plotList[index];
        if (!plot.isUnlocked) {
            return;
        }
        if (plot.isEmpty()) {
            return;
        }
        if (ItemList['Berry_Shovel'].amount() <= 0) {
            return;
        }
        plot.die(true);
        ItemList['Berry_Shovel'].gain(-1);
        GameHelper.incrementObservable(App.game.statistics.totalShovelsUsed, 1);

        this.resetAuras();
    }

    /**
     * Adds mulch to a plot
     * @param index The plot index
     * @param mulch The MulchType to be added
     * @param amount The amount of mulch to apply. Defaults to 1
     */
    public addMulch(index: number, mulch: MulchType, amount = 1) {
        const plot = this.plotList[index];
        if (!this.canMulch(index, mulch)) {
            return;
        }

        amount = Math.min(ItemList[MulchType[mulch]].amount(), amount);

        ItemList[MulchType[mulch]].gain(-amount);
        GameHelper.incrementObservable(App.game.statistics.totalMulchesUsed, amount);
        GameHelper.incrementObservable(App.game.statistics.mulchesUsed[mulch], amount);

        plot.mulch = +mulch;
        plot.mulchTimeLeft += GameConstants.MULCH_USE_TIME * amount;
    }

    /**
     * Attempts to add mulch to all plots
     * @param mulch The MulchType to be added
     * @param amount The amount of mulch to apply to each plot. Defaults to 1
     */
    public mulchAll(mulch: MulchType, amount = 1) {
        const mulchPlots = this.plotList.filter((_, index) => this.canMulch(index, mulch));
        amount *= mulchPlots.length;
        amount = Math.min(ItemList[MulchType[mulch]].amount(), amount);

        const sharedMulch = Math.floor(amount / mulchPlots.length);
        if (sharedMulch <= 0) {
            return;
        }

        this.plotList.forEach((_, index) => {
            this.addMulch(index, mulch, sharedMulch);
        });
    }

    private canMulch(index: number, mulch: MulchType) {
        const plot = this.plotList[index];
        if (!plot.isUnlocked || !this.hasMulch(mulch)) {
            return false;
        }
        if (plot.mulch != MulchType.None && plot.mulch != mulch) {
            return false;
        }
        return true;
    }

    /**
     * Gives the player a random Berry from the first 8 types
     * @param amount Amount of berries to give. Defaults to 1.
     * @param disableNotification Set to true to not notify the player. Defaults to false.
     */
    gainRandomBerry(amount = 1, disableNotification = false) {
        const berry = GameHelper.getIndexFromDistribution(GameConstants.BerryDistribution);
        if (!disableNotification) {
            Notifier.notify({
                message: `You got a ${BerryType[berry]} berry!`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.route_item_found,
            });
        }
        this.gainBerry(berry, amount);
    }

    gainBerry(berry: BerryType, amount = 1) {
        GameHelper.incrementObservable(this.berries[berry].amount, Math.floor(amount));

        if (amount > 0) {
            this.unlockBerry(berry);
            GameHelper.incrementObservable(App.game.statistics.totalBerriesHarvested, amount);
            GameHelper.incrementObservable(App.game.statistics.berriesHarvested[berry], amount);
        }
    }

    hasBerry(berry: BerryType) {
        return this.berries[berry].amount() > 0;
    }

    hasMulch(mulch: MulchType) {
        return ItemList[MulchType[mulch]].amount() > 0;
    }

    canAccess(): boolean {
        return MapHelper.accessToRoute(14, 0) && App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Wailmer_pail);
    }

    unlockBerry(berry: BerryType) {
        if (!this.berries[berry].unlocked()) {
            Notifier.notify({
                message: `You've discovered a ${BerryType[berry]} Berry!`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.route_item_found,
            });
            this.berries[berry].unlock();
        }
    }

    /**
     * Checks whether a Berry plant exists on the farm
     * @param berry The Berry type
     * @param stage The stage of the Berry plant. Defaults to PlotStage.Berry
     */
    berryInFarm(berry: BerryType, stage = PlotStage.Berry) {
        return this.plotList.some(plot => plot.berry == berry && plot.stage() >= stage);
    }

    toJSON(): Record<string, any> {
        return {
            plotList: this.plotList.map(plot => plot.toJSON()),
            mutations: this.mutations.map(mutation => mutation.toJSON()),
        };
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        const savedPlots = json['plotList'];
        if (savedPlots == null) {
            this.plotList = this.defaults.plotList;
        } else {
            (savedPlots as Record<string, any>[]).forEach((value: Record<string, any>, index: number) => {
                const plot: Plot = new Plot(false, BerryType.None, 0, MulchType.None, 0);
                plot.fromJSON(value);
                this.plotList[index] = plot;
            });
        }

        const mutations = json['mutations'];
        if (mutations == null) {
            this.mutations.forEach(mutation => mutation.fromJSON({}));
        } else {
            this.mutations.forEach((mutation, i) => mutation.fromJSON(mutations[i]));
        }
    }

    public static genBounds = [8, 20, 35, 53, Infinity];
    public static getGeneration(gen: number): BerryType[] {
        const genBounds = Farming.genBounds;
        const minBound = genBounds[gen - 1] || 0;
        const maxBound = genBounds[gen] || Infinity;
        return App.game.farming.berries.filter(berry => berry.type >= minBound && berry.type < maxBound).map(berry => berry.type);
    }

    public static getColor(color: BerryColor): BerryType[] {
        return App.game.farming.berries.filter(berry => berry.color === color).map(berry => berry.type);
    }
}
