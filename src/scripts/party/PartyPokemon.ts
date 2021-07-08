class PartyPokemon implements Saveable {
    saveKey: string;

    defaults = {
        evolved: false,
        attackBonusPercent: 0,
        attackBonusAmount: 0,
        proteinsUsed: 0,
        exp: 0,
        location: PartyLocation.Battle,
        shiny: false,
        category: 0,
    };

    _location: KnockoutObservable<PartyLocation>;
    _shiny: KnockoutObservable<boolean>;
    _level: KnockoutObservable<number>;
    _attack: KnockoutObservable<number>;
    _category: KnockoutObservable<number>;
    proteinsUsed: KnockoutObservable<number>;

    constructor(
        public id: number,
        public name: PokemonNameType,
        public evolutions: Evolution[],
        public baseAttack: number,
        public attackBonusPercent: number = 0,
        public attackBonusAmount: number = 0,
        proteinsUsed,
        public exp: number = 0,
        location = PartyLocation.Battle,
        shiny = false,
        category = 0
    ) {
        this.proteinsUsed = ko.observable(proteinsUsed);
        this._location = ko.observable(location);
        this._shiny = ko.observable(shiny);
        this._level = ko.observable(1);
        this._attack = ko.observable(this.calculateAttack());
        this._category = ko.observable(category);
    }

    public calculateAttack(): number {
        const attackBonusMultiplier = 1 + (this.attackBonusPercent / 100);
        const levelMultiplier = this.level / 100;
        return Math.max(1, Math.floor((this.baseAttack * attackBonusMultiplier + this.attackBonusAmount) * levelMultiplier));
    }

    calculateLevelFromExp() {
        const levelType = PokemonHelper.getPokemonByName(this.name).levelType;
        for (let i = this.level - 1; i < levelRequirements[levelType].length; i++) {
            if (levelRequirements[levelType][i] > this.exp) {
                return i;
            }
        }
        return this.level;
    }

    public gainExp(exp: number) {
        this.exp += exp;
        const oldLevel = this.level;
        const newLevel = this.calculateLevelFromExp();
        if (oldLevel !== newLevel) {
            this.level = newLevel;
            this.attack = this.calculateAttack();
            this.checkForLevelEvolution();
        }
    }

    public checkForLevelEvolution() {
        if (this.location !== PartyLocation.Battle || this.evolutions == null || this.evolutions.length == 0) {
            return;
        }

        for (const evolution of this.evolutions) {
            if (evolution instanceof LevelEvolution && evolution.isSatisfied()) {
                evolution.evolve();
            }
        }
    }

    public useStone(stoneType: GameConstants.StoneType): boolean {
        const possibleEvolutions = [];
        for (const evolution of this.evolutions) {
            if (evolution instanceof StoneEvolution && evolution.stone == stoneType && evolution.isSatisfied()) {
                possibleEvolutions.push(evolution);
            }
        }
        if (possibleEvolutions.length !== 0) {
            return GameConstants.randomElement(possibleEvolutions).evolve();
        }
        return false;
    }

    public useProtein(amount: number): void {
        if (App.game.challenges.list.disableProteins.active()) {
            Notifier.notify({
                title: 'Challenge Mode',
                message: 'Proteins are disabled',
                type: NotificationConstants.NotificationOption.danger,
            });
            return;
        }

        const usesRemaining = this.proteinUsesRemaining();

        // If no more proteins can be used on this Pokemon
        if (!usesRemaining) {
            Notifier.notify({
                message: 'This Pokémon cannot increase their power any higher!',
                type: NotificationConstants.NotificationOption.warning,
            });
            return;
        }

        // The lowest number of amount they want to use, total in inventory, uses remaining for this Pokemon
        amount = Math.min(amount, player.itemList.Protein(), usesRemaining);

        // Apply the proteins
        if (ItemHandler.useItem('Protein', amount)) {
            GameHelper.incrementObservable(this.proteinsUsed, amount);
        }
    }

    proteinUsesRemaining = (): number => {
        // Allow 5 for every region visited (including Kanto)
        return (player.highestRegion() + 1) * 5 - this.proteinsUsed();
    };

    public fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        if (json['id'] == null) {
            return;
        }

        this.attackBonusPercent = json['attackBonusPercent'] ?? this.defaults.attackBonusPercent;
        this.attackBonusAmount = json['attackBonusAmount'] ?? this.defaults.attackBonusAmount;
        this.proteinsUsed = ko.observable(json['proteinsUsed'] ?? this.defaults.proteinsUsed);
        this.exp = json['exp'] ?? this.defaults.exp;
        this.location = json['location'] ?? this.defaults.location;
        this.shiny = json['shiny'] ?? this.defaults.shiny;
        this.category = json['category'] ?? this.defaults.category;
        this.level = this.calculateLevelFromExp();
        this.attack = this.calculateAttack();

        if (this.evolutions != null) {
            for (const evolution of this.evolutions) {
                if (evolution instanceof LevelEvolution) {
                    evolution.triggered = json['levelEvolutionTriggered'];
                }
            }
        }

    }

    public toJSON() {
        let levelEvolutionTriggered = false;
        if (this.evolutions != null) {
            for (const evolution of this.evolutions) {
                if (evolution instanceof LevelEvolution && evolution.triggered) {
                    levelEvolutionTriggered = true;
                }
            }
        }
        return {
            id: this.id,
            attackBonusPercent: this.attackBonusPercent,
            attackBonusAmount: this.attackBonusAmount,
            proteinsUsed: this.proteinsUsed(),
            exp: this.exp,
            location: this.location,
            shiny: this.shiny,
            levelEvolutionTriggered: levelEvolutionTriggered,
            category: this.category,
        };
    }

    // Knockout getters/setter
    get level(): number {
        return this._level();
    }

    set level(level: number) {
        this._level(level);
    }

    get attack(): number {
        return this._attack();
    }

    set attack(attack: number) {
        this._attack(attack);
    }

    get location(): PartyLocation {
        return this._location();
    }

    set location(value: PartyLocation) {
        this._location(value);
    }

    get shiny(): boolean {
        return this._shiny();
    }

    set shiny(bool: boolean) {
        this._shiny(bool);
    }

    get category(): number {
        return this._category();
    }

    set category(index: number) {
        this._category(index);
    }
}
