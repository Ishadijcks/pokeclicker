/// <reference path="../Machine.ts" />
/// <reference path="../MachineState.ts" />
/// <reference path="./IncubatorFuel.ts" />
/// <reference path="./IncubatorFuelType.ts" />

/**
 * The Incubator will increase the steps gained, as well as increase the total amount of queue slots.
 */
class Incubator extends Machine {

    constructor(id: Lab.Machine, name: string, description: string, width: number, height: number) {
        super(id, name, description, width, height);
    }

    createState(json?: any): MachineState {
        const state = new IncubatorState();
        state.fromJSON(json);
        return state;
    }

    //#region Research Multipliers

    /**
     * Determines the amount of queue slots added when placed in the Lab.
     * Dependent on Research Upgrades
     */
    public static queueSlotGain: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.incubator_slot4)) {
            return 5;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_slot3)) {
            return 4;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_slot2)) {
            return 3;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_slot1)) {
            return 2;
        } else {
            return 1;
        }
    });

    /**
     * Determines the step multiplier this Incubator will produce.
     * Dependent on Research Upgrades
     */
    public static stepGain: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.incubator_power3)) {
            return 1.05;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_power2)) {
            return 1.03;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_power1)) {
            return 1.02;
        } else {
            return 1.01;
        }
    });

    /**
     * Determines the max fuel that can be added to the Incubator.
     * Dependent on Research Upgrades
     */
    public static fuelCapacity: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.incubator_fuel_cap5)) {
            return 1000000;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_fuel_cap4)) {
            return 100000;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_fuel_cap3)) {
            return 50000;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_fuel_cap2)) {
            return 10000;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_fuel_cap1)) {
            return 5000;
        } else {
            return 1000;
        }
    });

    /**
     * Determines the fuel efficiency multiplier for the Incubator
     * Dependent on Research Upgrades
     */
    public static fuelEfficiency: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.incubator_fuel_eff3)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_fuel_eff2)) {
            return 1.50;
        } else if (App.game.lab.isResearched(Lab.Research.incubator_fuel_eff1)) {
            return 1.25;
        } else {
            return 1;
        }
    });

    //#endregion

    /**
     * Possible Fuels that can be used in the Incubator
     */
    public static fuelTypes: IncubatorFuel[] = [];
    public static initialize() {
        this.fuelTypes[IncubatorFuelType.fire_shard]    = new IncubatorFuel(IncubatorFuelType.fire_shard, {type: ItemType.shard, id: PokemonType.Fire}, 1, Lab.Research.incubator_fuel);
        this.fuelTypes[IncubatorFuelType.flame_plate]   = new IncubatorFuel(IncubatorFuelType.flame_plate, {type: ItemType.underground, id: 'Flame Plate'} , 1000, Lab.Research.incubator_fuel_flame_plate);
        this.fuelTypes[IncubatorFuelType.chople_berry]  = new IncubatorFuel(IncubatorFuelType.chople_berry, {type: ItemType.berry, id: BerryType.Chople} , 500, Lab.Research.incubator_fuel_chople);
        this.fuelTypes[IncubatorFuelType.fire_stone]    = new IncubatorFuel(IncubatorFuelType.fire_stone, {type: ItemType.item, id: 'Fire_stone'}, 20000, Lab.Research.incubator_fuel_fire_stone);
        this.fuelTypes[IncubatorFuelType.magmarizer]    = new IncubatorFuel(IncubatorFuelType.magmarizer, {type: ItemType.item, id: 'Magmarizer'}, 100000, Lab.Research.incubator_fuel_magmarizer);
    }

    public static getAvailableFuels(): IncubatorFuel[] {
        return this.fuelTypes.filter(fuel => !fuel.research || App.game.lab.isResearched(fuel.research));
    }

    public static getFuelAmount(fuel: IncubatorFuel): number {
        return fuel.fuelAmount * this.fuelEfficiency();
    }

    //#region Fueling Handling

    public static selectedFuel: KnockoutObservable<IncubatorFuelType> = ko.observable(IncubatorFuelType.fire_shard);
    public static amount: KnockoutObservable<number> = ko.observable(1);

    public static getFuelTotalAmount(fuel: IncubatorFuel): number {
        return this.getFuelAmount(fuel) * this.amount();
    }

    public static resetAmount() {
        const input = $('input[name="amountOfFuel"]');
        input.val(1).change();
    }

    public static increaseAmount(n: number) {
        const input = $('input[name="amountOfFuel"]');
        const newVal = (parseInt(input.val().toString(), 10) || 0) + n;
        input.val(newVal > 1 ? newVal : 1).change();
    }

    public static multiplyAmount(n: number) {
        const input = $('input[name="amountOfFuel"]');
        const newVal = (parseInt(input.val().toString(), 10) || 0) * n;
        input.val(newVal > 1 ? newVal : 1).change();
    }

    public static maxAmount(state: IncubatorState) {
        const fuel: IncubatorFuel = Incubator.fuelTypes[Incubator.selectedFuel()];
        const input = $('input[name="amountOfFuel"]');

        // Use all of inventory, or max to fill tank
        const amount = Math.min(BagHandler.amount(fuel.item)(), state.getMaxFillAmount(fuel));

        input.val(amount).change();
    }

    //#endregion

}

