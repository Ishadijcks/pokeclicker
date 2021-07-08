class Lab implements Feature {
    name = 'Lab';
    saveKey = 'lab';

    researchList: Research[];
    currentResearch: KnockoutObservableArray<ResearchSlot>;

    machines: Machine[];
    placedMachines: KnockoutObservableArray<PlacedMachine>;

    machineEffects: Record<string,KnockoutObservable<number>>;

    queuedResetEffects: number;
    readonly resetTickAmount = 2;

    defaults = {
        researchList: [],
        currentResearch: [],
        machines: [],
        placedMachines: [],
    }

    /**
     * The number of Research Slots available. Will depend on the Research Slot research.
     */
    public unlockedResearchSlots: KnockoutComputed<number>;

    /**
     * Determines the size of the lab. Will depend on region progression.
     */
    public labLevel: KnockoutComputed<number>;

    /**
     * The set lab dimensions based on lab level.
     */
    public static labSizes: Record<number, {x: number, y: number}> = {
        1: {x: 6, y: 7},
        2: {x: 7, y: 8},
        3: {x: 8, y: 9},
        4: {x: 9, y: 10},
    };

    constructor(private multiplier: Multiplier) {
        this.researchList = this.defaults.researchList;
        this.currentResearch = ko.observableArray(this.defaults.currentResearch);

        this.unlockedResearchSlots = ko.pureComputed(() => {
            if (this.isResearched(Lab.Research.research_slot2)) {
                return 3;
            }
            if (this.isResearched(Lab.Research.research_slot1)) {
                return 2;
            }
            return 1;
        });

        this.labLevel = ko.pureComputed(() => {
            if (MapHelper.accessToTown('Sunyshore City')) {
                return 4;
            }
            if (MapHelper.accessToTown('Mauville City')) {
                return 3;
            }
            if (MapHelper.accessToTown('New Bark Town')) {
                return 2;
            }
            return 1;
        });

        this.machines = this.defaults.machines;
        this.placedMachines = ko.observableArray(this.defaults.placedMachines);

        this.machineEffects = {};
        this.machineEffects['Machine Speed'] = ko.observable(1);
        this.machineEffects['Egg Step Gain'] = ko.observable(1);
        this.machineEffects['Egg Queue Slots'] = ko.observable(0);

        this.queuedResetEffects = 0;

        this.multiplier.addBonus('machine', () => this.machineEffects['Machine Speed']());
        this.multiplier.addBonus('eggStep', () => this.machineEffects['Egg Step Gain']());
    }

    initialize() {
        //#region Research

        /**
         * NOTE: We store the research save data in the JSON using the enum string value.
         * This will make things a bit easier down the line, as when loading saves, we can use the enum string value,
         * and thus adding new research in between existing ones can be done without additional save manipulation
         *
         * However, the index of the researchList must match the enum number value, as we index by the enum in
         * isResearched(). Adding new research in between older ones works, however the order in the enum must match.
         * We don't have to worry about the actual enum number values (aka shifting when adding new ones), since
         * We store research save data by the enum string value, which won't change.
         */

        this.researchList = [];


        //#region Research

        // Research Slots
        this.researchList[Lab.Research.research_slot1] = new Research(
            Lab.Research.research_slot1, ResearchType.Research_Slot,
            'Research Slot I', 'Unlocks a second Research Slot.',
            10000),
        this.researchList[Lab.Research.research_slot2] = new Research(
            Lab.Research.research_slot2, ResearchType.Research_Slot,
            'Research Slot II', 'Unlocks a third Research Slot.',
            30000, { requirements: [new ResearchedRequirement(Lab.Research.research_slot1)] }),

        // Research Slot Workers
        this.researchList[Lab.Research.research_workers1] = new Research(
            Lab.Research.research_workers1, ResearchType.Research_Slot,
            'Research Workers I', 'Increases max research workers to 8.',
            1000),
        this.researchList[Lab.Research.research_workers2] = new Research(
            Lab.Research.research_workers2, ResearchType.Research_Slot,
            'Research Workers II', 'Increases max research workers to 12.',
            4000, { requirements: [new ResearchedRequirement(Lab.Research.research_workers1)] }),
        this.researchList[Lab.Research.research_workers3] = new Research(
            Lab.Research.research_workers3, ResearchType.Research_Slot,
            'Research Workers III', 'Increases max research workers to 16.',
            16000, { requirements: [new ResearchedRequirement(Lab.Research.research_workers2)] }),
        this.researchList[Lab.Research.research_workers4] = new Research(
            Lab.Research.research_workers4, ResearchType.Research_Slot,
            'Research Workers IV', 'Increases max research workers to 20.',
            64000, { requirements: [new ResearchedRequirement(Lab.Research.research_workers3)] }),

        //#endregion

        //#region Machines

        //#region Fabricator

        this.researchList[Lab.Research.fabricator] = new Research(
            Lab.Research.fabricator, ResearchType.Machine,
            'Fabricator', 'Unlocks the Fabricator machine.',
            1000, {
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.fabricator].amount = 1;
                },
            }),
        this.researchList[Lab.Research.fabricator_speed1] = new Research(
            Lab.Research.fabricator_speed1, ResearchType.Machine,
            'Fabricator Speed I', 'Increases fabrication speed by 25%.',
            5000, { requirements: [new ResearchedRequirement(Lab.Research.fabricator)] }),
        this.researchList[Lab.Research.fabricator_speed2] = new Research(
            Lab.Research.fabricator_speed2, ResearchType.Machine,
            'Fabricator Speed II', 'Increases fabrication speed by 50%.',
            15000, { requirements: [new ResearchedRequirement(Lab.Research.fabricator_speed1)] }),
        this.researchList[Lab.Research.fabricator_speed3] = new Research(
            Lab.Research.fabricator_speed3, ResearchType.Machine,
            'Fabricator Speed III', 'Increases fabrication speed by 75%.',
            45000, { requirements: [new ResearchedRequirement(Lab.Research.fabricator_speed2)] }),
        this.researchList[Lab.Research.fabricator_speed4] = new Research(
            Lab.Research.fabricator_speed4, ResearchType.Machine,
            'Fabricator Speed IV', 'Increases fabrication speed by 100%.',
            135000, { requirements: [new ResearchedRequirement(Lab.Research.fabricator_speed3)] }),

        //#endregion

        //#region Plate Deconstructor

        this.researchList[Lab.Research.plate_deconstructor] = new Research(
            Lab.Research.plate_deconstructor, ResearchType.Machine,
            'Plate Deconstructor', 'Unlocks the Plate Deconstructor Machine.',
            2000,
            {
                requirements: [new QuestLineRequirement('Mining Expedition')],
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.plate_deconstructor].amount = 1;
                },
            } ),

        this.researchList[Lab.Research.plate_deconstructor_speed1] = new Research(
            Lab.Research.plate_deconstructor_speed1, ResearchType.Machine,
            'Plate Deconstructor Speed I', 'Increases plate deconstruction speed by 25%.',
            3000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor)] }),
        this.researchList[Lab.Research.plate_deconstructor_speed2] = new Research(
            Lab.Research.plate_deconstructor_speed2, ResearchType.Machine,
            'Plate Deconstructor Speed II', 'Increases plate deconstruction speed by 50%.',
            9000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor_speed1)] }),
        this.researchList[Lab.Research.plate_deconstructor_speed3] = new Research(
            Lab.Research.plate_deconstructor_speed3, ResearchType.Machine,
            'Plate Deconstructor Speed III', 'Increases plate deconstruction speed by 75%.',
            27000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor_speed2)] }),
        this.researchList[Lab.Research.plate_deconstructor_speed4] = new Research(
            Lab.Research.plate_deconstructor_speed4, ResearchType.Machine,
            'Plate Deconstructor Speed IV', 'Increases plate deconstruction speed by 100%.',
            81000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor_speed3)] }),

        this.researchList[Lab.Research.plate_deconstructor_eff1] = new Research(
            Lab.Research.plate_deconstructor_eff1, ResearchType.Machine,
            'Plate Deconstructor Efficiency I', 'Increases amount of shards gained from plate deconstruction by 25%.',
            4000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor)] }),
        this.researchList[Lab.Research.plate_deconstructor_eff2] = new Research(
            Lab.Research.plate_deconstructor_eff2, ResearchType.Machine,
            'Plate Deconstructor Efficiency II', 'Increases amount of shards gained from plate deconstruction by 50%.',
            12000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor_eff1)] }),
        this.researchList[Lab.Research.plate_deconstructor_eff3] = new Research(
            Lab.Research.plate_deconstructor_eff3, ResearchType.Machine,
            'Plate Deconstructor Efficiency III', 'Increases amount of shards gained from plate deconstruction by 75%.',
            36000, { requirements: [new ResearchedRequirement(Lab.Research.plate_deconstructor_eff2)] }),

        //#endregion

        //#region Plate Reconstructor

        this.researchList[Lab.Research.plate_reconstructor] = new Research(
            Lab.Research.plate_reconstructor, ResearchType.Machine,
            'Plate Reconstructor', 'Unlocks the Plate Reconstructor Machine.',
            2000,
            {
                requirements: [new QuestLineRequirement('Mining Expedition')],
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.plate_reconstructor].amount = 1;
                },
            }),

        this.researchList[Lab.Research.plate_reconstructor_speed1] = new Research(
            Lab.Research.plate_reconstructor_speed1, ResearchType.Machine,
            'Plate Reconstructor Speed I', 'Increases plate reconstruction speed by 25%.',
            3000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor)] }),
        this.researchList[Lab.Research.plate_reconstructor_speed2] = new Research(
            Lab.Research.plate_reconstructor_speed2, ResearchType.Machine,
            'Plate Reconstructor Speed II', 'Increases plate reconstruction speed by 50%.',
            9000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor_speed1)] }),
        this.researchList[Lab.Research.plate_reconstructor_speed3] = new Research(
            Lab.Research.plate_reconstructor_speed3, ResearchType.Machine,
            'Plate Reconstructor Speed III', 'Increases plate reconstruction speed by 75%.',
            27000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor_speed2)] }),
        this.researchList[Lab.Research.plate_reconstructor_speed4] = new Research(
            Lab.Research.plate_reconstructor_speed4, ResearchType.Machine,
            'Plate Reconstructor Speed IV', 'Increases plate reconstruction speed by 100%.',
            81000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor_speed3)] }),

        this.researchList[Lab.Research.plate_reconstructor_eff1] = new Research(
            Lab.Research.plate_reconstructor_eff1, ResearchType.Machine,
            'Plate Reconstructor Efficiency I', 'Decreases amount of shards required for plate reconstruction by 12.5%.',
            4000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor)] }),
        this.researchList[Lab.Research.plate_reconstructor_eff2] = new Research(
            Lab.Research.plate_reconstructor_eff2, ResearchType.Machine,
            'Plate Reconstructor Efficiency II', 'Decreases amount of shards required for plate reconstruction by 25%.',
            12000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor_eff1)] }),
        this.researchList[Lab.Research.plate_reconstructor_eff3] = new Research(
            Lab.Research.plate_reconstructor_eff3, ResearchType.Machine,
            'Plate Reconstructor Efficiency III', 'Decreases amount of shards required for plate reconstruction by 50%.',
            36000, { requirements: [new ResearchedRequirement(Lab.Research.plate_reconstructor_eff2)] }),

        //#endregion

        //#region Incubator

        this.researchList[Lab.Research.incubator] = new Research(
            Lab.Research.incubator, ResearchType.Machine,
            'Incubator', 'Unlocks the Incubator Machine.',
            9000,
            {
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.incubator].amount = 1;
                },
            }),

        this.researchList[Lab.Research.incubator_fuel] = new Research(
            Lab.Research.incubator_fuel, ResearchType.Machine,
            'Incubator Fuel', 'Upgrades Incubators to allow for fuel.',
            15000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_flame_plate] = new ResearchWithCost(
            Lab.Research.incubator_fuel_flame_plate, ResearchType.Machine,
            'Incubator Fuel - Flame Plate', 'Configures Incubators to use Flame Plates for fuel.',
            20000, [{item: {type: ItemType.underground, id: 'Flame Plate'}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_fire_stone] = new ResearchWithCost(
            Lab.Research.incubator_fuel_fire_stone, ResearchType.Machine,
            'Incubator Fuel - Fire Stone', 'Configures Incubators to use Fire Stones for fuel.',
            20000, [{item: {type: ItemType.item, id: 'Fire_stone'}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_chople] = new ResearchWithCost(
            Lab.Research.incubator_fuel_chople, ResearchType.Machine,
            'Incubator Fuel - Chople Berry', 'Configures Incubators to use Chople Berries for fuel.',
            20000, [{item: {type: ItemType.berry, id: BerryType.Chople}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_magmarizer] = new ResearchWithCost(
            Lab.Research.incubator_fuel_magmarizer, ResearchType.Machine,
            'Incubator Fuel - Magmarizer', 'Configures Incubators to use Magmarizer for fuel.',
            20000, [{item: {type: ItemType.item, id: 'Magmarizer'}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),

        this.researchList[Lab.Research.incubator_power1] = new Research(
            Lab.Research.incubator_power1, ResearchType.Machine,
            'Incubator Power I', 'Increases incubator effect to 1.02x.',
            10000, { requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)] }),
        this.researchList[Lab.Research.incubator_power2] = new Research(
            Lab.Research.incubator_power2, ResearchType.Machine,
            'Incubator Power II', 'Increases incubator effect to 1.03x.',
            30000, { requirements: [new ResearchedRequirement(Lab.Research.incubator_power1)] }),
        this.researchList[Lab.Research.incubator_power3] = new Research(
            Lab.Research.incubator_power3, ResearchType.Machine,
            'Incubator Power III', 'Increases incubator effect to 1.05x.',
            90000, { requirements: [new ResearchedRequirement(Lab.Research.incubator_power2)] }),

        this.researchList[Lab.Research.incubator_fuel_eff1] = new Research(
            Lab.Research.incubator_fuel_eff1, ResearchType.Machine,
            'Incubator Efficiency I', 'Increases Incubator fuel efficiency by 25%.',
            10000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_eff2] = new Research(
            Lab.Research.incubator_fuel_eff2, ResearchType.Machine,
            'Incubator Efficiency II', 'Increases Incubator fuel efficiency by 50%.',
            30000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel_eff2)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_eff3] = new Research(
            Lab.Research.incubator_fuel_eff3, ResearchType.Machine,
            'Incubator Efficiency III', 'Increases Incubator fuel efficiency by 75%.',
            90000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel_eff3)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),

        this.researchList[Lab.Research.incubator_fuel_cap1] = new Research(
            Lab.Research.incubator_fuel_cap1, ResearchType.Machine,
            'Incubator Fuel Capacity I', 'Increases Incubator fuel capacity to 5000.',
            4000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_cap2] = new Research(
            Lab.Research.incubator_fuel_cap2, ResearchType.Machine,
            'Incubator Fuel Capacity II', 'Increases Incubator fuel capacity to 10000.',
            8000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel_cap1)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_cap3] = new Research(
            Lab.Research.incubator_fuel_cap3, ResearchType.Machine,
            'Incubator Fuel Capacity III', 'Increases Incubator fuel capacity to 50000.',
            16000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel_cap2)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_cap4] = new Research(
            Lab.Research.incubator_fuel_cap4, ResearchType.Machine,
            'Incubator Fuel Capacity IV', 'Increases Incubator fuel capacity to 100000.',
            32000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel_cap3)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.incubator_fuel_cap5] = new Research(
            Lab.Research.incubator_fuel_cap5, ResearchType.Machine,
            'Incubator Fuel Capacity V', 'Increases Incubator fuel capacity to 1000000.',
            64000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.incubator_fuel_cap4)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),

        this.researchList[Lab.Research.incubator_slot1] = new Research(
            Lab.Research.incubator_slot1, ResearchType.Machine,
            'Incubator Queue Slot I', 'Increases the number of queue slots to 2.',
            10000, { requirements: [new ResearchedRequirement(Lab.Research.incubator)] }),
        this.researchList[Lab.Research.incubator_slot2] = new Research(
            Lab.Research.incubator_slot2, ResearchType.Machine,
            'Incubator Queue Slot II', 'Increases the number of queue slots to 3.',
            50000, { requirements: [new ResearchedRequirement(Lab.Research.incubator_slot1)] }),
        this.researchList[Lab.Research.incubator_slot3] = new Research(
            Lab.Research.incubator_slot3, ResearchType.Machine,
            'Incubator Queue Slot III', 'Increases the number of queue slots to 4.',
            100000, { requirements: [new ResearchedRequirement(Lab.Research.incubator_slot2)] }),
        this.researchList[Lab.Research.incubator_slot4] = new Research(
            Lab.Research.incubator_slot4, ResearchType.Machine,
            'Incubator Queue Slot IV', 'Increases the number of queue slots to 5.',
            200000, { requirements: [new ResearchedRequirement(Lab.Research.incubator_slot3)] }),

        //#endregion

        //#region Fossil Reviver

        this.researchList[Lab.Research.fossil_reviver] = new Research(
            Lab.Research.fossil_reviver, ResearchType.Machine,
            'Fossil Reviver', 'Unlocks the Fossil Reviver Machine.',
            2000,
            {
                requirements: [new QuestLineRequirement('Mining Expedition')],
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.fossil_reviver].amount = 1;
                },
            }),

        // Fossil Speed
        this.researchList[Lab.Research.fossil_reviver_speed1] = new Research(
            Lab.Research.fossil_reviver_speed1, ResearchType.Machine,
            'Fossil Reviver Speed I', 'Increases revival speed by 25%.',
            2000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_reviver_speed2] = new Research(
            Lab.Research.fossil_reviver_speed2, ResearchType.Machine,
            'Fossil Reviver Speed II', 'Increases revival speed by 50%.',
            3000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver_speed1)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_reviver_speed3] = new Research(
            Lab.Research.fossil_reviver_speed3, ResearchType.Machine,
            'Fossil Reviver Speed III', 'Increases revival speed by 75%.',
            4000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver_speed2)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),

        // Fossil Queue
        this.researchList[Lab.Research.fossil_reviver_queue] = new Research(
            Lab.Research.fossil_reviver_queue, ResearchType.Machine,
            'Fossil Reviver Queue', 'Unlocks a queue for fossil revival.',
            2000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_reviver_queue1] = new Research(
            Lab.Research.fossil_reviver_queue1, ResearchType.Machine,
            'Fossil Reviver Queue I', 'Increases revival queue slots to 8.',
            3000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver_queue)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_reviver_queue2] = new Research(
            Lab.Research.fossil_reviver_queue2, ResearchType.Machine,
            'Fossil Reviver Queue II', 'Increases revival queue slots to 16.',
            4000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver_queue1)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_reviver_queue3] = new Research(
            Lab.Research.fossil_reviver_queue3, ResearchType.Machine,
            'Fossil Reviver Queue I', 'Increases revival queue slots to 32.',
            5000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver_queue2)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_reviver_queue4] = new Research(
            Lab.Research.fossil_reviver_queue4, ResearchType.Machine,
            'Fossil Reviver Queue II', 'Increases revival queue slots to 64.',
            6000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver_queue3)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),

        // Fossil Research
        this.researchList[Lab.Research.fossil_helix] = new Research(
            Lab.Research.fossil_helix, ResearchType.Fossil,
            'Fossil Reviver - Helix', 'Unlocks the Helix fossil for revival.',
            2000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_dome] = new Research(
            Lab.Research.fossil_dome, ResearchType.Fossil,
            'Fossil Reviver - Dome', 'Unlocks the Dome fossil for revival.',
            2000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_old_amber] = new Research(
            Lab.Research.fossil_old_amber, ResearchType.Fossil,
            'Fossil Reviver - Old Amber', 'Unlocks the Old Amber for revival.',
            2000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_root] = new Research(
            Lab.Research.fossil_root, ResearchType.Fossil,
            'Fossil Reviver - Root', 'Unlocks the Root fossil for revival.',
            3000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.hoenn), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_claw] = new Research(
            Lab.Research.fossil_claw, ResearchType.Fossil,
            'Fossil Reviver - Claw', 'Unlocks the Claw fossil for revival.',
            3000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.hoenn), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_skull] = new Research(
            Lab.Research.fossil_skull, ResearchType.Fossil,
            'Fossil Reviver - Skull', 'Unlocks the Skull fossil for revival.',
            4000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.sinnoh), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_armor] = new Research(
            Lab.Research.fossil_armor, ResearchType.Fossil,
            'Fossil Reviver - Armor', 'Unlocks the Armor fossil for revival.',
            4000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.sinnoh), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_cover] = new Research(
            Lab.Research.fossil_cover, ResearchType.Fossil,
            'Fossil Reviver - Cover', 'Unlocks the Cover fossil for revival.',
            5000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.unova), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_plume] = new Research(
            Lab.Research.fossil_plume, ResearchType.Fossil,
            'Fossil Reviver - Plume', 'Unlocks the Plume fossil for revival.',
            5000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.unova), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_jaw] = new Research(
            Lab.Research.fossil_jaw, ResearchType.Fossil,
            'Fossil Reviver - Jaw', 'Unlocks the Jaw fossil for revival.',
            5000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.kalos), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.fossil_sail] = new Research(
            Lab.Research.fossil_sail, ResearchType.Fossil,
            'Fossil Reviver - Sail', 'Unlocks the Sail fossil for revival.',
            5000,
            {
                requirements: [new RegionRequirement(GameConstants.Region.kalos), new ResearchedRequirement(Lab.Research.fossil_reviver)],
                workerFilter: new TypeFilter([PokemonType.Rock, PokemonType.Ground, PokemonType.Steel]),
            }),

        //#endregion

        //#region Generator

        this.researchList[Lab.Research.generator] = new Research(
            Lab.Research.generator, ResearchType.Machine,
            'Generator', 'Unlocks the Generator Machine.',
            9000,
            {
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.generator].amount = 1;
                },
            }),

        this.researchList[Lab.Research.generator_power1] = new Research(
            Lab.Research.generator_power1, ResearchType.Machine,
            'Generator Power I', 'Increases Generator effect to 1.1x.',
            10000, { requirements: [new ResearchedRequirement(Lab.Research.generator)] }),
        this.researchList[Lab.Research.generator_power2] = new Research(
            Lab.Research.generator_power2, ResearchType.Machine,
            'Generator Power II', 'Increases Generator effect to 1.2x.',
            30000, { requirements: [new ResearchedRequirement(Lab.Research.generator_power1)] }),
        this.researchList[Lab.Research.generator_power3] = new Research(
            Lab.Research.generator_power3, ResearchType.Machine,
            'Generator Power III', 'Increases Generator effect to 1.3x.',
            90000, { requirements: [new ResearchedRequirement(Lab.Research.generator_power2)] }),

        this.researchList[Lab.Research.generator_fuel] = new Research(
            Lab.Research.generator_fuel, ResearchType.Machine,
            'Generator Fuel', 'Upgrades Generators to allow for fuel.',
            15000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_zap_plate] = new ResearchWithCost(
            Lab.Research.generator_fuel_zap_plate, ResearchType.Machine,
            'Generator Fuel - Zap Plate', 'Configures Generators to use Zap Plates for fuel.',
            20000, [{item: {type: ItemType.underground, id: 'Zap Plate'}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_thunder_stone] = new ResearchWithCost(
            Lab.Research.generator_fuel_thunder_stone, ResearchType.Machine,
            'Generator Fuel - Thunder Stone', 'Configures Generators to use Thunder Stones for fuel.',
            20000, [{item: {type: ItemType.item, id: 'Thunder_stone'}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_wacan] = new ResearchWithCost(
            Lab.Research.generator_fuel_wacan, ResearchType.Machine,
            'Generator Fuel - Wacan Berry', 'Configures Generators to use Wacan Berries for fuel.',
            20000, [{item: {type: ItemType.berry, id: BerryType.Wacan}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_electirizer] = new ResearchWithCost(
            Lab.Research.generator_fuel_electirizer, ResearchType.Machine,
            'Generator Fuel - Electirizer', 'Configures Generators to use Electirizers for fuel.',
            20000, [{item: {type: ItemType.item, id: 'Electirizer'}, amount: 10}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),

        this.researchList[Lab.Research.generator_fuel_eff1] = new Research(
            Lab.Research.generator_fuel_eff1, ResearchType.Machine,
            'Generator Efficiency I', 'Increases Generator fuel efficiency by 25%.',
            10000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_eff2] = new Research(
            Lab.Research.generator_fuel_eff2, ResearchType.Machine,
            'Generator Efficiency II', 'Increases Generator fuel efficiency by 50%.',
            30000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel_eff2)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_eff3] = new Research(
            Lab.Research.generator_fuel_eff3, ResearchType.Machine,
            'Generator Efficiency III', 'Increases Generator fuel efficiency by 75%.',
            90000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel_eff3)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),

        this.researchList[Lab.Research.generator_fuel_cap1] = new Research(
            Lab.Research.generator_fuel_cap1, ResearchType.Machine,
            'Generator Fuel Capacity I', 'Increases Generator fuel capacity to 5000.',
            4000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_cap2] = new Research(
            Lab.Research.generator_fuel_cap2, ResearchType.Machine,
            'Generator Fuel Capacity II', 'Increases Generator fuel capacity to 10000.',
            8000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel_cap1)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_cap3] = new Research(
            Lab.Research.generator_fuel_cap3, ResearchType.Machine,
            'Generator Fuel Capacity III', 'Increases Generator fuel capacity to 50000.',
            16000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel_cap2)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_cap4] = new Research(
            Lab.Research.generator_fuel_cap4, ResearchType.Machine,
            'Generator Fuel Capacity IV', 'Increases Generator fuel capacity to 100000.',
            32000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel_cap3)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.generator_fuel_cap5] = new Research(
            Lab.Research.generator_fuel_cap5, ResearchType.Machine,
            'Generator Fuel Capacity V', 'Increases Generator fuel capacity to 1000000.',
            64000,
            {
                requirements: [new ResearchedRequirement(Lab.Research.generator_fuel_cap4)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),

        //#endregion

        // Research Booster
        // TODO: HLXII - Not sure if we need a Research Booster

        //#region Pokeball Factory

        this.researchList[Lab.Research.pokeball_factory] = new Research(
            Lab.Research.pokeball_factory, ResearchType.Machine,
            'Pokéball Factory', 'Unlocks the Pokéball Factory Machine.',
            1000,
            {
                completeDelegate: () => {
                    App.game.lab.machines[Lab.Machine.pokeball_factory].amount = 1;
                },
            }),

        this.researchList[Lab.Research.pokeball_factory_speed1] = new Research(
            Lab.Research.pokeball_factory_speed1, ResearchType.Machine,
            'Pokéball Factory Speed I', 'Increases Pokéball production speed by 1.25x.',
            4000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory)] }),
        this.researchList[Lab.Research.pokeball_factory_speed2] = new Research(
            Lab.Research.pokeball_factory_speed2, ResearchType.Machine,
            'Pokéball Factory Speed II', 'Increases Pokéball production speed by 1.5x.',
            16000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory_speed1)] }),
        this.researchList[Lab.Research.pokeball_factory_speed3] = new Research(
            Lab.Research.pokeball_factory_speed3, ResearchType.Machine,
            'Pokéball Factory Speed III', 'Increases Pokéball production speed by 1.75x.',
            64000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory_speed2)] }),

        this.researchList[Lab.Research.fastball] = new Research(
            Lab.Research.fastball, ResearchType.Machine,
            'Pokéball Factory - Fastball', 'Unlocks the Fastball in the Pokéball Factory.',
            5000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory)] }),
        this.researchList[Lab.Research.quickball] = new Research(
            Lab.Research.quickball, ResearchType.Machine,
            'Pokéball Factory - Quickball', 'Unlocks the Quickball in the Pokéball Factory.',
            5000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory)] }),
        this.researchList[Lab.Research.timerball] = new Research(
            Lab.Research.timerball, ResearchType.Machine,
            'Pokéball Factory - Timerball', 'Unlocks the Timerball in the Pokéball Factory.',
            5000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory)] }),
        this.researchList[Lab.Research.duskball] = new Research(
            Lab.Research.duskball, ResearchType.Machine,
            'Pokéball Factory - Duskball', 'Unlocks the Duskball in the Pokéball Factory.',
            5000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory)] }),
        this.researchList[Lab.Research.luxuryball] = new Research(
            Lab.Research.luxuryball, ResearchType.Machine,
            'Pokéball Factory - Luxuryball', 'Unlocks the Luxuryball in the Pokéball Factory.',
            5000, { requirements: [new ResearchedRequirement(Lab.Research.pokeball_factory)] }),

        //#endregion

        // TODO: HLXII - Add Apricorn pokeball blueprints if those are implemented
        // Type Boosters
        // TODO: HLXII - Implement Type Boosters after Typed BF is implemented
        /*
        new TypeBoosterResearch(Lab.Research.type_boost_normal, PokemonType.Normal, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_fire, PokemonType.Fire, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_water, PokemonType.Water, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_electric, PokemonType.Electric, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_grass, PokemonType.Grass, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_ice, PokemonType.Ice, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_fighting, PokemonType.Fighting, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_poison, PokemonType.Poison, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_ground, PokemonType.Ground, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_flying, PokemonType.Flying, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_psychic, PokemonType.Psychic, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_bug, PokemonType.Bug, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_rock, PokemonType.Rock, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_ghost, PokemonType.Ghost, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_dragon, PokemonType.Dragon, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_dark, PokemonType.Dark, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_steel, PokemonType.Steel, 100),
        new TypeBoosterResearch(Lab.Research.type_boost_fairy, PokemonType.Fairy, 100),
        */

        // Weather Controller
        // TODO: HLXII - Implement Weather Controller with Weather Institute in Hoenn

        // Time Machine
        // TODO: HLXII - Implement Time Machine one day
        /*
        new Research(Lab.Research.time_machine, ResearchType.Machine,
            'Time Machine', 'Unlocks the Time Machine',
            100,
            {
                requirements: [new ObtainedPokemonRequirement(pokemonMap.Celebi)],
                workerFilter: new WorkerFilter((pokemon: PartyPokemon) => {
                    return pokemon.name == 'Dialga' || pokemon.name == 'Celebi';
                }, 'Only Time Pokemon can work on this Research'),
            }),
        */

        //#endregion

        //#region Fabricator Item Blueprints

        this.researchList[Lab.Research.fire_stone] = new ResearchWithCost(
            Lab.Research.fire_stone, ResearchType.Blueprint,
            'Fire Stone Blueprint', 'Unlocks the Fire Stone Fabricator Blueprint',
            7000, [{item: {type: ItemType.item, id: 'Fire_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.water_stone] = new ResearchWithCost(
            Lab.Research.water_stone, ResearchType.Blueprint,
            'Water Stone Blueprint', 'Unlocks the Water Stone Fabricator Blueprint',
            7000, [{item: {type: ItemType.item, id: 'Water_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Water]),
            }),
        this.researchList[Lab.Research.thunder_stone] = new ResearchWithCost(
            Lab.Research.thunder_stone, ResearchType.Blueprint,
            'Thunder Stone Blueprint', 'Unlocks the Thunder Stone Fabricator Blueprint',
            7000, [{item: {type: ItemType.item, id: 'Thunder_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.leaf_stone] = new ResearchWithCost(
            Lab.Research.leaf_stone, ResearchType.Blueprint,
            'Leaf Stone Blueprint', 'Unlocks the Leaf Stone Fabricator Blueprint',
            7000, [{item: {type: ItemType.item, id: 'Leaf_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Grass]),
            }),
        this.researchList[Lab.Research.moon_stone] = new ResearchWithCost(
            Lab.Research.moon_stone, ResearchType.Blueprint,
            'Moon Stone Blueprint', 'Unlocks the Moon Stone Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Moon_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Fairy]),
            }),
        this.researchList[Lab.Research.sun_stone] = new ResearchWithCost(
            Lab.Research.sun_stone, ResearchType.Blueprint,
            'Sun Stone Blueprint', 'Unlocks the Sun Stone Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Sun_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.dragon_scale] = new ResearchWithCost(
            Lab.Research.dragon_scale, ResearchType.Blueprint,
            'Dragon Scale Blueprint', 'Unlocks the Dragon Scale Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Dragon_scale'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Dragon]),
            }),
        this.researchList[Lab.Research.metal_coat] = new ResearchWithCost(
            Lab.Research.metal_coat, ResearchType.Blueprint,
            'Metal Coat Blueprint', 'Unlocks the Metal Coat Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Metal_coat'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Steel]),
            }),
        this.researchList[Lab.Research.upgrade] = new ResearchWithCost(
            Lab.Research.upgrade, ResearchType.Blueprint,
            'Upgrade Blueprint', 'Unlocks the Upgrade Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Upgrade'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
            }),
        this.researchList[Lab.Research.dubious_disc] = new ResearchWithCost(
            Lab.Research.dubious_disc, ResearchType.Blueprint,
            'Dubious Disc Blueprint', 'Unlocks the Dubious Disc Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Dubious_disc'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
            }),
        this.researchList[Lab.Research.electirizer] = new ResearchWithCost(
            Lab.Research.electirizer, ResearchType.Blueprint,
            'Electirizer Blueprint', 'Unlocks the Electirizer Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Electirizer'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
            }),
        this.researchList[Lab.Research.magmarizer] = new ResearchWithCost(
            Lab.Research.magmarizer, ResearchType.Blueprint,
            'Magmarizer Blueprint', 'Unlocks the Magmarizer Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Magmarizer'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
            }),
        this.researchList[Lab.Research.protector] = new ResearchWithCost(
            Lab.Research.protector, ResearchType.Blueprint,
            'Protector Blueprint', 'Unlocks the Protector Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Protector'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
            }),
        this.researchList[Lab.Research.reaper_cloth] = new ResearchWithCost(
            Lab.Research.reaper_cloth, ResearchType.Blueprint,
            'Reaper Cloth Blueprint', 'Unlocks the Reaper Cloth Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Reaper_cloth'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Ghost]),
            }),
        this.researchList[Lab.Research.ice_stone] = new ResearchWithCost(
            Lab.Research.ice_stone, ResearchType.Blueprint,
            'Ice Stone Blueprint', 'Unlocks the Ice Stone Fabricator Blueprint.',
            7000,  [{item: {type: ItemType.item, id: 'Ice_stone'}, amount: 5}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.fabricator)],
                workerFilter: new TypeFilter([PokemonType.Ice]),
            }),

        //#endregion

        //#region Genesect
        this.researchList[Lab.Research.drive_burner] = new ResearchWithCost(
            Lab.Research.drive_burner, ResearchType.Misc,
            'Drive Burner', 'Investigate construction process for Drives.',
            10000,
            [
                {item: {type: ItemType.item, id: 'Upgrade'}, amount: 100},
                {item: {type: ItemType.item, id: 'Dubious_disc'}, amount: 100},
            ],
            { requirements: [new ObtainedPokemonRequirement(pokemonMap.Genesect)] }),
        this.researchList[Lab.Research.shock_drive] = new ResearchWithCost(
            Lab.Research.shock_drive, ResearchType.Misc,
            'Shock Drive', 'Investigate Shock Drive construction.',
            20000,
            [
                {item: {type: ItemType.item, id: 'Upgrade'}, amount: 100},
                {item: {type: ItemType.item, id: 'Thunder_stone'}, amount: 100},
                {item: {type: ItemType.underground, id: 'Smooth Rock'}, amount: 100},
                {item: {type: ItemType.berry, id: BerryType.Wacan}, amount: 5000},
            ],
            {
                requirements: [new ResearchedRequirement(Lab.Research.drive_burner)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Genesect (shock)').id);
                },
            }),
        this.researchList[Lab.Research.burn_drive] = new ResearchWithCost(
            Lab.Research.burn_drive, ResearchType.Misc,
            'Burn Drive', 'Investigate Burn Drive construction.',
            20000,
            [
                {item: {type: ItemType.item, id: 'Upgrade'}, amount: 100},
                {item: {type: ItemType.item, id: 'Fire_stone'}, amount: 100},
                {item: {type: ItemType.underground, id: 'Heat Rock'}, amount: 100},
                {item: {type: ItemType.berry, id: BerryType.Occa}, amount: 5000},
            ],
            {
                requirements: [new ResearchedRequirement(Lab.Research.drive_burner)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Genesect (burn)').id);
                },
            }),
        this.researchList[Lab.Research.chill_drive] = new ResearchWithCost(
            Lab.Research.chill_drive, ResearchType.Misc,
            'Chill Drive', 'Investigate Chill Drive construction.',
            20000,
            [
                {item: {type: ItemType.item, id: 'Upgrade'}, amount: 100},
                {item: {type: ItemType.item, id: 'Ice_stone'}, amount: 100},
                {item: {type: ItemType.underground, id: 'Icy Rock'}, amount: 100},
                {item: {type: ItemType.berry, id: BerryType.Yache}, amount: 5000},
            ],
            {
                requirements: [new ResearchedRequirement(Lab.Research.drive_burner)],
                workerFilter: new TypeFilter([PokemonType.Ice]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Genesect (chill)').id);
                },
            }),
        this.researchList[Lab.Research.douse_drive] = new ResearchWithCost(
            Lab.Research.douse_drive, ResearchType.Misc,
            'Douse Drive', 'Investigate Douse Drive construction.',
            20000,
            [
                {item: {type: ItemType.item, id: 'Upgrade'}, amount: 100},
                {item: {type: ItemType.item, id: 'Water_stone'}, amount: 100},
                {item: {type: ItemType.underground, id: 'Damp Rock'}, amount: 100},
                {item: {type: ItemType.berry, id: BerryType.Passho}, amount: 5000},
            ],
            {
                requirements: [new ResearchedRequirement(Lab.Research.drive_burner)],
                workerFilter: new TypeFilter([PokemonType.Water]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Genesect (douse)').id);
                },
            }),
        //#endregion

        //#region Arceus
        this.researchList[Lab.Research.legendary_plate] = new Research(
            Lab.Research.legendary_plate, ResearchType.Plate,
            'Legendary Plates', 'Investigate construction process for Legendary Plates.',
            10000, { requirements: [new ObtainedPokemonRequirement(pokemonMap['Arceus (normal)'])] }),

        this.researchList[Lab.Research.legendary_draco_plate] = new ResearchWithCost(
            Lab.Research.legendary_draco_plate, ResearchType.Plate,
            'Legendary Draco Plate', 'Investigate Legendary Draco Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Draco Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Dragon]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (dragon)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_dread_plate] = new ResearchWithCost(
            Lab.Research.legendary_dread_plate, ResearchType.Plate,
            'Legendary Dread Plate', 'Investigate Legendary Dread Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Dread Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Dark]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (dark)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_earth_plate] = new ResearchWithCost(
            Lab.Research.legendary_earth_plate, ResearchType.Plate,
            'Legendary Earth Plate', 'Investigate Legendary Earth Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Earth Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Ground]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (ground)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_fist_plate] = new ResearchWithCost(
            Lab.Research.legendary_fist_plate, ResearchType.Plate,
            'Legendary Fist Plate', 'Investigate Legendary Fist Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Fist Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Fighting]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (fighting)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_flame_plate] = new ResearchWithCost(
            Lab.Research.legendary_flame_plate, ResearchType.Plate,
            'Legendary Flame Plate', 'Investigate Legendary Flame Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Flame Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Fire]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (fire)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_icicle_plate] = new ResearchWithCost(
            Lab.Research.legendary_icicle_plate, ResearchType.Plate,
            'Legendary Icicle Plate', 'Investigate Legendary Icicle Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Icicle Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Ice]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (ice)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_insect_plate] = new ResearchWithCost(
            Lab.Research.legendary_insect_plate, ResearchType.Plate,
            'Legendary Insect Plate', 'Investigate Legendary Insect Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Insect Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Bug]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (bug)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_iron_plate] = new ResearchWithCost(
            Lab.Research.legendary_iron_plate, ResearchType.Plate,
            'Legendary Iron Plate', 'Investigate Legendary Iron Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Iron Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Steel]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (steel)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_meadow_plate] = new ResearchWithCost(
            Lab.Research.legendary_meadow_plate, ResearchType.Plate,
            'Legendary Meadow Plate', 'Investigate Legendary Meadow Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Meadow Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Grass]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (grass)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_mind_plate] = new ResearchWithCost(
            Lab.Research.legendary_mind_plate, ResearchType.Plate,
            'Legendary Mind Plate', 'Investigate Legendary Mind Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Mind Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Psychic]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (psychic)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_sky_plate] = new ResearchWithCost(
            Lab.Research.legendary_sky_plate, ResearchType.Plate,
            'Legendary Sky Plate', 'Investigate Legendary Sky Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Sky Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Flying]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (flying)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_splash_plate] = new ResearchWithCost(
            Lab.Research.legendary_splash_plate, ResearchType.Plate,
            'Legendary Splash Plate', 'Investigate Legendary Splash Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Splash Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Water]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (water)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_spooky_plate] = new ResearchWithCost(
            Lab.Research.legendary_spooky_plate, ResearchType.Plate,
            'Legendary Spooky Plate', 'Investigate Legendary Spooky Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Spooky Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Ghost]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (ghost)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_stone_plate] = new ResearchWithCost(
            Lab.Research.legendary_stone_plate, ResearchType.Plate,
            'Legendary Stone Plate', 'Investigate Legendary Stone Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Stone Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Rock]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (rock)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_toxic_plate] = new ResearchWithCost(
            Lab.Research.legendary_toxic_plate, ResearchType.Plate,
            'Legendary Toxic Plate', 'Investigate Legendary Toxic Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Toxic Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Poison]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (poison)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_zap_plate] = new ResearchWithCost(
            Lab.Research.legendary_zap_plate, ResearchType.Plate,
            'Legendary Zap Plate', 'Investigate Legendary Zap Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Zap Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Electric]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (electric)').id);
                },
            }),
        this.researchList[Lab.Research.legendary_pixie_plate] = new ResearchWithCost(
            Lab.Research.legendary_pixie_plate, ResearchType.Plate,
            'Legendary Pixie Plate', 'Investigate Legendary Pixie Plate construction.',
            20000,
            [{item: {type: ItemType.underground, id: 'Pixie Plate'}, amount: 777}],
            {
                requirements: [new ResearchedRequirement(Lab.Research.legendary_plate)],
                workerFilter: new TypeFilter([PokemonType.Fairy]),
                completeDelegate: () => {
                    App.game.party.gainPokemonById(PokemonHelper.getPokemonByName('Arceus (fairy)').id);
                },
            }),
        //#endregion

        //#endregion

        //#region Machines

        this.machines = [];
        this.machines[Lab.Machine.fabricator]           = new Fabricator(Lab.Machine.fabricator, 'Fabricator', 'Creates new machines and items.', 2, 3),
        this.machines[Lab.Machine.plate_deconstructor]  = new PlateDeconstructor(Lab.Machine.plate_deconstructor, 'Plate Deconstructor', 'Deconstruct plates into shards.', 1, 2),
        this.machines[Lab.Machine.plate_reconstructor]  = new PlateReconstructor(Lab.Machine.plate_reconstructor, 'Plate Reconstructor', 'Reconstruct plates from shards.', 1, 2),
        this.machines[Lab.Machine.incubator]            = new Incubator(Lab.Machine.incubator, 'Incubator', 'Increases the total Hatchery queue slots when placed.', 2, 3),
        this.machines[Lab.Machine.fossil_reviver]       = new FossilReviver(Lab.Machine.fossil_reviver, 'Fossil Reviver', 'Revives Fossil Pokémon', 5, 2),
        this.machines[Lab.Machine.generator]            = new Generator(Lab.Machine.generator, 'Generator', 'Increases Machine speed when placed.', 4, 6),
        this.machines[Lab.Machine.pokeball_factory]     = new PokeballFactory(Lab.Machine.pokeball_factory, 'Pokéball Factory', 'Creates Pokéballs.', 2, 4);

        Fabricator.initialize();
        Incubator.initialize();
        Generator.initialize();
        PokeballFactory.initialize();

        //#endregion
    }

    update(delta: number) {
        // Don't run until unlocked
        if (!this.canAccess()) {
            return;
        }

        // Update Research Slots
        this.currentResearch().forEach(res => {
            const complete = res.update(delta);
            if (complete) {
                // TODO: HLXII - Update notification properties
                Notifier.notify({
                    message: 'Some Research has been completed!',
                    type: NotificationConstants.NotificationOption.success,
                    sound: NotificationConstants.NotificationSound.achievement,
                });
            }
        });

        // Handling queued multiplier reset
        if (this.queuedResetEffects > 0) {
            this.queuedResetEffects -= 1;
            if (!this.queuedResetEffects) {
                this.resetEffects();
            }
        }

        // Update Machines
        this.placedMachines().forEach(placedMachine => {
            const updateInfo = placedMachine.state.update(delta, this.multiplier);
            if (updateInfo.resetEffects) {
                this.queuedResetEffects = this.resetTickAmount;
            }
        });

        // Handle unlocked Research
        let notify = false;
        this.researchList.forEach(research => {
            if (research.canResearch() && !research.notified) {
                research.notified = true;
                notify = true;
            }
        });
        if (notify) {
            // TODO: HLXII - Update notification properties
            Notifier.notify({
                message: 'New Research is available!',
                type: NotificationConstants.NotificationOption.success,
                sound: NotificationConstants.NotificationSound.achievement,
            });
            // Handle updating Research List UI with new Research
            ResearchHandler.filterResearchList();
        }
    }

    canAccess(): boolean {
        return App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Laboratory_key);
    }

    /**
     * Handles caching the current effects from the placed machines in the Lab
     */
    resetEffects(): void {
        // Setting up Queue Slots
        const originalSlots = this.machineEffects['Egg Queue Slots']();
        let newSlots = 0;

        // Resetting values
        this.machineEffects['Machine Speed'](1);
        this.machineEffects['Egg Step Gain'](1);
        // Check for relevent machines placed
        this.placedMachines().forEach(machine => {
            // Handle Generators
            if (machine.machine.id === Lab.Machine.generator) {
                const state: GeneratorState = (machine.state as GeneratorState);
                const currentMultiplier = this.machineEffects['Machine Speed']();
                this.machineEffects['Machine Speed'](currentMultiplier * state.effect());
                return;
            }
            // Handle Incubators
            if (machine.machine.id === Lab.Machine.incubator) {
                const state: IncubatorState = (machine.state as IncubatorState);
                const currentMultiplier = this.machineEffects['Egg Step Gain']();
                this.machineEffects['Egg Step Gain'](currentMultiplier * state.effect());
                newSlots += state.queueSlots();
            }
        });

        // Handling queue slots
        if (newSlots < originalSlots) {
            const currentSlotNum = App.game.breeding.queueSlots();
            // Removing extra pokemon from queue if necessary
            for (let i = 0; i < originalSlots - newSlots; i++) {
                App.game.breeding.removeFromQueue(currentSlotNum - 1 - i);
            }
        }
        this.machineEffects['Egg Queue Slots'](newSlots);
    }

    beginResearch(research: Research) {
        if (this.currentResearch().length < this.unlockedResearchSlots()) {
            this.currentResearch.push(new ResearchSlot(research, []));
            research.inProgress = true;
            research.progress = 0;
        }
    }

    cancelResearch(research: Research, shouldConfirm = false) {
        // eslint-disable-next-line no-alert
        if (shouldConfirm && !confirm('Are you sure you want to cancel this research? All progress will be lost.')) {
            return;
        }
        const researchSlot = this.currentResearch().find(slot => slot.research.id === research.id);
        if (!researchSlot) {
            console.error(`Error: Completed research ${research.name} when not in slot.`);
            return;
        }
        researchSlot.clear();
        this.currentResearch.remove(researchSlot);
    }

    completeResearch(research: Research) {
        research.completed = true;
        App.game.lab.resetEffects();
        // Handle complete delegate
        if (research.completeDelegate) {
            research.completeDelegate();
        }
        this.cancelResearch(research);
    }

    isResearched(research: Lab.Research): boolean {
        const res = this.researchList[research];
        if (!res) {
            console.error(`Error: Could not find Research ${research} - ${Lab.Research[research]}`);
            return false;
        }
        return res.completed;
    }

    fromJSON(json: Record<string, any>): void {
        if (!json) {
            console.warn('Lab not loaded.');
            return;
        }

        if (json.hasOwnProperty('researchList')) {
            for (const key in json['researchList']) {
                if (json['researchList'].hasOwnProperty(key)) {
                    this.researchList[Lab.Research[key]].fromJSON(json['researchList'][key]);
                }
            }
        }

        if (json.hasOwnProperty('currentResearch')) {
            json['currentResearch'].forEach(res => {
                const slot = new ResearchSlot(undefined, []);
                slot.fromJSON(res);
                this.currentResearch.push(slot);
            });
        } else {
            this.currentResearch(this.defaults.currentResearch);
        }

        if (json.hasOwnProperty('machines')) {
            for (const key in json['machines']) {
                if (json['machines'].hasOwnProperty(key)) {
                    this.machines[Lab.Machine[key]].fromJSON(json['machines'][key]);
                }
            }
        }

        if (json.hasOwnProperty('placedMachines')) {
            json['placedMachines'].forEach(res => {
                const machine = new PlacedMachine();
                machine.fromJSON(res);
                this.placedMachines.push(machine);
            });
        } else {
            this.placedMachines(this.defaults.placedMachines);
        }
    }

    toJSON(): Record<string, any> {
        const save = {};

        save['researchList'] = {};
        for (let i = 0; i < this.researchList.length; i++) {
            save['researchList'][Lab.Research[this.researchList[i].id]] = this.researchList[i].toJSON();
        }

        save['currentResearch'] = this.currentResearch().map(res => res.toJSON());

        save['machines'] = {};
        for (let i = 0; i < this.machines.length; i++) {
            save['machines'][Lab.Machine[this.machines[i].id]] = this.machines[i].toJSON();
        }

        save['placedMachines'] = this.placedMachines().map(res => res.toJSON());

        return save;
    }

}

