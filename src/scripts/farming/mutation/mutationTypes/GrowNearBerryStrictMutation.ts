/// <reference path="./GrowNearMutation.ts" />

interface StrictBerryReq {
    [key: number]: number
}

/**
 * Mutation that requires very specific Berry plants near an empty plot.
 * The required Berry plants must be in the Berry stage for mutations to occur.
 */
class GrowNearBerryStrictMutation extends GrowNearMutation {

    berryReqs: StrictBerryReq;

    constructor(mutationChance: number, mutatedBerry: BerryType, berryReqs: StrictBerryReq, options?: MutationOptions) {
        super(mutationChance, mutatedBerry, options);
        this.berryReqs = berryReqs;
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
            if (plot.stage() !== PlotStage.Berry) {
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
