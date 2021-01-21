/// <reference path="../Machine.ts" />
/// <reference path="../MachineState.ts" />

/**
 * The Fabricator machine is used to create new machines as well as other items.
 */
class Fabricator extends Machine {

    createState(json?: any): MachineState {
        const state = new FabricatorState();
        state.fromJSON(json);
        return state;
    }

    /**
     * Fabricator Blueprints
     */
    public static blueprints: Blueprint[];
    public static initialize() {
        this.blueprints = [];

        //#region Items

        this.blueprints[BlueprintType.fire_stone] = new Blueprint('Fire Stone', BlueprintType.fire_stone, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Fire}, amount: 10000}],
            {type: ItemType.item, id: 'Fire_stone'}, Lab.Research.fire_stone);

        this.blueprints[BlueprintType.water_stone] = new Blueprint('Water Stone', BlueprintType.water_stone, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Water}, amount: 10000}],
            {type: ItemType.item, id: 'Water_stone'}, Lab.Research.water_stone);

        this.blueprints[BlueprintType.thunder_stone] = new Blueprint('Thunder Stone', BlueprintType.thunder_stone, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 10000}],
            {type: ItemType.item, id: ''}, Lab.Research.thunder_stone);

        this.blueprints[BlueprintType.leaf_stone] = new Blueprint('Leaf Stone', BlueprintType.leaf_stone, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Grass}, amount: 10000}],
            {type: ItemType.item, id: 'Leaf_stone'}, Lab.Research.leaf_stone);

        this.blueprints[BlueprintType.moon_stone] = new Blueprint('Moon Stone', BlueprintType.moon_stone, 1000,
            [
                {item: {type: ItemType.shard, id: PokemonType.Fairy}, amount: 5000},
                {item: {type: ItemType.shard, id: PokemonType.Rock}, amount: 5000},
            ],
            {type: ItemType.item, id: 'Moon_stone'}, Lab.Research.moon_stone);

        this.blueprints[BlueprintType.sun_stone] = new Blueprint('Sun Stone', BlueprintType.sun_stone, 1000,
            [
                {item: {type: ItemType.shard, id: PokemonType.Fire}, amount: 5000},
                {item: {type: ItemType.shard, id: PokemonType.Rock}, amount: 5000},
            ],
            {type: ItemType.item, id: 'Sun_stone'}, Lab.Research.sun_stone);

        this.blueprints[BlueprintType.dragon_scale] = new Blueprint('Dragon Scale', BlueprintType.dragon_scale, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Dragon}, amount: 10000}],
            {type: ItemType.item, id: 'Dragon_scale'}, Lab.Research.dragon_scale);

        this.blueprints[BlueprintType.metal_coat] = new Blueprint('Metal Coat', BlueprintType.metal_coat, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Steel}, amount: 10000}],
            {type: ItemType.item, id: 'Metal_coat'}, Lab.Research.metal_coat);

        this.blueprints[BlueprintType.upgrade] = new Blueprint('Upgrade', BlueprintType.upgrade, 1000,
            [
                {item: {type: ItemType.shard, id: PokemonType.Steel}, amount: 5000},
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 5000},
            ],
            {type: ItemType.item, id: 'Upgrade'}, Lab.Research.upgrade);

        this.blueprints[BlueprintType.dubious_disc] = new Blueprint('Dubious Disc', BlueprintType.dubious_disc, 1000,
            [
                {item: {type: ItemType.shard, id: PokemonType.Steel}, amount: 5000},
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 2500},
                {item: {type: ItemType.shard, id: PokemonType.Dark}, amount: 2500},
            ],
            {type: ItemType.item, id: 'Dubious_disc'}, Lab.Research.dubious_disc);

        this.blueprints[BlueprintType.electirizer] = new Blueprint('Electirizer', BlueprintType.electirizer, 1000,
            [
                {item: {type: ItemType.item, id: 'Metal_coat'}, amount: 1},
                {item: {type: ItemType.shard, id: PokemonType.Steel}, amount: 5000},
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 5000},
            ],
            {type: ItemType.item, id: 'Electirizer'}, Lab.Research.electirizer);

        this.blueprints[BlueprintType.magmarizer] = new Blueprint('Magmarizer', BlueprintType.magmarizer, 1000,
            [
                {item: {type: ItemType.item, id: 'Metal_coat'}, amount: 1},
                {item: {type: ItemType.shard, id: PokemonType.Steel}, amount: 5000},
                {item: {type: ItemType.shard, id: PokemonType.Fire}, amount: 5000},
            ],
            {type: ItemType.item, id: 'Magmarizer'}, Lab.Research.magmarizer);

        this.blueprints[BlueprintType.protector] = new Blueprint('Protector', BlueprintType.protector, 1000,
            [
                {item:{type: ItemType.underground, id: 'Fist Plate'}, amount: 4},
                {item:{type: ItemType.underground, id: 'Light Clay'}, amount: 4},
            ],
            {type: ItemType.item, id: 'Protector'}, Lab.Research.protector);

        this.blueprints[BlueprintType.reaper_cloth] = new Blueprint('Reaper Cloth', BlueprintType.reaper_cloth, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Ghost}, amount: 10000}],
            {type: ItemType.item, id: 'Reaper_cloth'}, Lab.Research.reaper_cloth);

        this.blueprints[BlueprintType.ice_stone] = new Blueprint('Ice Stone', BlueprintType.ice_stone, 1000,
            [{item: {type: ItemType.shard, id: PokemonType.Ice}, amount: 10000}],
            {type: ItemType.item, id: 'Ice_stone'}, Lab.Research.ice_stone);

        //#endregion

        //#region Machines

        this.blueprints[BlueprintType.fabricator] = new Blueprint('Fabricator', BlueprintType.fabricator, 50000,
            [{item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 500000}],
            {type: ItemType.machine, id: Lab.Machine.fabricator}, Lab.Research.fabricator);

        this.blueprints[BlueprintType.plate_deconstructor] = new Blueprint('Plate Deconstructor', BlueprintType.plate_deconstructor, 40000,
            [
                {item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 100000},
                {item: {type: ItemType.underground, id: 'Hard Stone'}, amount: 10},
            ],
            {type: ItemType.machine, id: Lab.Machine.plate_deconstructor}, Lab.Research.plate_deconstructor);

        this.blueprints[BlueprintType.plate_reconstructor] = new Blueprint('Plate Reconstructor', BlueprintType.plate_reconstructor, 40000,
            [
                {item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 100000},
                {item: {type: ItemType.item, id: 'Upgrade'}, amount: 10},
            ],
            {type: ItemType.machine, id: Lab.Machine.plate_reconstructor}, Lab.Research.plate_reconstructor);


        this.blueprints[BlueprintType.incubator] = new Blueprint('Incubator', BlueprintType.incubator, 30000,
            [
                {item: {type: ItemType.item, id: 'Metal_coat'}, amount: 10},
                {item: {type: ItemType.item, id: 'Magmarizer'}, amount: 10},
            ],
            {type: ItemType.machine, id: Lab.Machine.incubator}, Lab.Research.incubator);
        this.blueprints[BlueprintType.generator] = new Blueprint('Generator', BlueprintType.generator, 30000,
            [
                {item: {type: ItemType.item, id: 'Metal_coat'}, amount: 10},
                {item: {type: ItemType.item, id: 'Electirizer'}, amount: 10},
            ],
            {type: ItemType.machine, id: Lab.Machine.generator}, Lab.Research.generator);
        //this.blueprints[BlueprintType.fossil_reviver] = new Blueprint('Fossil Reviver', BlueprintType.fossil_reviver, 1000, [], Lab.Research.fossil_reviver);
        //this.blueprints[BlueprintType.pokeball_factory] = new Blueprint('Pokéball Factory', BlueprintType.pokeball_factory, 1000, [], Lab.Research.pokeball_factory);

        //#endregion
    }

    /**
     * Returns the list of Blueprints that are available to the player
     */
    public static getAvailableBlueprints(): Blueprint[] {
        return this.blueprints.filter(blueprint => blueprint.research ? App.game.lab.isResearched(blueprint.research) : true);
    }

    /**
     * The progress multiplier, based on research upgrades.
     */
    public static progressSpeed: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.fabricator_speed4)) {
            return 2;
        } else if (App.game.lab.isResearched(Lab.Research.fabricator_speed3)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.fabricator_speed2)) {
            return 1.50;
        } else if (App.game.lab.isResearched(Lab.Research.fabricator_speed1)) {
            return 1.25;
        }
        return 1;
    });
}

