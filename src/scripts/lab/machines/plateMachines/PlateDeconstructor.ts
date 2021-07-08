/// <reference path="./PlateMachine.ts" />
/**
 * The Plate Deconstructor machine is used to deconstruct plates into shards.
 */
class PlateDeconstructor extends PlateMachine {

    public static baseShardProfit = 200;
    public static progressAmount = 3600;

    /**
     * The amount of shards gained from deconstruction, based on the research upgrades.
     */
    public static shardProfit: KnockoutComputed<number> = ko.pureComputed(() => {
        let multiplier = 1;
        if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_eff3)) {
            multiplier = 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_eff2)) {
            multiplier = 1.5;
        } else if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_eff1)) {
            multiplier = 1.25;
        }
        return PlateDeconstructor.baseShardProfit * multiplier;
    });

    /**
     * The progress multiplier, based on research upgrades.
     */
    public static progressSpeed: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_speed4)) {
            return 2;
        } else if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_speed3)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_speed2)) {
            return 1.50;
        } else if (App.game.lab.isResearched(Lab.Research.plate_deconstructor_speed1)) {
            return 1.25;
        }
        return 1;
    });

    createState(json?: any): MachineState {
        const state = new PlateDeconstructorState();
        state.fromJSON(json);
        return state;
    }

}

class PlateDeconstructorState extends PlateMachineState {

    constructor() {
        super();

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
                    tooltip.push(`Deconstructing ${Underground.getMineItemById(UndergroundItem.getPlateIDByType(this.plateType)).name}s`);
                    tooltip.push(`${this.queue} left in queue.`);
                    return tooltip.join('<br>');
                }
            }
        });
        this.progressAmount = ko.pureComputed(() => {
            return PlateDeconstructor.progressAmount;
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
                // Checking if there are plates to deconstruct
                if (PlateDeconstructor.getPlateAmount(this.plateType)() > 0) {
                    this.stage = MachineStage.active;
                    GameHelper.incrementObservable(PlateDeconstructor.getPlateAmount(this.plateType), -1);
                    this.progress = 0;
                    this.queue -= 1;
                }
                break;
            }
            case MachineStage.active: {
                this.progress += delta * PlateDeconstructor.progressSpeed() * multiplier.getBonus('machine');
                // Checking deconstruction completion
                if (this.progress >= this.progressAmount()) {
                    // Gain shards
                    App.game.shards.gainShards(PlateDeconstructor.shardProfit(), this.plateType);

                    // Handle Statistics
                    GameHelper.incrementObservable(App.game.statistics.totalPlatesDeconstructed);
                    GameHelper.incrementObservable(App.game.statistics.platesDeconstructed[this.plateType]);

                    // Notify completion
                    const name = Underground.getMineItemById(UndergroundItem.getPlateIDByType(this.plateType)).name;
                    Notifier.notify({
                        message: `${GameHelper.anOrA(name, true)} ${name} has been deconstructed.`,
                        type: NotificationConstants.NotificationOption.success,
                        setting: NotificationConstants.NotificationSetting.plate_deconstructor,
                    });

                    // Checking queue
                    if (this.queue > 0 && PlateDeconstructor.getPlateAmount(this.plateType)() > 0) {
                        this.queue -= 1;
                        GameHelper.incrementObservable(PlateDeconstructor.getPlateAmount(this.plateType), -1);
                    } else {
                        this.stage = MachineStage.idle;

                        // Notify queue empty
                        Notifier.notify({
                            message: 'A Plate Deconstructor has emptied its queue.',
                            type: NotificationConstants.NotificationOption.warning,
                            sound: NotificationConstants.NotificationSound.empty_queue,
                            setting: NotificationConstants.NotificationSetting.plate_deconstructor,
                        });
                    }
                    this.progress = 0;
                }
                break;
            }
        }
        return info;
    }

    handleDeactivate() {
        if (this.stage === MachineStage.active) {
            this.progress = 0;
            // Returning Plate
            GameHelper.incrementObservable(PlateDeconstructor.getPlateAmount(this.plateType), 1);
            this.queue += 1;
        }
        this.stage = MachineStage.disabled;
    }

    setMaxQueue(): void {
        this.queue = PlateDeconstructor.getPlateAmount(this.plateType)();
    }

}
