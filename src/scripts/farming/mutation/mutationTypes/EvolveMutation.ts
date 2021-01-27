/// <reference path="../Mutation.ts" />

/**
 * Mutation that occurs on a Berry plant that is PlotStage.Taller or older.
 */
abstract class EvolveMutation extends Mutation {

    originalBerry?: BerryType;

    constructor(mutationChance: number, mutatedBerry: BerryType, originalBerry: BerryType, options?: MutationOptions) {
        super(mutationChance, mutatedBerry, options);

        this.originalBerry = originalBerry;
    }

    /**
     * Determines which plots can mutate
     * @return The plot indices that can mutate
     */
    getMutationPlots(): number[] {
        const plots = [];
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
            if (this.originalBerry && plot.berry !== this.originalBerry) {
                return;
            }
            // Babiri Berries can't mutate
            if (plot.berry === BerryType.Babiri) {
                return;
            }
            plots.push(idx);
        });
        return plots;
    }

    /**
     * Handles updating the farm with the mutation.
     * Mutations will keep the new Berry plant in the same stage as it was previously
     * @param index The plot index to mutate
     */
    handleMutation(index: number): void {
        const plot = App.game.farming.plotList[index];
        const currentStage = plot.stage();
        let newAge = 0;
        if (currentStage !== PlotStage.Seed) {
            newAge = App.game.farming.berries[this.mutatedBerry].growthTime[currentStage - 1] + 1;
        }
        plot.berry = this.mutatedBerry;
        plot.age = newAge;
        plot.notifications = [];
        App.game.farming.unlockBerry(this.mutatedBerry);
    }

    /**
     * Determines whether the player can even cause this mutation
     */
    get unlocked(): boolean {
        // Check for unlocked original berry
        if (this.originalBerry && !App.game.farming.berries[this.originalBerry].unlocked()) {
            return false;
        }
        return super.unlocked;
    }

}
