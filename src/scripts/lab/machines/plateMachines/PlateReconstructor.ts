/// <reference path="./PlateMachine.ts" />
/**
 * The Plate Reconstructor machine is used to reconstruct plates from shards.
 */
class PlateReconstructor extends PlateMachine {

    public static baseShardCost = 1000;
    public static progressAmount = 21600;

    /**
     * The amount of shards used during reconstruction, based on the research upgrades.
     */
    public static shardCost: KnockoutComputed<number> = ko.pureComputed(() => {
        let multiplier = 1;
        if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_eff3)) {
            multiplier = 0.875;
        } else if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_eff2)) {
            multiplier = 0.75;
        } else if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_eff1)) {
            multiplier = 0.5;
        }
        return PlateReconstructor.baseShardCost * multiplier;
    });

    /**
     * The progress multiplier, based on research upgrades.
     */
    public static progressSpeed: KnockoutComputed<number> = ko.pureComputed(() => {
        if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_speed4)) {
            return 2;
        } else if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_speed3)) {
            return 1.75;
        } else if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_speed2)) {
            return 1.50;
        } else if (App.game.lab.isResearched(Lab.Research.plate_reconstructor_speed1)) {
            return 1.25;
        }
        return 1;
    });

    createState(json?: any): MachineState {
        const state = new PlateReconstructorState();
        state.fromJSON(json);
        return state;
    }

}

class PlateReconstructorState extends PlateMachineState {

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
                    tooltip.push(`Constructing ${Underground.getMineItemById(UndergroundItem.getPlateIDByType(this.plateType)).name}s`);
                    tooltip.push(`${this.queue} left in queue.`);
                    return tooltip.join('<br>');
                }
            }
        });
        this.progressAmount = ko.pureComputed(() => {
            return PlateReconstructor.progressAmount;
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
                // Checking if enough shards to begin reconstruction
                if (App.game.shards.shardWallet[this.plateType]() >= PlateReconstructor.shardCost()) {
                    this.stage = MachineStage.active;
                    App.game.shards.gainShards(-PlateReconstructor.shardCost(), this.plateType);
                    this.progress = 0;
                    this.queue -= 1;
                }
                break;
            }
            case MachineStage.active: {
                this.progress += delta * PlateReconstructor.progressSpeed() * multiplier.getBonus('machine');
                // Checking Plate completion
                if (this.progress >= this.progressAmount()) {
                    // Gain plate
                    const plateAmount = PlateReconstructor.getPlateAmount(this.plateType);

                    // Handle Statistics
                    GameHelper.incrementObservable(App.game.statistics.totalPlatesReconstructed);
                    GameHelper.incrementObservable(App.game.statistics.platesReconstructed[this.plateType]);

                    // Notify completion
                    const name = Underground.getMineItemById(UndergroundItem.getPlateIDByType(this.plateType)).name;
                    Notifier.notify({
                        message: `${GameHelper.anOrA(name, true)} ${name} has been reconstructed.`,
                        type: NotificationConstants.NotificationOption.success,
                        sound: NotificationConstants.NotificationSound.achievement,
                        setting: NotificationConstants.NotificationSetting.plate_reconstructor,
                    });

                    GameHelper.incrementObservable(plateAmount, 1);
                    // Checking queue
                    if (this.queue > 0 && App.game.shards.shardWallet[this.plateType]() >= PlateReconstructor.shardCost()) {
                        App.game.shards.gainShards(-PlateReconstructor.shardCost(), this.plateType);
                        this.queue -= 1;
                    } else {
                        this.stage = MachineStage.idle;

                        // Notify queue empty
                        Notifier.notify({
                            message: 'A Plate Reconstructor has emptied its queue.',
                            type: NotificationConstants.NotificationOption.warning,
                            sound: NotificationConstants.NotificationSound.empty_queue,
                            setting: NotificationConstants.NotificationSetting.plate_reconstructor,
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
        this.progress = 0;
        if (this.stage === MachineStage.active) {
            // Returning Shards
            App.game.shards.gainShards(PlateReconstructor.shardCost(), this.plateType);
            this.queue += 1;
        }
        this.stage = MachineStage.disabled;
    }

    setMaxQueue(): void {
        const max = Math.floor(App.game.shards.shardWallet[this.plateType]() / PlateReconstructor.shardCost());
        this.queueInput(max.toString());
    }

}
