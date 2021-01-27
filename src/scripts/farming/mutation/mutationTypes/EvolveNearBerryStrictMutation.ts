/// <reference path="./EvolveNearMutation.ts" />
/**
 * Mutation that requires very specific Berry plants near an empty plot.
 * The required Berry plants must be in the Berry stage for mutations to occur.
 */
class EvolveNearBerryStrictMutation extends EvolveNearMutation {

    berryReqs: StrictBerryReq;
    neighborStageReq: PlotStage;

    constructor(mutationChance: number, mutatedBerry: BerryType, originalBerry: BerryType, berryReqs: StrictBerryReq, neighborStageReq: PlotStage, options?: MutationOptions) {
        super(mutationChance, mutatedBerry, originalBerry, options);
        this.berryReqs = berryReqs;
        this.neighborStageReq = neighborStageReq;
    }

    /**
     * Determines if the plots near fit the requirements
     * @param plots The list of nearby plots
     */
    nearPlotsFitRequirements(plots: number[]) {
        const currentReqs: StrictBerryReq = {};

        plots.forEach((idx) => {
            const plot = App.game.farming.plotList[idx];
            if (!plot.isUnlocked) {
                return;
            }
            if (plot.isEmpty()) {
                return;
            }
            if (plot.stage() < this.neighborStageReq) {
                return;
            }
            if (!currentReqs[plot.berry]) {
                currentReqs[plot.berry] = 1;
            } else {
                currentReqs[plot.berry] += 1;
            }
        });

        return GameHelper.shallowEqual(this.berryReqs,currentReqs);
    }

    /**
     * Determines whether the player can even cause this mutation
     */
    get unlocked(): boolean {
        for (const berry of Object.keys(this.berryReqs)) {
            if (!App.game.farming.berries[berry].unlocked()) {
                return false;
            }
        }
        return super.unlocked;
    }

}
