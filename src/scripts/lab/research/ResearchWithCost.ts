interface ItemCost {
    item: BagItem,
    amount: number,
}

class ResearchWithCost extends Research {

    private _costs: ItemCost[];

    private _purchased: KnockoutObservable<boolean>;

    constructor(id: Lab.Research, type: ResearchType, name: string, description: string, points: number, costs: ItemCost[], option?: ResearchOption) {
        super(id, type, name, description, points, option);
        this._costs = costs;

        this._purchased = ko.observable(false);

        this.state = ko.pureComputed(function () {
            if (!this.canResearch()) {
                return ResearchState.Locked;
            } else if (!this._purchased()) {
                return ResearchState.NotPurchased;
            } else if (this._completed()) {
                return ResearchState.Completed;
            } else if (!this._inProgress()) {
                return ResearchState.Ready;
            } else if (this._inProgress()) {
                return ResearchState.Researching;
            }
            return ResearchState.Locked;
        }, this);
    }


    purchase(): boolean {
        if (!this.canPurchase) {
            return false;
        }
        this._costs.forEach(itemCost => {
            BagHandler.gainItem(itemCost.item, -itemCost.amount);
        });
        this.purchased = true;
        return true;
    }

    get canPurchase(): boolean {
        return this._costs.every(itemCost => {
            return BagHandler.amount(itemCost.item)() >= itemCost.amount;
        });
    }

    /**
     * Returns the tooltip to be displayed for the unlock button.
     * Displays all the items required for unlocking the research
     */
    get costTooltip(): string {
        return this._costs.map(itemCost => {
            return `${BagHandler.displayName(itemCost.item)}: ${itemCost.amount}`;
        }).join('<br>');
    }

    toJSON(): Record<string, any> {
        const json = super.toJSON();
        json['purchased'] = this.purchased;
        return json;
    }
    fromJSON(json: Record<string, any>): void {
        super.fromJSON(json);
        this.purchased = json['purchased'] ?? false;
    }

    get purchased(): boolean {
        return this._purchased();
    }
    set purchased(bool: boolean) {
        this._purchased(bool);
    }

}
