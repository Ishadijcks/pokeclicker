/// <reference path="../Machine.ts" />
/**
 * The Plate Machine's base class.
 */
abstract class PlateMachine extends Machine {

    public static getPlateAmount(type: PokemonType): KnockoutObservable<number> {
        const plateID = UndergroundItem.getPlateIDByType(type);
        const plateIndex = player.mineInventoryIndex(plateID);
        return player.mineInventory()[plateIndex].amount;
    }

}

abstract class PlateMachineState extends MachineState {

    private _plateType: KnockoutObservable<PokemonType>;

    private _queue: KnockoutObservable<number>;

    public queueInput: KnockoutObservable<string>;

    constructor() {
        super();
        this._plateType = ko.observable(PokemonType.Water);
        this._queue = ko.observable(0);
        this.queueInput = ko.observable('0');
    }

    handleActivate() {
        this.stage = MachineStage.idle;
        // Handling queueInput
        this.queue = !isNaN(Number(this.queueInput())) ? Number(this.queueInput()) : 0;
    }

    /**
     * Handler for setting the max amount for the queue the player can currently do.
     * Note: This doesn't mean a max amount that can be queued. That is basically infinite.
     */
    abstract setMaxQueue(): void;

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['plateType'] = this.plateType;
        json['queue'] = this.queue;
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);
        if (!json) {
            this.plateType = PokemonType.Water;
            this.queue = 0;
        } else {
            this.plateType = json.hasOwnProperty('plateType') ? json['plateType'] : PokemonType.Water;
            this.queue = json.hasOwnProperty('queue') ? json['queue'] : 0;
        }
    }

    get plateType(): PokemonType {
        return this._plateType();
    }

    set plateType(value: PokemonType) {
        this._plateType(value);
    }

    get queue(): number {
        return this._queue();
    }

    set queue(value: number) {
        this._queue(value);
        this.queueInput(this._queue().toString());
    }

}
