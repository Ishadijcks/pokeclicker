/// <reference path="./EvolveNearMutation.ts" />

/**
 * Mutation that requires specific flavored Berry plants near a Berry plot
 * Will check the surround plots for the flavors of the nearby Berry plants. Must be in the range of the flavorReqs
 */
class EvolveNearFlavorMutation extends EvolveNearMutation {

    flavorReqs: number[][];

    readonly flavorRatio = [0.5, 0.75, 1];  // Determines how much flavor a Berry plant has before fully mature.

    /**
     * Constructor for a FlavorMutation
     * @param mutationChance The chance of the mutation occuring
     * @param mutatedBerry The mutated BerryType
     * @param flavorReqs The flavor requirements for the mutation to occur
     * @param options The additional MutationOptions
     */
    constructor(mutationChance: number, mutatedBerry: BerryType, originalBerry: BerryType, flavorReqs: number[][], options?: MutationOptions) {
        super(mutationChance, mutatedBerry, originalBerry, options);
        this.flavorReqs = flavorReqs;
    }

    /**
     * Determines if the plots near fit the requirements
     * @param plots The list of nearby plots
     */
    nearPlotsFitRequirements(plots: number[]) {
        const nearFlavors = [0, 0, 0, 0, 0];
        plots.forEach(idx => {
            const plot = App.game.farming.plotList[idx];
            if (!plot.isUnlocked) {
                return;
            }
            if (plot.isEmpty()) {
                return;
            }
            if (plot.stage() < PlotStage.Taller) {
                return;
            }
            const berryFlavors = App.game.farming.berries[plot.berry].flavors.map(x => x.value * this.flavorRatio[plot.stage() - 2]);
            for (let j = 0; j < 5; j++) {
                nearFlavors[j] += berryFlavors[j];
            }
        });

        return this.flavorReqs.every((value, idx) => value[0] <= nearFlavors[idx] && nearFlavors[idx] <= value[1]);
    }

}
