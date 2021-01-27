/// <reference path="./GrowMutation.ts" />

/**
 * Mutation for the Petaya Berry. Requires all 18 typed Berries to be in the field.
 */
class PetayaMutation extends GrowMutation {

    constructor(mutationChance: number, options?: MutationOptions) {
        super(mutationChance, BerryType.Petaya, options);
    }

    /**
     * Determines which plots can mutate
     * @return The plot indices that can mutate
     */
    getMutationPlots(): number[] {
        const emptyPlots = super.getMutationPlots();
        const fieldPlots: any = {};
        App.game.farming.plotList.forEach((plot, idx) => {
            if (!plot.isUnlocked) {
                return;
            }
            if (plot.isEmpty()) {
                return;
            }
            if (plot.stage() !== PlotStage.Berry) {
                return;
            }
            if (!fieldPlots[plot.berry]) {
                fieldPlots[plot.berry] = 1;
            } else {
                fieldPlots[plot.berry] += 1;
            }
        });

        const requiredBerries = Farming.getGeneration(3);

        if (requiredBerries.every(berry => fieldPlots[berry])) {
            return emptyPlots;
        }
        return [];
    }

    /**
     * Determines whether the player can even cause this mutation
     */
    get unlocked(): boolean {
        // Check for Berry requirements
        const requiredBerries = Farming.getGeneration(3);
        if (!requiredBerries.every(berry => App.game.farming.berries[berry].unlocked())) {
            return false;
        }
        return super.unlocked;
    }

    /**
     * Handles getting the hint for this mutation for the Kanto Berry Master
     */
    get hint(): string {
        if (super.hint) {
            return super.hint;
        }
        return 'Legends tell of a mysterious Berry that only appears while surrounded by all types of Berries.';
    }

}
