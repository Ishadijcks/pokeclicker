class ResearchHandler {

    public static researchList: Lab.Research[] = [];
    public static researchTypes: KnockoutObservableArray<string> = ko.observableArray([]);
    public static navigateIndex: KnockoutObservable<number> = ko.observable(0);
    public static researchListFiltered: KnockoutObservableArray<Lab.Research> = ko.observableArray([]);
    public static numberOfTabs: KnockoutObservable<number> = ko.observable(0);

    public static initialize() {
        this.resetPages();
        Object.keys(this.filter).forEach(e => (<KnockoutObservable<any>> this.filter[e]).subscribe(() => this.filterResearchList()));
    }

    public static navigateRight() {
        if (ResearchHandler.navigateIndex() < ResearchHandler.numberOfTabs()) {
            ResearchHandler.navigateIndex(ResearchHandler.navigateIndex() + 1);
        }
    }

    public static navigateLeft() {
        if (ResearchHandler.navigateIndex() > 0) {
            ResearchHandler.navigateIndex(ResearchHandler.navigateIndex() - 1);
        }
    }

    public static isNavigateDirectionDisabled(navigateBackward: boolean): boolean {
        return navigateBackward
            ? this.navigateIndex() === 0
            : this.navigateIndex() + 1 === this.numberOfTabs();
    }

    public static calculateNumberOfTabs() {
        this.numberOfTabs(Math.max(1, Math.ceil(this.researchListFiltered().length / 10)));
    }

    public static filter = {
        status: ko.observable('all'),
        type:   ko.observable('all'),
    }

    public static getResearchListWithIndex() {
        return this.researchListFiltered().slice(this.navigateIndex() * 10, (this.navigateIndex() * 10) + 10).map(res => App.game.lab.researchList.find(research => research.id === res));
    }

    public static filterResearchList(retainPage = false) {
        this.researchListFiltered(this.researchList.filter((res) => {
            const research = App.game.lab.researchList.find(research => research.id === res);
            if (this.filter.status() != 'all') {
                switch (this.filter.status()) {
                    case 'locked':
                        if (research.state() !== ResearchState.NotPurchased) {
                            return false;
                        }
                        break;
                    case 'incomplete':
                        if (research.state() !== ResearchState.Ready && research.state() !== ResearchState.Researching) {
                            return false;
                        }
                        break;
                    case 'completed':
                        if (research.state() !== ResearchState.Completed) {
                            return false;
                        }
                        break;
                    default:
                        return false;
                }
            } else if (research.state() === ResearchState.Locked) {
                return false;
            }
            if (this.filter.type() != 'all' && !research.type.includes(ResearchType[this.filter.type()])) {
                return false;
            }
            return true;
        }));
        if (!retainPage) {
            this.resetPages();
        } else if (this.getResearchListWithIndex().length === 0 && this.navigateIndex() > 0) {
            this.calculateNumberOfTabs();
            this.navigateIndex(this.numberOfTabs()  - 1);
        }
    }

    public static resetPages() {
        this.calculateNumberOfTabs();
        this.navigateIndex(0);
    }

    //#region Research List Element Handling

    public static getTableClass(research: Research) {
        switch (research.state()) {
            case ResearchState.Locked:
            case ResearchState.NotPurchased:
                return 'table-dark';
            case ResearchState.Completed:
                return 'table-success';
            default:
                return 'table-danger';
        }
    }

    public static getButtonStatus(research: Research) {
        switch (research.state()) {
            case ResearchState.Locked:
            case ResearchState.Researching:
            case ResearchState.Completed:
                return false;
            case ResearchState.NotPurchased:
                if (research instanceof ResearchWithCost) {
                    return research.canPurchase;
                }
                return false;
            case ResearchState.Ready:
                return App.game.lab.currentResearch().length < App.game.lab.unlockedResearchSlots();
            default:
                return false;
        }
    }

    public static getButtonClass(research: Research) {
        switch (research.state()) {
            case ResearchState.Locked:
                return 'btn-dark';
            case ResearchState.Researching:
                return 'btn-success';
            case ResearchState.Completed:
                return 'btn-success';
            case ResearchState.NotPurchased:
                return 'btn-danger';
            case ResearchState.Ready:
                return 'btn-primary';
            default:
                return '';
        }
    }

    public static getButtonText(research: Research) {
        switch (research.state()) {
            case ResearchState.Locked:
                return 'Locked';
            case ResearchState.Researching:
                return 'Researching';
            case ResearchState.Completed:
                return 'Completed';
            case ResearchState.NotPurchased:
                return 'Unlock';
            case ResearchState.Ready:
                return 'Start Research';
            default:
                return '';
        }
    }

    public static getButtonTooltip(research: Research) {
        if (research.state() === ResearchState.Locked) {
            return research.hint;
        } else if (research instanceof ResearchWithCost && research.state() === ResearchState.NotPurchased) {
            return research.costTooltip;
        }
        return '';
    }

    public static handleClick(research: Research) {
        if (!ResearchHandler.getButtonStatus(research)) {
            return;
        }
        if (research instanceof ResearchWithCost && research.state() === ResearchState.NotPurchased) {
            research.purchase();
        } else if (research.state() === ResearchState.Ready) {
            App.game.lab.beginResearch(research);
        }
        this.filterResearchList(true);

        // Checking closing modal
        if (App.game.lab.currentResearch().length === App.game.lab.unlockedResearchSlots()) {
            $('#researchListModal').modal('hide');
        }
    }

    //#endregion
}
