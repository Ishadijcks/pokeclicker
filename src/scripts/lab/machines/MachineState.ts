/**
 * Handles storing the state of the machine.
 */
abstract class MachineState implements Saveable {

    saveKey: string;
    defaults: {
        active: false,
        stage: MachineStage.disabled,
        progress: 0,
    }

    private _active: KnockoutObservable<boolean>;

    private _stage: KnockoutObservable<MachineStage>;

    private _progress: KnockoutObservable<number>;

    public tooltip: KnockoutComputed<string>;
    public progressAmount: KnockoutComputed<number>;

    constructor() {
        this._active = ko.observable(false);
        this._stage = ko.observable(MachineStage.disabled);
        this._progress = ko.observable(0);

        // Will be overrided by child classes
        this.tooltip = ko.pureComputed(() => {
            return 'Machine Tooltip';
        });
        this.progressAmount = ko.pureComputed(() => {
            return 1000;
        });
    }

    /**
     * Toggles the active state
     */
    toggleState() {
        if (this.active) {
            this.active = false;
            this.handleDeactivate();
        } else {
            this.active = true;
            this.handleActivate();
        }
    }

    /**
     * Handles updating the machine state
     * @param delta The seconds passed
     */
    abstract update(delta: number, multiplier: Multiplier): MachineUpdateInfo;

    /**
     * Handler for activating the machine
     */
    abstract handleActivate(): void;

    /**
     * Handler for deactivating the machine
     */
    abstract handleDeactivate(): void;

    /**
     * Handles removing the machine from the lab
     */
    remove(): void {
        this.handleDeactivate();
    }

    toJSON(): Record<string, any> {
        return {
            active: this.active,
            stage: this.stage,
            progress: this.progress,
        };
    }
    fromJSON(json: Record<string, any>): void {
        if (!json) {
            return;
        }
        this.active = json.hasOwnProperty('active') ? json['active'] : false;
        this.stage = json.hasOwnProperty('stage') ? json['stage'] : MachineStage.disabled;
        this.progress = json.hasOwnProperty('progress') ? json['progress'] : 0;
    }

    get active(): boolean {
        return this._active();
    }

    set active(value: boolean) {
        this._active(value);
    }

    get stage(): MachineStage {
        return this._stage();
    }

    set stage(value: MachineStage) {
        this._stage(value);
    }

    get progress(): number {
        return this._progress();
    }

    set progress(value: number) {
        this._progress(value);
    }

    // TODO: HLXII - Handle progress a bit better
    get progressPercent() {
        return (this.progress / this.progressAmount()) * 100;
    }

    // TODO: HLXII - Possibly handle different progress string types (percent, total amount, time, etc);
    get progressString() {
        return `${this.progress.toFixed(0)}/${this.progressAmount()}`;
    }
}
