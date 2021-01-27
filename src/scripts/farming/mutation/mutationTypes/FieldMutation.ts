/// <reference path="./GrowMutation.ts" />

/**
 * Mutation that requires a number of Berry plants in the farm
 */
class FieldMutation extends GrowMutation {

    fieldBerry: BerryType
    fieldAmount: number

    constructor(mutationChance: number, mutatedBerry: BerryType, fieldBerry: BerryType, fieldAmount = 22, options?: MutationOptions) {
        super(mutationChance, mutatedBerry, options);
        this.fieldBerry = fieldBerry;
        this.fieldAmount = fieldAmount;
    }

    /**
     * Determines which plots can mutate
     * @return The plot indices that can mutate
     */
    getMutationPlots(): number[] {
        const emptyPlots = super.getMutationPlots();
        let fieldPlots = 0;
        App.game.farming.plotList.forEach((plot, idx) => {
            if (!plot.isUnlocked) {
                return;
            }
            if (plot.isEmpty()) {
                return;
            }
            if (plot.berry === this.fieldBerry && plot.stage() === PlotStage.Berry) {
                fieldPlots += 1;
            }
        });

        if (fieldPlots > this.fieldAmount) {
            return emptyPlots;
        }
        return [];
    }

    /**
     * Determines whether the player can even cause this mutation
     */
    get unlocked(): boolean {
        // Check for Berry requirements
        if (!App.game.farming.berries[this.fieldBerry].unlocked()) {
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
        return `Legends tell of a mysterious Berry that only appears in a field of ${BerryType[this.fieldBerry]} Berries.`;
    }

}
