/// <reference path="../../declarations/GameHelper.d.ts" />

abstract class Quest {
    index: number;
    amount: number
    customDescription?: string;
    pointsReward: number;
    progress: KnockoutComputed<number>;
    progressText: KnockoutComputed<string>;
    inProgress: KnockoutComputed<boolean>;
    isCompleted: KnockoutComputed<boolean>;
    claimed: KnockoutObservable<boolean>;
    private _focus: KnockoutObservable<any>;
    initial: KnockoutObservable<any>;
    notified: boolean;
    autoComplete: boolean;
    autoCompleter: KnockoutSubscription;
    inQuestLine: boolean;
    _onLoad?: () => void;
    onLoadCalled: boolean;

    constructor(amount: number, pointsReward: number) {
        this.amount = amount;
        this.pointsReward = pointsReward;
        this.initial = ko.observable(null);
        this.claimed = ko.observable(false);
        this.notified = false;
        this.onLoadCalled = false;
    }

    get description(): string {
        return this.customDescription ?? 'Generic Quest Description. This should be overriden.';
    }

    public static generateData(): any[] {
        return [1, 0];
    }

    public static randomizeReward(pointsReward: number) {
        const randomPointBonus = 0.9 + SeededRand.next() * 0.2; // random between 0.9 and 1.1
        return Math.ceil(pointsReward * randomPointBonus);
    }

    get xpReward(): number {
        return 100 + (this.pointsReward / 10);
    }

    //#region Quest Status

    claim() {
        if (this.isCompleted() && !this.claimed()) {
            App.game.quests.addXP(this.xpReward);
            this.claimed(true);
            if (this.pointsReward) {
                App.game.wallet.gainQuestPoints(this.pointsReward);
                Notifier.notify({
                    message: `You have completed your quest and claimed ${this.pointsReward} quest points!`,
                    type: NotificationConstants.NotificationOption.success,
                });
                App.game.logbook.newLog(
                    LogBookTypes.QUEST_COMPLETE,
                    `Completed "${this.description}" for ${this.pointsReward} quest points.`);
            } else {
                Notifier.notify({
                    message: 'You have completed a quest!',
                    type: NotificationConstants.NotificationOption.success,
                });
                App.game.logbook.newLog(
                    LogBookTypes.QUEST_COMPLETE,
                    `Completed "${this.description}".`);
            }
            GameHelper.incrementObservable(App.game.statistics.questsCompleted);
            return true;
        }
        return false;
    }

    quit(shouldConfirm = false) {
        if (shouldConfirm) {
            Notifier.confirm({
                title: 'Quit quest',
                message: 'Are you sure?\n\nYou can start the quest again later but you will lose all progress!',
                type: NotificationConstants.NotificationOption.warning,
                confirm: 'quit',
            }).then(confirmed => {
                if (confirmed) {
                    this.initial(null);
                }
            });
        } else {
            this.initial(null);
        }
    }

    begin() {
        this.initial(this.focus());
    }

    set focus(value: KnockoutObservable<any>) {
        this._focus = value;
        this.createProgressObservables();
    }

    get focus() {
        return this._focus;
    }

    protected createProgressObservables() {
        this.progress = ko.pureComputed(() => {
            if (this.initial() !== null) {
                return Math.min(1, ( this.focus() - this.initial()) / this.amount);
            } else {
                return 0;
            }
        });

        this.progressText = ko.pureComputed(() => {
            if (this.initial() !== null) {
                return `${Math.min((this.focus() - this.initial()), this.amount)} / ${this.amount}`;
            } else {
                return `0 / ${this.amount}`;
            }
        });

        this.inProgress = ko.pureComputed(() => {
            return this.initial() !== null && !this.claimed();
        });

        // This computed has a side effect - creating a notification - so we cannot safely make it a pureComputed
        // This will only be a problem if we make it subscribe to a function which lives longer than itself
        // Since it is only subscribing to observables on `this`, and the function is being kept on `this`, we shouldn't have a problem
        this.isCompleted = ko.computed(() => {
            const completed = this.progress() == 1 || this.claimed();
            if (!this.autoComplete && completed && !this.notified) {
                Notifier.notify({
                    message: `You can complete your quest for ${this.pointsReward} quest points!`,
                    type: NotificationConstants.NotificationOption.success,
                    timeout: 5e3,
                    sound: NotificationConstants.NotificationSound.quest_ready_to_complete,
                    setting: NotificationConstants.NotificationSetting.quest_ready_to_complete,
                });
                this.notified = true;
            }
            return completed;
        });
    }

    onLoad() {
        if (typeof this._onLoad === 'function' && !this.onLoadCalled) {
            this._onLoad();
            this.onLoadCalled = true;
        }
    }

    complete() {
        this.initial(this.focus() - this.amount);
    }

    createAutoCompleter() {
        this.autoComplete = true;
        this.autoCompleter = this.isCompleted.subscribe(() => {
            if (this.isCompleted()) {
                this.claim();
                this.autoCompleter.dispose();
            }
        });
    }

    //#endregion

    toJSON() {
        return {
            index: this.index || 0,
            customDescription: this.customDescription,
            data: <any[]>[this.amount ,this.pointsReward],
            initial: this.initial(),
            claimed: this.claimed(),
            notified: this.notified,
        };
    }

    fromJSON(json: any) {
        if (!json) {
            this.index = 0;
            this.claimed(false);
            this.initial(null);
            this.notified = false;
        }
        this.index = json.hasOwnProperty('index') ? json['index'] : 0;
        this.claimed(json.hasOwnProperty('claimed') ? json['claimed'] : false);
        this.initial(json.hasOwnProperty('initial') ? json['initial'] : null);
        this.notified = json.hasOwnProperty('notified') ? json['notified'] : false;
    }
}
