/// <reference path="./Machine.ts" />
/// <reference path="./MachineState.ts" />

interface Fossil {
    name: string,
    pokemon: PokemonNameType,
    research: Lab.Research,
}

class RevivingFossil {

    private _progress: KnockoutObservable<number>;

    constructor(public fossil?: string) {
        this._progress = ko.observable(0);
    }

    update(delta: number): void {
        this.progress = Math.min(this.progress + delta, this.progressAmount);
    }

    get data(): Fossil {
        return FossilReviver.fossils[this.fossil];
    }

    get progressAmount(): number {
        const dataPokemon: DataPokemon = PokemonHelper.getPokemonByName(this.data.pokemon);
        return App.game.breeding.getSteps(dataPokemon.eggCycles);
    }

    // TODO: HLXII - Handle progress a bit better
    get progressPercent() {
        return (this.progress / this.progressAmount) * 100;
    }

    // TODO: HLXII - Possibly handle different progress string types (percent, total amount, time, etc);
    get progressString() {
        return `${this.progress.toFixed(0)}/${this.progressAmount}`;
    }

    fromJSON(json: any) {
        if (!json) {
            return;
        }
        this.fossil = json.hasOwnProperty('fossil') ? json['fossil'] : undefined;
        this.progress = json.hasOwnProperty('progress') ? json['progress'] : 0;
    }

    toJSON(): any {
        return {
            fossil: this.fossil,
            progress: this.progress,
        };
    }

    get progress(): number {
        return this._progress();
    }

    set progress(progress: number) {
        this._progress(progress);
    }
}

/**
 * The Fossil Reviver will be used to revive Fossil Pokemon.
 */
class FossilReviver extends Machine {

    createState(json?: any): MachineState {
        const state = new FossilReviverState();
        state.fromJSON(json);
        return state;
    }

    public static getImage(fossil: string): string {
        return `assets/images/breeding/${fossil}.png`;
    }

    public static getAvailableFossils() {
        return Object.keys(this.fossils).filter(fossilName => {
            return BagHandler.amount({type: ItemType.underground, id: fossilName})() > 0;
        });
    }

    public static reviveSlots = 2;

    public static fossils: Record<string, Fossil> = {
        'Helix Fossil':     {name: 'Helix Fossil', pokemon: 'Omanyte', research: Lab.Research.fossil_helix},
        'Dome Fossil':      {name: 'Dome Fossil', pokemon: 'Kabuto', research: Lab.Research.fossil_dome},
        'Old Amber':        {name: 'Old Amber', pokemon: 'Aerodactyl', research: Lab.Research.fossil_old_amber},
        'Root Fossil':      {name: 'Root Fossil', pokemon: 'Lileep', research: Lab.Research.fossil_root},
        'Claw Fossil':      {name: 'Claw Fossil', pokemon: 'Anorith', research: Lab.Research.fossil_claw},
        'Armor Fossil':     {name: 'Armor Fossil', pokemon: 'Shieldon', research: Lab.Research.fossil_armor},
        'Skull Fossil':     {name: 'Skull Fossil', pokemon: 'Cranidos', research: Lab.Research.fossil_skull},
        'Cover Fossil':     {name: 'Cover Fossil', pokemon: 'Tirtouga', research: Lab.Research.fossil_cover},
        'Plume Fossil':     {name: 'Plume Fossil', pokemon: 'Archen', research: Lab.Research.fossil_plume},
        //'Jaw Fossil':       {name: 'Jaw Fossil', pokemon: 'Tyrunt', research: Lab.Research.fossil_jaw},
        //'Sail Fossil':      {name: 'Sail Fossil', pokemon: 'Amaura', research: Lab.Research.fossil_sail},
    }

    public static isDisabled(state: FossilReviverState, fossil: string) {
        // Check fossil research
        const fossilData = FossilReviver.fossils[fossil];
        if (!fossilData) {
            console.error(`Error: Fossil Data not found - ${fossil}`);
            return true;
        }
        const research = fossilData.research;
        if (!research) {
            console.error(`Error: Fossil Research not found - ${fossil}`);
            return true;
        }
        if (!App.game.lab.isResearched(research)) {
            return true;
        }

        // Check available slots (whether reviving or queue)
        return !this.hasAvailableSlots(state);
    }

    public static hasAvailableSlots(state: FossilReviverState) {
        if (state.queue.length < FossilReviver.queueSlots()) {
            return true;
        }

        if (state.hasOpenReviveSlots()) {
            return true;
        }

        return false;
    }