class IncubatorState extends MachineState {

    private _fuel: KnockoutObservable<number>;

    public effect: KnockoutComputed<number>;
    public queueSlots: KnockoutComputed<number>;

    constructor() {
        super();

        this._fuel = ko.observable(0);

        this.tooltip = ko.pureComputed(() => {
            const tooltip = [];
            if (this.active) {
                tooltip.push(`Increasing queue slots by ${Incubator.queueSlotGain()}.`);
            } else {
                tooltip.push('Disabled');
            }
            if (App.game.lab.isResearched(Lab.Research.incubator_fuel)) {
                if (this.stage === MachineStage.active) {
                    tooltip.push(`Increasing step gain by ${Incubator.stepGain().toFixed(2)}x.`);
                }
                if (this.fuel <= 0) {
                    tooltip.push('No fuel remaining');
                } else {
                    tooltip.push(`${this.fuel.toFixed(1)} fuel remaining.`);
                }
            }
            return tooltip.join('<br>');
        });

        this.effect = ko.pureComputed(() => {
            if (this.stage === MachineStage.active) {
                return Incubator.stepGain();
            } else {
                return 1;
            }
        });

        this.queueSlots = ko.pureComputed(() => {
            if (this.active) {
                return Incubator.queueSlotGain();
            } else {
                return 0;
            }
        });
    }

    update(delta: number, _multiplier: Multiplier): MachineUpdateInfo {
        const info: MachineUpdateInfo = {};
        switch (this.stage) {
            case MachineStage.disabled: {
                break;
            }
            case MachineStage.idle: {
                if (this.fuel) {
                    this.stage = MachineStage.active;
                    info.resetEffects = true;
                }
                break;
            }
            case MachineStage.active: {
                this.fuel = Math.max(this.fuel - delta, 0);
                // Run out of fuel
                if (this.fuel == 0) {
                    this.stage = MachineStage.idle;
                    info.resetEffects = true;

                    // Notify completion
                    Notifier.notify({
                        message: 'An Incubator has run out of fuel.',
                        type: NotificationConstants.NotificationOption.warning,
                        sound: NotificationConstants.NotificationSound.empty_queue,
                        setting: NotificationConstants.NotificationSetting.incubator,
                    });
                }
                break;
            }
        }
        return info;
    }

    /**
     * Based on the current fuel status, determine how much of a given Fuel type is
     * required to completely fuel the Incubator.
     * @param fuel The Incubator Fuel to be used
     */
    getMaxFillAmount(fuel: IncubatorFuel) {
        const emptyFuel = Incubator.fuelCapacity() - this.fuel;
        return Math.ceil(emptyFuel / Incubator.getFuelAmount(fuel));
    }

    checkValue() {
        if (Incubator.amount() < 0) {
            Notifier.notify( {message: 'Please enter a number greater than zero'});
        } else {
            this.addFuel();
        }
    }

    /**
     * Handles fueling the Incubator
     */
    addFuel() {
        const fuel: IncubatorFuel = Incubator.fuelTypes[Incubator.selectedFuel()];
        let amount = Incubator.amount();
        // Use only what's available
        amount = Math.min(amount, BagHandler.amount(fuel.item)());
        // Don't waste fuel
        amount = Math.min(amount, this.getMaxFillAmount(fuel));

        // Handle fueling
        BagHandler.gainItem(fuel.item, -amount);
        const fuelCost = amount * Incubator.getFuelAmount(fuel);
        this.fuel += fuelCost;

        // Handle Statistics
        GameHelper.incrementObservable(App.game.statistics.totalIncubatorFuelItemsUsed, amount);
        GameHelper.incrementObservable(App.game.statistics.totalIncubatorFuelUsed, fuelCost);
        GameHelper.incrementObservable(App.game.statistics.incubatorFuelItemUsed[Incubator.selectedFuel()], amount);

        // Sanity check
        this.fuel = Math.min(this.fuel, Incubator.fuelCapacity());

        Incubator.resetAmount();
    }

    handleActivate(): void {
        if (this.fuel > 0) {
            this.stage = MachineStage.active;
        } else {
            this.stage = MachineStage.idle;
        }
        // Handle updating multipliers
        App.game.lab.resetEffects();
    }
    handleDeactivate(): void {
        this.stage = MachineStage.disabled;
        // Handle updating multipliers
        App.game.lab.resetEffects();
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['fuel'] = this.fuel;
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);
        if (!json) {
            this.fuel = 0;
        } else {
            this.fuel = json.hasOwnProperty('fuel') ? json['fuel'] : 0;
        }
    }

    get fuel(): number {
        return this._fuel();
    }

    set fuel(fuel: number) {
        this._fuel(fuel);
    }

}
