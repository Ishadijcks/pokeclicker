/// <reference path="./GrowMutation.ts" />

/**
 * Mutation to produce the Enigma Berry
 */
class EnigmaMutation extends GrowMutation {

    hintsSeen: KnockoutObservable<boolean>[];

    constructor(mutationChance: number) {
        super(mutationChance, BerryType.Enigma, {
            unlockReq: function(): boolean {
                if (App.game.discord.ID === null) {
                    return false;
                }
                return EnigmaMutation.getReqs().every(req => App.game.farming.berries[req].unlocked());
            },
        });

        this.hintsSeen = Array<boolean>(4).fill(false).map(val => ko.observable(val));
    }

    /**
     * Determines which plots can mutate
     * @return The plot indices that can mutate
     */
    getMutationPlots(): number[] {
        const plots = super.getMutationPlots();

        const reqs = EnigmaMutation.getReqs();

        return plots.filter((idx) => {
            const nearPlots = Plot.findPlusPlots(idx);
            if (nearPlots.length !== 4) {
                return false;
            }
            return nearPlots.every((idx, n) => {
                const plot = App.game.farming.plotList[idx];
                if (!plot.isUnlocked) {
                    return false;
                }
                if (plot.isEmpty()) {
                    return false;
                }
                if (plot.stage() !== PlotStage.Berry) {
                    return false;
                }
                if (plot.berry !== reqs[n]) {
                    return false;
                }
                return true;
            });
        });
    }

    /**
     * Returns a list of 4 Berry types to cause the mutation
     */
    static getReqs(): BerryType[] {
        SeededRand.seed(+App.game.discord.ID());
        // Getting possible Berries
        // Only Gen 3 and 4 Berries so there isn't as big of a growth discrepancy (e.g. Cheri and Haban)
        let berryTypes = Farming.getGeneration(2).concat(Farming.getGeneration(3));
        // Remove parasite Berries, as having four sides for mutation requirements means parasite
        // mutations can make it difficult to have all four plants fully grown.
        // Also remove Babiri since they'll stop mutations
        berryTypes = berryTypes.filter(berry => {
            return ![BerryType.Occa, BerryType.Kebia, BerryType.Colbur, BerryType.Babiri].includes(berry);
        });
        return [...new Array(4)].map((_) => SeededRand.fromArray(berryTypes));
    }

    get hintIndex(): number {
        SeededRand.seedWithDate(new Date());
        return Math.floor(SeededRand.next() * 4);
    }

    /**
     * Handles getting the hint for this mutation for the Kanto Berry Master
     */
    get partialHint(): string {
        if (App.game.discord.ID === null) {
            return 'There is a Berry that requires a linked <u>Discord</u> account to appear...';
        }
        const idx = this.hintIndex;
        return `There's a mysterious berry that requires ${this.getHint(idx)}.`;
    }

    private getHint(idx: number) {
        let direction = '';
        switch (idx) {
            case 0:
                direction = 'north';
                break;
            case 1:
                direction = 'west';
                break;
            case 2:
                direction = 'east';
                break;
            case 3:
                direction = 'south';
        }

        return `a ${BerryType[EnigmaMutation.getReqs()[idx]]} Berry to the ${direction}`;
    }

    /**
     * Handles getting the full hint for the BerryDex
     */
    get hint(): string {
        if (App.game.discord.ID === null) {
            return 'There is a Berry that requires a linked <u>Discord</u> account to appear...';
        }

        const hints = [];
        this.hintsSeen.forEach((hintSeen, idx) => {
            if (!hintSeen()) {
                return false;
            }
            hints.push(this.getHint(idx));
        });

        let tempHint = `There's a mysterious berry that requires ${hints.join(', ').replace(/, ([\w\s]+)$/, ' and $1')}`;

        if (hints.length === 0) {
            tempHint += 'a specific configuration of Berries';
        }

        tempHint += (hints.length !== 4) ? '. However there\'s still something missing...' : '.';

        return tempHint;
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['hintsSeen'] = this.hintsSeen.map(ko.unwrap);
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);

        const hintsSeen = json['hintsSeen'];
        if (hintsSeen == null) {
            this.hintsSeen = Array<boolean>(4).fill(false).map((v) => ko.observable<boolean>(v));
        } else {
            (hintsSeen as boolean[]).forEach((value: boolean, index: number) => {
                this.hintsSeen[index](value);
            });
        }
    }

}
