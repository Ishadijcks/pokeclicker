class CustomQuest extends Quest implements QuestInterface {
    initialValue?: number;
    customReward?: () => void;

    constructor(amount: number, reward: (() => void) | number, description: string, focus: any, initialValue?: number, onLoad?: (() => void)) {
        const qpReward = typeof reward == 'number' ? reward : 0;
        super(amount, qpReward);
        this.customDescription = description;
        this.focus = focus;
        this.initialValue = initialValue;
        this.customReward = typeof reward == 'function' ? reward : undefined;
        this._onLoad = typeof onLoad == 'function' ? onLoad : undefined;
    }

    begin() {
        this.onLoad();
        if (this.initialValue !== undefined) {
            this.initial(this.initialValue);
        } else {
            super.begin();
        }
    }

    claim(): boolean {
        if (this.customReward !== undefined) {
            this.customReward();
        }
        return super.claim();
    }
}