/**
 * The MachineState for the Fabricator
 */
class FabricatorState extends MachineState {

    private _blueprint: KnockoutObservable<BlueprintType>;

    private _queue: KnockoutObservable<number>;

    public queueInput: KnockoutObservable<string>;

    constructor() {
        super();
        this._blueprint = ko.observable(BlueprintType.fabricator);
        this._queue = ko.observable(0);
        this.queueInput = ko.observable('0');

        this.tooltip = ko.pureComputed(() => {
            switch (this.stage) {
                case MachineStage.disabled: {
                    return 'Disabled';
                }
                case MachineStage.idle: {
                    return 'Idle';
                }
                case MachineStage.active: {
                    const tooltip = [];
                    tooltip.push(`Fabricating ${Fabricator.blueprints[this.blueprint].name}`);
                    tooltip.push(`${this.queue} left in queue.`);
                    return tooltip.join('<br>');
                }
            }
        });
        this.progressAmount = ko.pureComputed(() => {
            return Fabricator.blueprints[this.blueprint].time;
        });
    }

    update(delta: number, multiplier: Multiplier): MachineUpdateInfo {
        const info: MachineUpdateInfo = {};
        switch (this.stage) {
            case MachineStage.disabled: {
                break;
            }
            case MachineStage.idle: {
                // Checking queue
                if (this.queue <= 0) {
                    break;
                }
                // Checking if blueprint can be fabricated
                if (Fabricator.blueprints[this.blueprint].canFabricate) {
                    this.stage = MachineStage.active;
                    const blueprint = Fabricator.blueprints[this.blueprint];
                    blueprint.cost.forEach(cost => {
                        BagHandler.gainItem(cost.item, -cost.amount);
                    });
                    this.progress = 0;
                    this.queue -= 1;
                }
                break;
            }
            case MachineStage.active: {
                this.progress += delta * Fabricator.progressSpeed() * multiplier.getBonus('machine');
                // Checking blueprint completion
                if (this.progress >= this.progressAmount()) {
                    // Gain Blueprint
                    BagHandler.gainItem(Fabricator.blueprints[this.blueprint].fabrication);

                    // Handle Statistics
                    GameHelper.incrementObservable(App.game.statistics.totalFabrications);
                    GameHelper.incrementObservable(App.game.statistics.blueprintsFabricated[this.blueprint]);

                    // Notify completion
                    const name = Fabricator.blueprints[this.blueprint].name;
                    Notifier.notify({
                        message: `${GameHelper.anOrA(name, true)} ${name} has been fabricated.`,
                        type: NotificationConstants.NotificationOption.success,
                        setting: NotificationConstants.NotificationSetting.fabricator,
                    });

                    // Checking queue
                    if (this.queue > 0 && Fabricator.blueprints[this.blueprint].canFabricate) {
                        this.queue -= 1;
                        const blueprint = Fabricator.blueprints[this.blueprint];
                        blueprint.cost.forEach(cost => {
                            BagHandler.gainItem(cost.item, -cost.amount);
                        });
                    } else {
                        this.stage = MachineStage.idle;

                        // Notify queue empty
                        Notifier.notify({
                            message: 'A Fabricator has emptied its queue.',
                            type: NotificationConstants.NotificationOption.warning,
                            sound: NotificationConstants.NotificationSound.empty_queue,
                            setting: NotificationConstants.NotificationSetting.fabricator,
                        });
                    }
                    this.progress = 0;
                }
                break;
            }
        }
        return info;
    }

