/// <reference path="../Machine.ts" />
/// <reference path="../MachineState.ts" />

/**
 * The Pokeball Factory machine is used to create Pokeballs.
 */
class PokeballFactory extends Machine {

    createState(json?: any): MachineState {
        const state = new PokeballFactoryState();
        state.fromJSON(json);
        return state;
    }

    /**
     * Pokeball Blueprints
     */
    public static blueprints: PokeballBlueprint[];
    public static initialize() {
        this.blueprints = [];

        //#region Shards

        this.blueprints[PokeballBlueprintType.pokeball] = new PokeballBlueprint('Pokéball', PokeballBlueprintType.pokeball, 5,
            [{item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 20}],
            GameConstants.Pokeball.Pokeball, Lab.Research.pokeball_factory);
        this.blueprints[PokeballBlueprintType.greatball] = new PokeballBlueprint('Greatball', PokeballBlueprintType.greatball, 10,
            [
                {item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 30},
                {item: {type: ItemType.shard, id: PokemonType.Water}, amount: 10},
                {item: {type: ItemType.shard, id: PokemonType.Fire}, amount: 10},
            ],
            GameConstants.Pokeball.Greatball, Lab.Research.pokeball_factory);
        this.blueprints[PokeballBlueprintType.ultraball] = new PokeballBlueprint('Ultraball', PokeballBlueprintType.ultraball, 20,
            [
                {item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 30},
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 15},
                {item: {type: ItemType.shard, id: PokemonType.Dark}, amount: 15},
            ],
            GameConstants.Pokeball.Ultraball, Lab.Research.pokeball_factory);

        this.blueprints[PokeballBlueprintType.fastball] = new PokeballBlueprint('Fastball', PokeballBlueprintType.fastball, 5,
            [
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 30},
                {item: {type: ItemType.shard, id: PokemonType.Fire}, amount: 15},
            ],
            GameConstants.Pokeball.Fastball, Lab.Research.fastball);
        this.blueprints[PokeballBlueprintType.quickball] = new PokeballBlueprint('Quickball', PokeballBlueprintType.quickball, 10,
            [
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 30},
                {item: {type: ItemType.shard, id: PokemonType.Flying}, amount: 15},
            ],
            GameConstants.Pokeball.Quickball, Lab.Research.quickball);
        this.blueprints[PokeballBlueprintType.timerball] = new PokeballBlueprint('Timerball', PokeballBlueprintType.timerball, 20,
            [
                {item: {type: ItemType.shard, id: PokemonType.Normal}, amount: 40},
                {item: {type: ItemType.shard, id: PokemonType.Fire}, amount: 10},
                {item: {type: ItemType.shard, id: PokemonType.Dark}, amount: 10},
            ],
            GameConstants.Pokeball.Timerball, Lab.Research.timerball);
        this.blueprints[PokeballBlueprintType.duskball] = new PokeballBlueprint('Duskball', PokeballBlueprintType.duskball, 5,
            [
                {item: {type: ItemType.shard, id: PokemonType.Grass}, amount: 30},
                {item: {type: ItemType.shard, id: PokemonType.Dark}, amount: 15},
                {item: {type: ItemType.shard, id: PokemonType.Ghost}, amount: 5},
            ],
            GameConstants.Pokeball.Duskball, Lab.Research.duskball);
        this.blueprints[PokeballBlueprintType.luxuryball] = new PokeballBlueprint('Luxuryball', PokeballBlueprintType.luxuryball, 10,
            [
                {item: {type: ItemType.shard, id: PokemonType.Dragon}, amount: 20},
                {item: {type: ItemType.shard, id: PokemonType.Dark}, amount: 20},
                {item: {type: ItemType.shard, id: PokemonType.Electric}, amount: 5},
            ],
            GameConstants.Pokeball.Luxuryball, Lab.Research.luxuryball);

        //#endregion

        //#region Apricorns

        // TODO: HLXII - Add Apricorn Blueprints after implemented

        //#endregion
    }

    /**
     * Returns the list of Blueprints that are available to the player
     */
    public static getAvailableBlueprints(): PokeballBlueprint[] {
        return this.blueprints.filter(blueprint => blueprint.research ? App.game.lab.isResearched(blueprint.research) : true);
    }

    /**
     * The progress multiplier, based on research upgrades.
     */
    public static progressSpeed: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.pokeball_factory_speed3)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.pokeball_factory_speed2)) {
            return 1.50;
        } else if (App.game.lab.isResearched(Lab.Research.pokeball_factory_speed1)) {
            return 1.25;
        } else {
            return 1;
        }
    });
}

