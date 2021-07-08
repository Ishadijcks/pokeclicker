/// <reference path="../Machine.ts" />
/// <reference path="../MachineState.ts" />
/// <reference path="./GeneratorFuel.ts" />
/// <reference path="./GeneratorFuelType.ts" />

/**
 * The Generator will increase the speed of machines when placed in the Lab.
 */
class Generator extends Machine {

    constructor(id: Lab.Machine, name: string, description: string, width: number, height: number) {
        super(id, name, description, width, height);
    }

    createState(json?: any): MachineState {
        const state = new GeneratorState();
        state.fromJSON(json);
        return state;
    }

    //#region Research Multipliers

    /**
     * Determines the total base speed multiplier this Generator will produce.
     * Dependent on Research Upgrades
     */
    public static baseEffect: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.generator_power3)) {
            return 1.3;
        } else if (App.game.lab.isResearched(Lab.Research.generator_power2)) {
            return 1.2;
        } else if (App.game.lab.isResearched(Lab.Research.generator_power1)) {
            return 1.1;
        } else {
            return 1.05;
        }
    });

    /**
     * Determines the max fuel that can be added to the Generator.
     * Dependent on Research Upgrades
     */
    public static fuelCapacity: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.generator_fuel_cap5)) {
            return 1000000;
        } else if (App.game.lab.isResearched(Lab.Research.generator_fuel_cap4)) {
            return 100000;
        } else if (App.game.lab.isResearched(Lab.Research.generator_fuel_cap3)) {
            return 50000;
        } else if (App.game.lab.isResearched(Lab.Research.generator_fuel_cap2)) {
            return 10000;
        } else if (App.game.lab.isResearched(Lab.Research.generator_fuel_cap1)) {
            return 5000;
        } else {
            return 1000;
        }
    });

    /**
     * Determines the fuel efficiency multiplier for the Generator
     * Dependent on Research Upgrades
     */
    public static fuelEfficiency: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.generator_fuel_eff3)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.generator_fuel_eff2)) {
            return 1.50;
        } else if (App.game.lab.isResearched(Lab.Research.generator_fuel_eff1)) {
            return 1.25;
        } else {
            return 1;
        }
    });

    //#endregion

    /**
     * Possible Fuels that can be used in the Generator
     */
    public static fuelTypes: GeneratorFuel[] = [];
    public static initialize() {
        this.fuelTypes[GeneratorFuelType.electric_shard]    = new GeneratorFuel(GeneratorFuelType.electric_shard, {type: ItemType.shard, id: PokemonType.Electric}, 1, Lab.Research.generator_fuel);
        this.fuelTypes[GeneratorFuelType.zap_plate]         = new GeneratorFuel(GeneratorFuelType.zap_plate, {type: ItemType.underground, id: 'Zap Plate'} , 1000, Lab.Research.generator_fuel_zap_plate);
        this.fuelTypes[GeneratorFuelType.wacan_berry]       = new GeneratorFuel(GeneratorFuelType.wacan_berry, {type: ItemType.berry, id: BerryType.Wacan} , 500, Lab.Research.generator_fuel_wacan);
        this.fuelTypes[GeneratorFuelType.thunder_stone]     = new GeneratorFuel(GeneratorFuelType.thunder_stone, {type: ItemType.item, id: 'Thunder_stone'}, 20000, Lab.Research.generator_fuel_thunder_stone);
        this.fuelTypes[GeneratorFuelType.electirizer]       = new GeneratorFuel(GeneratorFuelType.electirizer, {type: ItemType.item, id: 'Electirizer'}, 100000, Lab.Research.generator_fuel_electirizer);
    }

    public static getAvailableFuels(): GeneratorFuel[] {
        return this.fuelTypes.filter(fuel => !fuel.research || App.game.lab.isResearched(fuel.research));
    }

    public static getFuelAmount(fuel: GeneratorFuel): number {
        return fuel.fuelAmount * this.fuelEfficiency();
    }

    //#region Fueling Handling

    public static selectedFuel: KnockoutObservable<GeneratorFuelType> = ko.observable(GeneratorFuelType.electric_shard);
    public static amount: KnockoutObservable<number> = ko.observable(1);

    public static getFuelTotalAmount(fuel: GeneratorFuel): number {
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

    public static maxAmount(state: GeneratorState) {
        const fuel: GeneratorFuel = Generator.fuelTypes[Generator.selectedFuel()];
        const input = $('input[name="amountOfFuel"]');

        // Use all of inventory, or max to fill tank
        const amount = Math.min(BagHandler.amount(fuel.item)(), state.getMaxFillAmount(fuel));

        input.val(amount).change();
    }

    //#endregion

}

class GeneratorState extends MachineState {

    private _fuel: KnockoutObservable<number>;

    public effect: KnockoutComputed<number>;

    constructor() {
        super();

        this._fuel = ko.observable(0);

        this.tooltip = ko.pureComputed(() => {
            const tooltip = [];
            if (this.active) {
                tooltip.push(`Increasing Machine speed by ${this.effect().toFixed(2)}x.`);
            } else {
                tooltip.push('Disabled');
            }
            if (App.game.lab.isResearched(Lab.Research.generator_fuel)) {
                if (this.fuel <= 0) {
                    tooltip.push('No fuel remaining');
                } else {
                    tooltip.push(`${this.fuel.toFixed(1)} fuel remaining.`);
                }
            }
            return tooltip.join('<br>');
        });

        this.effect = ko.pureComputed(() => {
            if (!this.active) {
                return 1;
            }
            let multiplier = Generator.baseEffect();
            if (this.stage === MachineStage.active) {
                multiplier *= 1.5;
            }
            return multiplier;
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
                        message: 'A Generator has run out of fuel.',
                        type: NotificationConstants.NotificationOption.warning,
                        sound: NotificationConstants.NotificationSound.empty_queue,
                        setting: NotificationConstants.NotificationSetting.generator,
                    });
                }
                break;
            }
        }
        return info;
    }

    /**
     * Based on the current fuel status, determine how much of a given Fuel type is
     * required to completely fuel the Generator.
     * @param fuel The Generator Fuel to be used
     */
    getMaxFillAmount(fuel: GeneratorFuel) {
        const emptyFuel = Generator.fuelCapacity() - this.fuel;
        return Math.ceil(emptyFuel / Generator.getFuelAmount(fuel));
    }

    checkValue() {
        if (Generator.amount() < 0) {
            Notifier.notify( {message: 'Please enter a number greater than zero'});
        } else {
            this.addFuel();
        }
    }

    /**
     * Handles fueling the Generator
     */
    addFuel() {
        const fuel: GeneratorFuel = Generator.fuelTypes[Generator.selectedFuel()];
        let amount = Generator.amount();
        // Use only what's available
        amount = Math.min(amount, BagHandler.amount(fuel.item)());
        // Don't waste fuel
        amount = Math.min(amount, this.getMaxFillAmount(fuel));

        // Handle fueling
        BagHandler.gainItem(fuel.item, -amount);
        const fuelCost = amount * Generator.getFuelAmount(fuel);
        this.fuel += fuelCost;

        // Handle Statistics
        GameHelper.incrementObservable(App.game.statistics.totalIncubatorFuelItemsUsed, amount);
        GameHelper.incrementObservable(App.game.statistics.totalIncubatorFuelUsed, fuelCost);
        GameHelper.incrementObservable(App.game.statistics.incubatorFuelItemUsed[Generator.selectedFuel()], amount);

        // Sanity check
        this.fuel = Math.min(this.fuel, Generator.fuelCapacity());

        Generator.resetAmount();
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
