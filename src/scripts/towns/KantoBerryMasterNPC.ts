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
        if (App.game.farming.unlockedBerries.every(berry => berry())) {
            return 'The disciple has surpassed the master. I have nothing more to teach you.';
        }

        SeededRand.seedWithDate(date);
        const possibleMutations = App.game.farming.mutations.filter((mut) => mut.unlocked && mut.showHint && !App.game.farming.unlockedBerries[mut.mutatedBerry]());

        if (possibleMutations.length === 0) {
            return 'It seems as though you have hit a roadblock in your Berry progress. Focus on other areas before returning..';
        }

        return SeededRand.fromArray(possibleMutations).hint;
    }

}
