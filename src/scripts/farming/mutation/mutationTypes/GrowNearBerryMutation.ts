/// <reference path="./GrowNearMutation.ts" />

/**
 * Mutation that requires specific Berry plants near an empty plot.
 * The required Berry plants must be in the Berry stage for mutations to occur.
 */
class GrowNearBerryMutation extends GrowNearMutation {

    berryReqs: BerryType[];

    constructor(mutationChance: number, mutatedBerry: BerryType, berryReqs: BerryType[], options?: MutationOptions) {
        super(mutationChance, mutatedBerry, options);
        this.berryReqs = berryReqs;
    }

    /**
     * Determines if the plots near fit the requirements
     * @param plots The list of nearby plots
     */
    nearPlotsFitRequirements(plots: number[]) {
        return this.berryReqs.every((req) => {
            return plots.some((plot) => {
                return this.checkRequirement(plot,req);
            });
        });
    }

    /**
     * Checks an individual plot for a Berry requirement
     */
    checkRequirement(index: number, berryReq: BerryType) {
        const plot = App.game.farming.plotList[index];
        if (!plot.isUnlocked) {
            return false;
        }
        if (plot.berry !== berryReq) {
            return false;
        }
        if (plot.stage() !== PlotStage.Berry) {
            return false;
        }
        return true;
    }

    /**
     * Handles getting the hint for this mutation for the Kanto Berry Master
     */
    get hint(): string {
        if (super.hint) {
            return super.hint;
        }
        if (this.berryReqs.length === 1) {
            return `I've heard that growing ${BerryType[this.berryReqs[0]]} Berries can spread a new Berry into nearby empty plots!`;
        }
        if (this.berryReqs.length >= 2) {
            return `I've heard that growing ${this.berryReqs.map(b => BerryType[b]).join(', ').replace(/, ([\w\s]+)$/, ' and $1')} Berries near each other will produce something interesting!`;
        }
        return '';
    }

    /**
     * Determines whether the player can even cause this mutation
     */
    get unlocked(): boolean {
        // Check for Berry requirements
        if (!this.berryReqs.every(req => App.game.farming.berries[req].unlocked())) {
            return false;
        }
        return super.unlocked;
    }

}
