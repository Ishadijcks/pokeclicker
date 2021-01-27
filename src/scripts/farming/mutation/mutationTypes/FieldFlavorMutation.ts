/// <reference path="./GrowMutation.ts" />

/**
 * Mutation that requires a total amount of flavor in the field
 */
class FieldFlavorMutation extends GrowMutation {

    fieldFlavor: number[];

    readonly flavorRatio = [0.5, 0.75, 1];  // Determines how much flavor a Berry plant has before fully mature.

    constructor(mutationChance: number, mutatedBerry: BerryType, fieldFlavor: number[], options?: MutationOptions) {
        super(mutationChance, mutatedBerry, options);
        this.fieldFlavor = fieldFlavor;
    }

    /**
     * Determines which plots can mutate
     * @return The plot indices that can mutate
     */
    getMutationPlots(): number[] {
        const emptyPlots = super.getMutationPlots();
        const nearFlavors = [0, 0, 0, 0, 0];
        App.game.farming.plotList.forEach((plot, idx) => {
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

        const reqMatched = this.fieldFlavor.every((value, idx) => value <= nearFlavors[idx]);
        if (reqMatched) {
            return emptyPlots;
        }
        return [];
    }

}
