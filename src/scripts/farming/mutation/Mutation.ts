abstract class Mutation {

    mutationChance: number;
    mutatedBerry: BerryType;
    hint?: string;
    unlockReq?: (() => boolean);

    constructor(mutationChance: number, mutatedBerry: BerryType, hint?: string, unlockReq?: (() => boolean)) {
        this.mutationChance = mutationChance;
        this.mutatedBerry = mutatedBerry;
        this.hint = hint;
        this.unlockReq = unlockReq;
    }

    /**
     * Determines whether this mutation can occur based on the status of the farm plots. Returns plot indices that fit requirements
     */
    abstract checkRequirements(): number[];

    /**
     * Handles updating the farm with the mutation
     * @param index The plot index to mutate
     */
    abstract handleMutation(index: number): void;

    /**
     * Determines whether the player can even cause this mutation
     */
    checkUnlockReq(): boolean {
        if (!this.unlockReq) {
            console.error('Could not find unlock requirement for mutation:', this);
            return false;
        }
        return this.unlockReq();
    }

    /**
     * Handles getting the hint for this mutation for the Kanto Berry Master
     */
    getHint(): string {
        if (!this.hint) {
            console.error('Could not find hint for mutation:', this);
        }
        return this.hint ?? '';
    }

    /**
     * Checks an individual plot for a MutationRequirement
     */
    checkRequirement(index: number, mutationRequirement: MutationReqInterface) {
        const plot = App.game.farming.plotList[index];
        if (!plot.isUnlocked) {
            return false;
        }
        if (plot.berry !== mutationRequirement.berryType) {
            return false;
        }
        if (mutationRequirement.berryStage !== PlotStage.Seed && plot.stage() !== mutationRequirement.berryStage) {
            return false;
        }
        return true;
    }

    /**
     * Update tag for mutations. Returns true if this mutation will occur
     */
    mutate(): boolean {
        if (!this.checkUnlockReq()) {
            return false;
        }

        const plots = this.checkRequirements();
        if (!plots.length) {
            return false;
        }

        let mutated = false;

        plots.forEach(function(plot) {
            const willMutate =  Math.random() < this.mutationChance * App.game.farming.getMutationMultiplier();
            if (!willMutate) {
                return;
            }
            this.handleMutation(plot);
            App.game.oakItems.use(OakItems.OakItem.Squirtbottle);
            mutated = true;
        }, this);

        return mutated;
    }

    /**
     * Finds the plot indices that are around the plot in a 3x3 square
     * @param index The plot index
     * @param filter An optional filter callback for filtering out indices
     */
    findNearPlots(index: number, filter?: (n: number) => boolean): number[] {
        const plots = [];

        const colIdx = index % 5;
        const rowIdx = (index - colIdx) / 5;

        for (let r = rowIdx - 1;r <= rowIdx + 1;r++) {
            for (let c = colIdx - 1;c <= colIdx + 1;c++) {
                if (r < 0 || r > 4 || c < 0 || c > 4) {
                    continue;
                }
                const idx = c * 5 + r;
                if (filter && !filter(idx)) {
                    continue;
                }
                plots.push(idx);
            }
        }

        return plots;
    }


}