namespace Lab {
    export enum Research {
        // Research
        'research_slot1' = 0,
        'research_slot2',
        'research_workers1',
        'research_workers2',
        'research_workers3',
        'research_workers4',
        // Fabricator
        'fabricator',
        'fabricator_speed1',
        'fabricator_speed2',
        'fabricator_speed3',
        'fabricator_speed4',
        // Plate Deconstructor
        'plate_deconstructor',
        'plate_deconstructor_speed1',
        'plate_deconstructor_speed2',
        'plate_deconstructor_speed3',
        'plate_deconstructor_speed4',
        'plate_deconstructor_eff1',
        'plate_deconstructor_eff2',
        'plate_deconstructor_eff3',
        // Plate Reconstructor
        'plate_reconstructor',
        'plate_reconstructor_speed1',
        'plate_reconstructor_speed2',
        'plate_reconstructor_speed3',
        'plate_reconstructor_speed4',
        'plate_reconstructor_eff1',
        'plate_reconstructor_eff2',
        'plate_reconstructor_eff3',
        // Incubator
       'incubator',
       'incubator_fuel',
       'incubator_fuel_flame_plate',
       'incubator_fuel_fire_stone',
       'incubator_fuel_chople',
       'incubator_fuel_magmarizer',
       'incubator_power1',
       'incubator_power2',
       'incubator_power3',
       'incubator_fuel_eff1',
       'incubator_fuel_eff2',
       'incubator_fuel_eff3',
       'incubator_fuel_cap1',
       'incubator_fuel_cap2',
       'incubator_fuel_cap3',
       'incubator_fuel_cap4',
       'incubator_fuel_cap5',
       'incubator_slot1',
       'incubator_slot2',
       'incubator_slot3',
       'incubator_slot4',
        // Fossil Reviver
        'fossil_reviver',
        'fossil_reviver_speed1',
        'fossil_reviver_speed2',
        'fossil_reviver_speed3',
        'fossil_reviver_queue',
        'fossil_reviver_queue1',
        'fossil_reviver_queue2',
        'fossil_reviver_queue3',
        'fossil_reviver_queue4',
        'fossil_helix',
        'fossil_dome',
        'fossil_old_amber',
        'fossil_root',
        'fossil_claw',
        'fossil_skull',
        'fossil_armor',
        'fossil_cover',
        'fossil_plume',
        'fossil_jaw',
        'fossil_sail',
        // TODO: HLXII - Add VIII fossils
        // Generator
        'generator',
        'generator_power1',
        'generator_power2',
        'generator_power3',
        'generator_fuel',
        'generator_fuel_zap_plate',
        'generator_fuel_thunder_stone',
        'generator_fuel_wacan',
        'generator_fuel_electirizer',
        'generator_fuel_eff1',
        'generator_fuel_eff2',
        'generator_fuel_eff3',
        'generator_fuel_cap1',
        'generator_fuel_cap2',
        'generator_fuel_cap3',
        'generator_fuel_cap4',
        'generator_fuel_cap5',
        // Research Booster