/**
 * The MachineState for the Pokeball Factory
 */
class PokeballFactoryState extends MachineState {

    private _blueprint: KnockoutObservable<PokeballBlueprintType>;

    private _queue: KnockoutObservable<number>;

    public queueInput: KnockoutObservable<string>;

    constructor() {
        super();
        this._blueprint = ko.observable(PokeballBlueprintType.pokeball);
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
                    tooltip.push(`Creating ${PokeballFactory.blueprints[this.blueprint].name}`);
                    tooltip.push(`${this.queue} left in queue.`);
                    return tooltip.join('<br>');
                }
            }
        });
        this.progressAmount = ko.pureComputed(() => {
            return PokeballFactory.blueprints[this.blueprint].time;
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
                // Checking if blueprint can be produced
                if (PokeballFactory.blueprints[this.blueprint].canFabricate) {
                    this.stage = MachineStage.active;
                    const blueprint = PokeballFactory.blueprints[this.blueprint];
                    blueprint.cost.forEach(cost => {
                        BagHandler.gainItem(cost.item, -cost.amount);
                    });
                    this.progress = 0;
                    this.queue -= 1;
                }
                break;
            }
            case MachineStage.active: {
                this.progress += delta * PokeballFactory.progressSpeed() * multiplier.getBonus('machine');
                // Checking blueprint completion
                if (this.progress >= this.progressAmount()) {
                    // Gain Blueprint
                    BagHandler.gainItem(PokeballFactory.blueprints[this.blueprint].item);

                    // Handle Statistics
                    GameHelper.incrementObservable(App.game.statistics.totalPokeballsProduced);
                    GameHelper.incrementObservable(App.game.statistics.pokeballsProduced[PokeballFactory.blueprints[this.blueprint].pokeballType]);

                    // Checking queue
                    if (this.queue > 0 && PokeballFactory.blueprints[this.blueprint].canFabricate) {
                        this.queue -= 1;
                        const blueprint = PokeballFactory.blueprints[this.blueprint];
                        blueprint.cost.forEach(cost => {
                            BagHandler.gainItem(cost.item, -cost.amount);
                        });
                    } else {
                        this.stage = MachineStage.idle;
                    }
                    this.progress = 0;

                    // Notify queue empty
                    Notifier.notify({
                        message: 'A Pokéball Factory has emptied its queue.',
                        type: NotificationConstants.NotificationOption.warning,
                        sound: NotificationConstants.NotificationSound.empty_queue,
                        setting: NotificationConstants.NotificationSetting.pokeball_factory,
                    });
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
            const blueprint = PokeballFactory.blueprints[this.blueprint];
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
        const maxPokeballs = PokeballFactory.blueprints[this.blueprint].cost.map(cost => {
            const inventoryAmount = BagHandler.amount(cost.item)();
            return Math.floor(inventoryAmount / cost.amount);
        });
        // Setting to bottlenecked item
        this.queue = Math.min(...maxPokeballs);
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
            this.blueprint = PokeballBlueprintType.pokeball;
            this.queue = 0;
        } else {
            this.blueprint = json.hasOwnProperty('blueprint') ? json['blueprint'] : PokeballBlueprintType.pokeball;
            this.queue = json.hasOwnProperty('queue') ? json['queue'] : 0;
        }
    }

    get blueprint(): PokeballBlueprintType {
        return this._blueprint();
    }

    set blueprint(blueprint: PokeballBlueprintType) {
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
