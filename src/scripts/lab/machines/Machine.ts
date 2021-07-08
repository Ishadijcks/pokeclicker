abstract class Machine implements Saveable {

    saveKey: string;
    defaults: {
        amount: 0,
    }

    public _amount: KnockoutObservable<number>;

    constructor(
        public id: Lab.Machine,
        public name: string,
        public description: string,
        public width: number,
        public height: number
    ) {
        this._amount = ko.observable<number>(0);
    }

    /**
     * Creates an empty MachineState for PlacedMachines
     */
    abstract createState(json?: any): MachineState;

    toJSON(): Record<string, any> {
        return {
            amount: this.amount,
        };
    }
    fromJSON(json: Record<string, any>): void {
        this.amount = json.hasOwnProperty('amount') ? json['amount'] : this.defaults.amount;
    }

    get image(): string {
        return `assets/images/lab/machines/${this.name}.png`;
    }

    cells(x: number, y: number): number[][] {
        const cells = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                cells.push([x + i, y + j]);
            }
        }
        return cells;
    }

    /**
     * Determines whether the machine has a modal that can be opened
     * Defaults to yes.
     */
    hasModal(): boolean {
        return true;
    }

    private get modalName(): string {
        return `#${this.name.replace(' ','')}Modal`;
    }
    openModal(): void {
        $(this.modalName).modal('show');
    }
    closeModal(): void {
        $(this.modalName).modal('hide');
    }

    get amount(): number {
        return this._amount();
    }

    set amount(value: number) {
        this._amount(value);
    }

}
