/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="Pokeball.ts" />

class Pokeballs implements Feature {
    name = 'Pokeballs';
    saveKey = 'pokeballs';

    defaults = {
        alreadyCaughtSelection: GameConstants.Pokeball.None,
        alreadyCaughtShinySelection: GameConstants.Pokeball.Pokeball,
        notCaughtSelection: GameConstants.Pokeball.Pokeball,
        notCaughtShinySelection: GameConstants.Pokeball.Pokeball,
    };

    public pokeballs: Pokeball[];
    private _alreadyCaughtSelection: KnockoutObservable<GameConstants.Pokeball>;
    private _alreadyCaughtShinySelection: KnockoutObservable<GameConstants.Pokeball>;
    private _notCaughtSelection: KnockoutObservable<GameConstants.Pokeball>;
    private _notCaughtShinySelection: KnockoutObservable<GameConstants.Pokeball>;

    public selectedSelection: KnockoutObservable<KnockoutObservable<GameConstants.Pokeball>>;
    public selectedTitle: KnockoutObservable<string>;

    constructor() {
        this._alreadyCaughtSelection = ko.observable(this.defaults.alreadyCaughtSelection);
        this._alreadyCaughtShinySelection = ko.observable(this.defaults.alreadyCaughtShinySelection);
        this._notCaughtSelection = ko.observable(this.defaults.notCaughtSelection);
        this._notCaughtShinySelection = ko.observable(this.defaults.notCaughtShinySelection);
        this.selectedTitle = ko.observable('');
        this.selectedSelection = ko.observable(this._alreadyCaughtSelection);
    }

    initialize(): void {
        // Storing Pokeballs for easy access
        this.pokeballs = [];
        Object.values(ItemList).filter(Pokeball.isPokeball).forEach(ball => {
            this.pokeballs[ball.type] = ball;
        });

        ([
            this._alreadyCaughtSelection,
            this._alreadyCaughtShinySelection,
            this._notCaughtSelection,
            this._notCaughtShinySelection,
        ]).forEach(selection => {
            selection.subscribe(value => {
                // switch to Ultraball if Masterball is selected
                if (value == GameConstants.Pokeball.Masterball && App.game.challenges.list.disableMasterballs.active()) {
                    selection(GameConstants.Pokeball.Ultraball);
                    Notifier.notify({
                        title: 'Challenge Mode',
                        message: 'Masterballs are disabled!',
                        type: NotificationConstants.NotificationOption.danger,
                    });
                } else if (!this.pokeballs[value]?.unlocked()) {
                    selection(GameConstants.Pokeball.None);
                }
            });
        });
    }

    /**
     * Checks the players preferences to see what pokéball needs to be used on the next throw.
     * Checks from the players pref to the most basic ball to see if the player has any.
     * @param id the pokemon we are trying to catch.
     * @param isShiny if the pokémon is shiny.
     * @returns {GameConstants.Pokeball} pokéball to use.
     */
    public calculatePokeballToUse(id: number, isShiny: boolean): GameConstants.Pokeball {
        const alreadyCaught = App.game.party.alreadyCaughtPokemon(id);
        const alreadyCaughtShiny = App.game.party.alreadyCaughtPokemon(id, true);
        let pref: GameConstants.Pokeball;
        // just check against alreadyCaughtShiny as this returns false when you don't have the pokemon yet.
        if (isShiny) {
            if (!alreadyCaughtShiny) {
                // if the pokemon is also not caught, use the higher selection since a notCaughtShiny is also a notCaught pokemon
                pref = !alreadyCaught ? Math.max(this.notCaughtSelection, this.notCaughtShinySelection) : this.notCaughtShinySelection;
            } else {
                // if the shiny is already caught, use the higher selection since the pokemon is also a caught pokemon
                pref = Math.max(this.alreadyCaughtSelection, this.alreadyCaughtShinySelection);
            }
        } else {
            if (!alreadyCaught) {
                pref = this.notCaughtSelection;
            } else {
                pref = this.alreadyCaughtSelection;
            }
        }

        let use: GameConstants.Pokeball = GameConstants.Pokeball.None;

        if (this.pokeballs[pref]?.amount()) {
            return pref;
        } else if (pref <= GameConstants.Pokeball.Masterball) {
            // Check which Pokeballs we have in stock that are of equal or lesser than selection (upto Masterball)
            for (let i: number = pref; i >= 0; i--) {
                if (this.pokeballs[i].amount() > 0) {
                    use = i;
                    break;
                }
            }
            return use;
        } else {
            // Use a normal Pokeball or None if we don't have Pokeballs in stock
            return this.pokeballs[GameConstants.Pokeball.Pokeball].amount() ? GameConstants.Pokeball.Pokeball : GameConstants.Pokeball.None;
        }
    }

    calculateCatchTime(ball: GameConstants.Pokeball): number {
        return this.pokeballs[ball].catchTime;
    }

    usePokeball(ball: GameConstants.Pokeball): void {
        this.pokeballs[ball].gain(-1);
        GameHelper.incrementObservable(App.game.statistics.pokeballsUsed[ball]);
    }

    getCatchBonus(ball: GameConstants.Pokeball): number {
        return this.pokeballs[ball].catchBonus();
    }

    getBallQuantity(ball: GameConstants.Pokeball): number {
        const pokeball = this.pokeballs[ball];
        return pokeball ? pokeball.amount() : 0;
    }

    canAccess(): boolean {
        return true;
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        this.notCaughtSelection = json['notCaughtSelection'] ?? this.defaults.notCaughtSelection;
        this.notCaughtShinySelection = json['notCaughtShinySelection'] ?? this.defaults.notCaughtShinySelection;
        this.alreadyCaughtSelection = json['alreadyCaughtSelection'] ?? this.defaults.alreadyCaughtSelection;
        this.alreadyCaughtShinySelection = json['alreadyCaughtShinySelection'] ?? this.defaults.alreadyCaughtShinySelection;
    }

    toJSON(): Record<string, any> {
        return {
            'notCaughtSelection': this.notCaughtSelection,
            'notCaughtShinySelection': this.notCaughtShinySelection,
            'alreadyCaughtSelection': this.alreadyCaughtSelection,
            'alreadyCaughtShinySelection': this.alreadyCaughtShinySelection,
        };
    }

    update(delta: number): void {
        // This method intentionally left blank
    }

    // Knockout getters/setters
    get notCaughtSelection() {
        return this._notCaughtSelection();
    }

    set notCaughtSelection(ball: GameConstants.Pokeball) {
        this._notCaughtSelection(ball);
    }

    get notCaughtShinySelection() {
        return this._notCaughtShinySelection();
    }

    set notCaughtShinySelection(ball: GameConstants.Pokeball) {
        this._notCaughtShinySelection(ball);
    }

    get alreadyCaughtSelection() {
        return this._alreadyCaughtSelection();
    }

    set alreadyCaughtSelection(ball: GameConstants.Pokeball) {
        this._alreadyCaughtSelection(ball);
    }

    get alreadyCaughtShinySelection() {
        return this._alreadyCaughtShinySelection();
    }

    set alreadyCaughtShinySelection(ball: GameConstants.Pokeball) {
        this._alreadyCaughtShinySelection(ball);
    }
}