    /**
     * Determines the speed of revival
     * Dependent on Research Upgrades
     */
    public static revivalSpeed: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.fossil_reviver_speed1)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.fossil_reviver_speed1)) {
            return 1.5;
        } else if (App.game.lab.isResearched(Lab.Research.fossil_reviver_speed1)) {
            return 1.25;
        } else {
            return 1;
        }
    });

    /**
     * Determines the number of queue slots
     * Dependent on Research Upgrades
     */
    public static queueSlots: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.fossil_reviver_queue4)) {
            return 64;
        } else if (App.game.lab.isResearched(Lab.Research.fossil_reviver_queue3)) {
            return 32;
        } else if (App.game.lab.isResearched(Lab.Research.fossil_reviver_queue2)) {
            return 16;
        } else if (App.game.lab.isResearched(Lab.Research.fossil_reviver_queue1)) {
            return 8;
        } else if (App.game.lab.isResearched(Lab.Research.fossil_reviver_queue)) {
            return 4;
        } else {
            return 0;
        }
    });
}

class FossilReviverState extends MachineState {

    private _fossils: Array<KnockoutObservable<RevivingFossil>>;

    private _queue: KnockoutObservableArray<string>;

    constructor() {
        super();
        this._fossils = [ko.observable(new RevivingFossil()), ko.observable(new RevivingFossil())];
        this._queue = ko.observableArray([]);

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
                    const fossils = this._fossils.filter(fossil => fossil().fossil).map(fossil => fossil().fossil).join(' and a ');
                    tooltip.push(`Reviving a ${fossils}`);
                    if (this.hasFossilsInQueue()) {
                        tooltip.push(`${this.queue.length} fossils in queue`);
                    }
                    return tooltip.join('<br>');
                }
            }
        });
    }

    update(delta: number, multiplier: Multiplier): MachineUpdateInfo {
        const info: MachineUpdateInfo = {};
        switch (this.stage) {
            case MachineStage.disabled: {
                break;
            }
            case MachineStage.idle: {
                // There are fossils in the system
                if (this.hasRevivingFossils() || this.hasFossilsInQueue()) {
                    this.stage = MachineStage.active;
                    // Handling filling in revive slots if necessary
                    this.fillSlots();
                }
                break;
            }
            case MachineStage.active: {
                // Updating fossils
                const progress = delta * FossilReviver.revivalSpeed() * multiplier.getBonus('machine');
                this._fossils.reverse().forEach((fossil, idx) => {
                    if (!fossil().fossil) {
                        return;
                    }
                    fossil().update(progress);

                    // Checking completion
                    if (fossil().progress >= fossil().progressAmount) {
                        // Handle revival
                        this.reviveFossil(fossil().fossil);
                        // Removing from revive slots
                        this._fossils[idx](new RevivingFossil());
                        // Shifting empty slots
                        this.shiftEmptyReviveSlots();
                    }
                });

                // Filling from queue
                this.fillSlots();

                // Checking if switch to idle
                if (!this.hasRevivingFossils()) {
                    this.stage = MachineStage.idle;

                    // Notify queue empty
                    Notifier.notify({
                        message: 'A Fossil Reviver has emptied its queue.',
                        type: NotificationConstants.NotificationOption.warning,
                        sound: NotificationConstants.NotificationSound.empty_queue,
                        setting: NotificationConstants.NotificationSetting.fossil_reviver,
                    });
                }
                break;
            }
        }
        return info;
    }

    handleActivate(): void {
        this.stage = MachineStage.active;
    }
    handleDeactivate(): void {
        this.stage = MachineStage.disabled;
    }

    /**
     * Handles removing the machine from the lab
     */
    remove(): void {
        super.remove();
        // Handle removing fossils from revive slots
        this._fossils.forEach((fossil) => {
            if (!fossil().fossil) {
                return;
            }
            BagHandler.gainItem({type: ItemType.underground, id: fossil().data.name}, 1);
        });

        // Handle removing fossils from queue slots
        if (this.queue.length) {
            this.queue.forEach(fossil => {
                BagHandler.gainItem({type: ItemType.underground, id: fossil}, 1);
            });
        }
    }

    hasRevivingFossils(): boolean {
        for (let i = 0; i < this._fossils.length; i++) {
            if (this._fossils[i]().fossil) {
                return true;
            }
        }
        return false;
    }

    hasOpenReviveSlots(): boolean {
        for (let i = 0; i < this._fossils.length; i++) {
            if (!this._fossils[i]().fossil) {
                return true;
            }
        }
        return false;
    }

    hasFossilsInQueue(): boolean {
        return this.queue.length > 0;
    }

    hasOpenQueueSlots(): boolean {
        return this.queue.length < FossilReviver.queueSlots();
    }

    /**
     * Shifts empty revive slots to the end
     */
    shiftEmptyReviveSlots() {
        // Getting current fossils
        const existingFossils = this._fossils.filter(fossil => fossil().fossil).map(fossil => fossil());
        // Clearing slots
        this._fossils.forEach(fossil => fossil(new RevivingFossil()));
        // Adding back fossils
        existingFossils.forEach((fossil, idx) => {
            this._fossils[idx](fossil);
        });
    }

    /**
     * Handles adding a fossil to the revive slots
     * @param fossil The fossil name
     * @returns Whether the fossil was successfully added to the revive slots
     */
    addToReviveSlots(fossil: string): boolean {
        const fossilData = FossilReviver.fossils[fossil];
        if (!fossilData) {
            console.error(`Error: Invalid Fossil to add = ${fossil}`);
            return false;
        }
        for (let i = 0; i < this._fossils.length; i++) {
            if (!this._fossils[i]().fossil) {
                this._fossils[i](new RevivingFossil(fossil));
                return true;
            }
        }

        return false;
    }

    /**
     * Handles shifting in fossils from the queue
     */
    fillSlots() {
        // Go until either revive slots are full, or queue is empty
        while (this.hasOpenReviveSlots() && this.queue.length > 0) {
            const newFossil = this._queue.shift();
            this.addToReviveSlots(newFossil);
        }
    }

    /**
     * Handles adding a fossil to the Fossil Reviver (whether in a revive slot or the queue)
     * @param fossil The fossil name
     * @returns Whether the fossil was successfully added
     */
    addToMachine(fossil: string): boolean {
        // Attempt to add to revive slot
        if (this.addToReviveSlots(fossil)) {
            // Remove from inventory
            BagHandler.gainItem({type: ItemType.underground, id: fossil}, -1);
            return true;
        }

        // Attempt to add to queue slot
        if (this.hasOpenQueueSlots()) {
            this._queue.push(fossil);
            // Remove from inventory
            BagHandler.gainItem({type: ItemType.underground, id: fossil}, -1);
            return true;
        }
        return false;
    }

    removeFromQueue(index: number): boolean {
        if (this.queue.length > index) {
            const fossil = this._queue.splice(index, 1)[0];
            // Adding back to inventory
            BagHandler.gainItem({type: ItemType.underground, id: fossil}, 1);
            return true;
        }
        return false;
    }

    /**
     * Handles reviving the fossil Pokemon
     * @param fossil The fossil name
     */
    reviveFossil(fossil: string) {
        // TODO: HLXII - Update logic to handle SwSh Fossils when that region is implemented

        const pokemonName = FossilReviver.fossils[fossil].pokemon;
        const shiny = PokemonFactory.generateShiny(GameConstants.SHINY_CHANCE_FOSSIL);

        // TODO: HLXII - Possibly add attack on reviving Pokemon?
        const partyPokemon = App.game.party.caughtPokemon.find(p => p.name == pokemonName);

        const pokemonID = PokemonHelper.getPokemonByName(pokemonName).id;
        App.game.party.gainPokemonById(pokemonID, shiny);

        if (shiny) {
            Notifier.notify({
                message: `✨ You revived a shiny ${pokemonName}! ✨`,
                type: NotificationConstants.NotificationOption.warning,
                sound: NotificationConstants.NotificationSound.shiny_long,
                setting: NotificationConstants.NotificationSetting.hatched_shiny,
            });
            App.game.logbook.newLog(LogBookTypes.SHINY, `You revived a shiny ${pokemonName}!`);
        } else {
            Notifier.notify({
                message: `You revived ${GameHelper.anOrA(pokemonName)} ${pokemonName}!`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.hatched,
            });
        }

        // Update statistics
        GameHelper.incrementObservable(App.game.statistics.totalFossilsRevived);
        GameHelper.incrementObservable(App.game.statistics.fossilsRevived[fossil]);
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['fossils'] = this._fossils.map(fossil => fossil().toJSON());
        json['queue'] = this.queue;
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);
        if (!json) {
            return;
        }

        if (json.hasOwnProperty('fossils')) {
            const fossilList: Record<string, any>[] = json['fossils'];
            for (let i = 0; i < fossilList.length; i++) {
                const fossil = fossilList[i];
                if (fossil) {
                    const revivingFossil = new RevivingFossil();
                    revivingFossil.fromJSON(fossil);
                    this._fossils[i] = ko.observable(revivingFossil);
                }
            }
        }

        this.queue = json.hasOwnProperty('queue') ? json['queue'] : [];
    }

    get queue(): string[] {
        return this._queue();
    }

    set queue(value: string[]) {
        this._queue(value);
    }

}
