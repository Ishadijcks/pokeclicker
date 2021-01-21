interface ResearchOption {
    requirements?: (Requirement | MultiRequirement | OneFromManyRequirement)[],
    workerFilter?: WorkerFilter;
    completeDelegate?: () => void;
}
class Research implements Saveable {

    saveKey: string;
    defaults = {
        progress: 0,
        inProgress: false,
        completed: false,
        notified: false,
    };

    public id: Lab.Research;
    public type: ResearchType[];
    public name: string;
    private _description: string;
    public points: number;

    private _requirements?: (Requirement | MultiRequirement | OneFromManyRequirement)[];
    private _workerFilter?: WorkerFilter;
    public completeDelegate: () => void | undefined;

    private _progress: KnockoutObservable<number>
    private _inProgress: KnockoutObservable<boolean>
    private _completed: KnockoutObservable<boolean>;

    state: KnockoutComputed<ResearchState>;

    private _notified: KnockoutObservable<boolean>;

    constructor(id: Lab.Research, type: ResearchType | ResearchType[], name: string, description: string, points: number, option?: ResearchOption) {
        this.id = id;
        this.type = Array.isArray(type) ? type : [type];
        this.name = name;
        this._description = description;
        this.points = points;
        this._requirements = option?.requirements;
        this._workerFilter = option?.workerFilter;
        this.completeDelegate = option?.completeDelegate;

        this._progress = ko.observable(this.defaults.progress);
        this._inProgress = ko.observable(this.defaults.inProgress);
        this._completed = ko.observable(this.defaults.completed);

        this.state = ko.pureComputed(function () {
            if (!this.canResearch()) {
                return ResearchState.Locked;
            } else if (this._completed()) {
                return ResearchState.Completed;
            } else if (!this._inProgress()) {
                return ResearchState.Ready;
            } else if (this._inProgress()) {
                return ResearchState.Researching;
            }
            return ResearchState.Locked;
        }, this);

        this._notified = ko.observable(this.defaults.notified);
    }

    /**
     * Determines whether this research is unlocked yet
     */
    canResearch() {
        if (this._requirements) {
            return this._requirements.every(requirement => requirement.isCompleted());
        }
        return true;
    }

    availableWorkerList() {
        return App.game.party.caughtPokemon.filter(pokemon =>  {
            if (pokemon.location !== PartyLocation.Battle) {
                return false;
            }
            if (this.workerFilter) {
                return this.workerFilter.filter(pokemon);
            }
            return true;
        });
    }

    toJSON(): Record<string, any> {
        const json = {
            completed: this.completed,
            inProgress: this.inProgress,
            progress: this.progress,
            notified: this.notified,
        };
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        this.completed = json.hasOwnProperty('completed') ? json['completed'] : this.defaults.completed;
        this.inProgress = json.hasOwnProperty('inProgress') ? json['inProgress'] : this.defaults.inProgress;
        this.progress = json.hasOwnProperty('progress') ? json['progress'] : this.defaults.progress;
        this.notified = json.hasOwnProperty('notified') ? json['notified'] : this.defaults.notified;
    }


    get completed() {
        return this._completed();
    }

    set completed(bool: boolean) {
        this._completed(bool);
    }

    get inProgress() {
        return this._inProgress();
    }

    set inProgress(bool: boolean) {
        this._inProgress(bool);
    }

    get progress() {
        return this._progress();
    }

    set progress(value: number) {
        this._progress(value);
    }

    get progressPercent() {
        return (this.progress / this.points) * 100;
    }

    // TODO: HLXII - Possibly handle different display types
    get progressString() {
        return `${this.progress.toFixed(0)}/${this.points}`;
    }

    get workerFilter() {
        return this._workerFilter;
    }

    get description(): string {
        if (this._description) {
            return this._description;
        }
        return '';
    }

    get hint(): string {
        if (!this._requirements) {
            return '';
        }
        return this._requirements.map(req => req.hint()).join(' and ');
    }

    get notified() {
        return this._notified();
    }

    set notified(bool: boolean) {
        this._notified(bool);
    }

}
