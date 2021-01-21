class PlacedMachine implements Saveable {

    saveKey: string;
    defaults: {
        machine: undefined
        x: 0,
        y: 0,
        active: false,
    }

    private _machine: KnockoutObservable<Machine>;
    public state: MachineState;

    private _x: KnockoutObservable<number>;
    private _y: KnockoutObservable<number>;

    public machineTop: KnockoutComputed<string>;
    public machineLeft: KnockoutComputed<string>;
    public machineWidth: KnockoutComputed<string>;
    public machineHeight: KnockoutComputed<string>;

    public tooltip: KnockoutComputed<string>;

    constructor(machine?: Machine, x?: number, y?: number) {
        this._machine = ko.observable<Machine>(machine);
        if (machine) {
            this.state = machine.createState();
        }
        this._x = ko.observable<number>(x ?? 0);
        this._y = ko.observable<number>(y ?? 0);

        this.machineTop = ko.pureComputed(() => {
            return `${LabController.cellHeight() * (this.y + 1)}%`;
        });
        this.machineLeft = ko.pureComputed(() => {
            return `${LabController.cellWidth() * (this.x + 1)}%`;
        });
        this.machineWidth = ko.pureComputed(() => {
            return `${LabController.cellWidth() * (this.machine ? this.machine.width : 0)}%`;
        });
        this.machineHeight = ko.pureComputed(() => {
            return `${LabController.cellHeight() * (this.machine ? this.machine.height : 0)}%`;
        });

        this.tooltip = ko.pureComputed(() => {
            const tooltip = [];
            tooltip.push(`<u>${this.machine.name}</u>`);
            tooltip.push(this.state.tooltip());
            return tooltip.join('<br>');
        });
    }

    /**
     * Handles removing the machine from the Lab
     */
    remove() {
        // Handle clearing MachineState
        this.state.remove();

        // Add Machine back to inventory
        this.machine.amount += 1;

        // Closing modal
        this.machine.closeModal();

        // Handle removing machine from placed machines
        App.game.lab.placedMachines.remove(this);

        // Reset machine effects
        App.game.lab.resetEffects();
    }

    toJSON(): Record<string, any> {
        return {
            machine: this.machine.id,
            x: this.x,
            y: this.y,
            state: this.state.toJSON(),
        };
    }
    fromJSON(json: Record<string, any>): void {
        this.machine = App.game.lab.machines.find(machine => machine.id == json['machine']);
        this.x = json.hasOwnProperty('x') ? json['x'] : this.defaults.x;
        this.y = json.hasOwnProperty('y') ? json['y'] : this.defaults.y;
        this.state = this.machine.createState(json['state']);
    }

    cells(): number[][] {
        return this.machine.cells(this.x, this.y);
    }

    get x(): number {
        return this._x();
    }

    set x(value: number) {
        this._x(value);
    }

    get y(): number {
        return this._y();
    }

    set y(value: number) {
        this._y(value);
    }

    get machine(): Machine {
        return this._machine();
    }

    set machine(value: Machine) {
        this._machine(value);
    }
}