        // Pokeball Factory
        'pokeball_factory',
        'pokeball_factory_speed1',
        'pokeball_factory_speed2',
        'pokeball_factory_speed3',
        'fastball',
        'quickball',
        'timerball',
        'duskball',
        'luxuryball',
        // TODO: HLXII - Add after Apricorns implemented
        /*
        fastball_apricorn,
        quickball_apricorn,
        timerball_apricorn,
        duskball_apricorn,
        luxuryball_apricorn,
        */
        // Type Booster
        /*
        'type_boost',
        'type_boost_normal',
        'type_boost_fire',
        'type_boost_water',
        'type_boost_electric',
        'type_boost_grass',
        'type_boost_ice',
        'type_boost_fighting',
        'type_boost_poison',
        'type_boost_ground',
        'type_boost_flying',
        'type_boost_psychic',
        'type_boost_bug',
        'type_boost_rock',
        'type_boost_ghost',
        'type_boost_dragon',
        'type_boost_dark',
        'type_boost_steel',
        'type_boost_fairy',
        */
        // Weather Controller

        // Time Machine
        //'time_machine',
        // Fabricator Item Blueprints
        'fire_stone',
        'water_stone',
        'thunder_stone',
        'leaf_stone',
        'moon_stone',
        'sun_stone',
        'dragon_scale',
        'metal_coat',
        'upgrade',
        'dubious_disc',
        'electirizer',
        'magmarizer',
        'protector',
        'reaper_cloth',
        'ice_stone',
        // Genesect
        'drive_burner',
        'shock_drive',
        'burn_drive',
        'chill_drive',
        'douse_drive',
        // Arceus
        'legendary_plate',
        'legendary_draco_plate',
        'legendary_dread_plate',
        'legendary_earth_plate',
        'legendary_fist_plate',
        'legendary_flame_plate',
        'legendary_icicle_plate',
        'legendary_insect_plate',
        'legendary_iron_plate',
        'legendary_meadow_plate',
        'legendary_mind_plate',
        'legendary_sky_plate',
        'legendary_splash_plate',
        'legendary_spooky_plate',
        'legendary_stone_plate',
        'legendary_toxic_plate',
        'legendary_zap_plate',
        'legendary_pixie_plate',
    }

    export enum Machine {
        'fabricator' = 0,
        'plate_deconstructor',
        'plate_reconstructor',
        'incubator',
        'fossil_reviver',
        'generator',
        'pokeball_factory',
    }
}
