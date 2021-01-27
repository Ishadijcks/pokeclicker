/// <reference path="./EvolveNearMutation.ts" />

/**
 * Mutation that requires specific Berry plants near a Berry plot.
 * The required Berry plants must be in the Berry stage for mutations to occur.
 */
class EvolveNearBerryMutation extends EvolveNearMutation {

    berryReqs: BerryType[];

    constructor(mutationChance: number, mutatedBerry: BerryType, originalBerry: BerryType, berryReqs: BerryType[], options?: MutationOptions) {
        super(mutationChance, mutatedBerry, originalBerry, options);
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

    get hint(): string {
        if (super.hint) {
            return super.hint;
        }

        const berryType = this.originalBerry !== undefined ? BerryType[this.originalBerry] : 'some';

        if (this.berryReqs.length === 0) {
            return `I've heard that ${berryType} Berries can spontaneously change!`;
        }

        let str = `I've heard that growing ${berryType} Berries`;
        str += ` near ${this.berryReqs.map(b => BerryType[b]).join(', ').replace(/, ([\w\s]+)$/, ' and $1')} Berries`;
        str += ' can cause it to change!';
        return str;
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
