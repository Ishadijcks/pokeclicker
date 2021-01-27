///<reference path="./NPC.ts"/>

class KantoBerryMasterNPC extends NPC {

    constructor(
        public name: string,
        public dialog: string[],
        public image?: string
    ) {
        super(name,dialog,image);
    }

    get dialogHTML(): string {
        // Before the player has unlocked the farm
        if (!App.game.farming.canAccess()) {
            return super.dialogHTML;
        }

        // After the farm is unlocked
        return `<p>${KantoBerryMasterNPC.generateMessage(new Date())}</p>`;
    }

    public static generateMessage(date: Date): string {
        if (App.game.farming.berries.every(berry => berry.unlocked())) {
            return 'The disciple has surpassed the master. I have nothing more to teach you.';
        }

        const possibleMutations = App.game.farming.mutations.filter((mut) => mut.unlocked && mut.showHint && !App.game.farming.berries[mut.mutatedBerry].unlocked());

        if (possibleMutations.length === 0) {
            return 'It seems as though you have hit a roadblock in your Berry progress. Focus on other areas before returning..';
        }

        SeededRand.seedWithDate(date);
        possibleMutations.forEach(b => SeededRand.boolean());
        const mutationToShow = SeededRand.fromArray(possibleMutations);
        mutationToShow.hintSeen = true;

        if (mutationToShow instanceof EnigmaMutation) {
            if (App.game.discord.ID !== null) {
                mutationToShow.hintsSeen[mutationToShow.hintIndex](true);
            }
            return mutationToShow.partialHint;
        }

        return mutationToShow.hint;
    }

}
