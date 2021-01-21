///<reference path="./MulchType.ts"/>
class FarmController {

    public static navigateIndex: KnockoutObservable<number> = ko.observable(0);
    public static berryListFiltered: KnockoutObservableArray<BerryType> = ko.observableArray([]);
    public static numberOfTabs: KnockoutComputed<number>;

    public static berryListEnd: KnockoutComputed<number>;

    public static selectedBerry: KnockoutObservable<BerryType> = ko.observable(BerryType.Cheri);
    public static selectedMulch: KnockoutObservable<MulchType> = ko.observable(MulchType.Boost_Mulch);
    public static selectedShovel: KnockoutObservable<boolean> = ko.observable(false);

    public static berryListVisible: KnockoutObservable<boolean> = ko.observable(true);

    public static multipliers = ['×1', '×10', '×100', '×1000', 'All'];
    public static multIndex: KnockoutObservable<number> = ko.observable(0);

    static readonly BERRIES_PER_PAGE = 8;

    public static initialize() {
        this.berryListFiltered(Array.from(Array(GameHelper.enumLength(BerryType) - 1).keys()));

        this.numberOfTabs = ko.pureComputed(() => {
            return Math.floor(App.game.farming.highestUnlockedBerry() / this.BERRIES_PER_PAGE);
        });

        this.berryListEnd = ko.pureComputed(() => {
            const highestMutation = App.game.farming.mutations.slice().reverse().find(mut => mut._hintSeen() && !App.game.farming.unlockedBerries[mut.mutatedBerry]());
            const highestMutationHint = highestMutation?.mutatedBerry ?? 0;
            return Math.max(App.game.farming.highestUnlockedBerry(), highestMutationHint);
        });

        this.navigateIndex(0);
    }

    public static openFarmModal() {
        if (App.game.farming.canAccess()) {
            $('#farmModal').modal('show');
        } else {
            Notifier.notify({
                message: 'You need the Wailmer Pail to access this location',
                type: NotificationConstants.NotificationOption.warning,
            });
        }
    }

    public static getImage(index: number) {
        const plot: Plot = App.game.farming.plotList[index];
        if (plot.berry === BerryType.None) {
            return '';
        }
        if (plot.stage() === PlotStage.Seed) {
            return 'assets/images/farm/AllTreeSeed.png';
        } else if (plot.stage() === PlotStage.Sprout) {
            return 'assets/images/farm/AllTreeSprout.png';
        }
        return `assets/images/farm/${BerryType[plot.berry]}Tree${PlotStage[plot.stage()]}.png`;
    }

    public static calculateCssClass() {
        if (this.selectedShovel()) {
            return 'ShovelSelected';
        }
        if (this.berryListVisible()) {
            return 'BerrySelected';
        }
        return 'MulchSelected';
    }

    public static calcMulchClass(plot: Plot) {
        if (plot.mulch === MulchType.None) {
            return '';
        }
        return MulchType[plot.mulch];
    }

    public static plotClick(index: number) {
        const plot: Plot = App.game.farming.plotList[index];
        // Unlocking Plot
        if (!plot.isUnlocked) {
            App.game.farming.unlockPlot(index);
        // Handle Shovel
        } else if (this.selectedShovel()) {
            App.game.farming.shovel(index);
        // Handle Berries
        } else if (this.berryListVisible()) {
            if (plot.isEmpty()) {
                App.game.farming.plant(index, this.selectedBerry());
            } else {
                App.game.farming.harvest(index);
            }
        // Handle Mulches
        } else {
            App.game.farming.addMulch(index, this.selectedMulch(), this.getAmount());
        }
    }

    public static mulchAll() {
        App.game.farming.mulchAll(FarmController.selectedMulch(), this.getAmount());
    }

    public static navigateRight() {
        if (FarmController.navigateIndex() < FarmController.numberOfTabs()) {
            FarmController.navigateIndex(FarmController.navigateIndex() + 1);
            this.selectedBerry(this.getBerryListWithIndex()[0]);
        }
    }

    public static navigateLeft() {
        if (FarmController.navigateIndex() > 0) {
            FarmController.navigateIndex(FarmController.navigateIndex() - 1);
            this.selectedBerry(this.getBerryListWithIndex()[0]);
        }
    }

    public static getBerryListWithIndex() {
        return this.berryListFiltered().slice(this.navigateIndex() * this.BERRIES_PER_PAGE, (this.navigateIndex() * this.BERRIES_PER_PAGE) + this.BERRIES_PER_PAGE);
    }

    public static getUnlockedBerryList() {
        return this.berryListFiltered().filter((berry) => berry <= this.berryListEnd());
    }

    private static getAmount() {
        return Number(this.multipliers[this.multIndex()].replace(/\D/g, '')) || Infinity;
    }

    public static incrementMultiplier() {
        this.multIndex((this.multIndex() + 1) % this.multipliers.length);
    }

    public static decrementMultiplier() {
        this.multIndex((this.multIndex() + this.multipliers.length - 1) % this.multipliers.length);
    }

    public static getBackgroundColor(index: number) {
        if (App.game.farming.unlockedBerries[index]()) {
            return GameConstants.BerryColor[App.game.farming.berryData[index].color];
        } else if (FarmController.getHint(index, true) !== '') {
            return GameConstants.BerryColor[6];
        } else {
            return GameConstants.BerryColor[7];
        }

    }

    public static getBerryImage(index: number) {
        return `assets/images/items/${BerryType[index]}.png`;
    }

    public static getHint(index: number, checkSeen = false, checkUnlocked = false) {
        if (checkUnlocked && App.game.farming.unlockedBerries[index]()) {
            return '';
        }
        const mutation = App.game.farming.mutations.find(mutation => mutation.mutatedBerry === index && mutation.showHint);
        if (mutation) {
            if (checkSeen && !mutation.hintSeen) {
                return '';
            }
            return mutation.hint;
        }
        return '';
    }

    public static additionalInfoTooltip: KnockoutComputed<string> = ko.pureComputed(() => {
        const tooltip = [];

        // External Auras
        App.game.farming.externalAuras.forEach((aura, idx) => {
            if (typeof aura === 'undefined') {
                return;
            }
            if (aura() === 1) {
                return;
            }
            tooltip.push(`${AuraType[idx]}: ${aura().toFixed(2)}x`);
        });

        // Adding header if necessary
        if (tooltip.length) {
            tooltip.unshift('<u>External Auras</u>');
        }

        return tooltip.join('<br>');
    });

}