    handleActivate() {
        this.stage = MachineStage.idle;
        // Handling queueInput
        this.queue = !isNaN(Number(this.queueInput())) ? Number(this.queueInput()) : 0;
    }

    handleDeactivate() {
        if (this.stage === MachineStage.active) {
            this.progress = 0;
            // Returning Blueprint costs
            const blueprint = Fabricator.blueprints[this.blueprint];
            blueprint.cost.forEach(cost => {
                BagHandler.gainItem(cost.item, cost.amount);
            });
            this.queue += 1;
        }
        this.stage = MachineStage.disabled;
    }

    /**
     * Determines the max amount of the blueprint that can be created, and sets the queue to that value
     */
    setMaxQueue(): void {
        // Finding Max for each cost
        const maxFabs = Fabricator.blueprints[this.blueprint].cost.map(cost => {
            const inventoryAmount = BagHandler.amount(cost.item)();
            return Math.floor(inventoryAmount / cost.amount);
        });
        // Setting to bottlenecked item
        this.queue = Math.min(...maxFabs);
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['blueprint'] = this.blueprint;
        json['queue'] = this.queue;
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);
        if (!json) {
            this.blueprint = BlueprintType.fabricator;
            this.queue = 0;
        } else {
            this.blueprint = json.hasOwnProperty('blueprint') ? json['blueprint'] : BlueprintType.fabricator;
            this.queue = json.hasOwnProperty('queue') ? json['queue'] : 0;
        }
    }

    get blueprint(): BlueprintType {
        return this._blueprint();
    }

    set blueprint(blueprint: BlueprintType) {
        this._blueprint(blueprint);
    }

    get queue(): number {
        return this._queue();
    }

    set queue(value: number) {
        this._queue(value);
        this.queueInput(this._queue().toString());
    }

}
