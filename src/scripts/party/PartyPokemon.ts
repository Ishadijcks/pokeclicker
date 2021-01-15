class PartyPokemon implements Saveable {
    saveKey: string;

    defaults = {
        evolved: false,
        rareCandiesUsed: 0,
        hpUpsUsed: 0,
        proteinsUsed: 0,
        ironsUsed: 0,
        calciumsUsed: 0,
        zincsUsed: 0,
        carbosUsed: 0,
        exp: 0,
        breeding: false,
        shiny: false,
        category: 0,
        timesHatched: 0,
    };

    _breeding: KnockoutObservable<boolean>;
    _shiny: KnockoutObservable<boolean>;
    _level: KnockoutObservable<number>;
    _damage: KnockoutObservable<number>;
    _hitpoints: number;
    _attack: number;
    _defense: number;
    _specialAttack: number;
    _specialDefense: number;
    _speed: number;
    _category: KnockoutObservable<number>;
    rareCandiesUsed: KnockoutObservable<number>;
    hpUpsUsed: KnockoutObservable<number>;
    proteinsUsed: KnockoutObservable<number>;
    ironsUsed: KnockoutObservable<number>;
    calciumsUsed: KnockoutObservable<number>;
    zincsUsed: KnockoutObservable<number>;
    carbosUsed: KnockoutObservable<number>;
    public exp = 0;
    public timesHatched = ko.observable(0);

    constructor(
        public id: number,
        public name: PokemonNameType,
        public evolutions: Evolution[],
        public baseAttack: number,
        hp: number,
        atk: number,
        def: number,
        spAtk: number,
        spDef: number,
        speed: number,
        breeding = false,
        shiny = false,
        public eggCycles: number
    ) {
        this._hitpoints = hp;
        this._attack = atk;
        this._defense = def;
        this._specialAttack = spAtk;
        this._specialDefense = spDef;
        this._speed = speed;
        this.rareCandiesUsed = ko.observable(0);
        this.hpUpsUsed = ko.observable(0);
        this.proteinsUsed = ko.observable(0);
        this.ironsUsed = ko.observable(0);
        this.calciumsUsed = ko.observable(0);
        this.zincsUsed = ko.observable(0);
        this.carbosUsed = ko.observable(0);
        this._breeding = ko.observable(breeding);
        this._shiny = ko.observable(shiny);
        this._level = ko.observable(1);
        this._damage = ko.observable(this.calculateAttack());
        this._category = ko.observable(0);
    }

    public calculateAttack(): number {
        const levelMultiplier: number = this.level / 100;
        const attackBonus: number = this.calculateBonusAttack() * this.timesHatched();
        return Math.max(1, Math.floor(((this.baseAttack + attackBonus) * levelMultiplier)));
    }

    public calculateBonusAttack(): number {
        const hp: number = calcStatBonus(this._hitpoints, this.hpUpsUsed());
        const atk: number = calcStatBonus(this._attack, this.proteinsUsed());
        const def: number = calcStatBonus(this._defense, this.ironsUsed());
        const spAtk: number = calcStatBonus(this._specialAttack, this.calciumsUsed());
        const spDef: number = calcStatBonus(this._specialDefense, this.zincsUsed());
        const speed: number = calcStatBonus(this._speed, this.carbosUsed());

        return (calculateBaseAttack(hp, atk, def, spAtk, spDef, speed) + this.rareCandiesUsed()) * calcEggstepsBonus(this.eggCycles);
    }

    public calculateBreedingEfficiency(): number {
        return this.calculateBonusAttack() / this.eggCycles;
    }

    calculateLevelFromExp(): number {
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
        if (this.breeding || this.evolutions == null || this.evolutions.length == 0) {
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

    getVitaminsUsedByType(type: GameConstants.VitaminType) {
        let vitaminsUsed: KnockoutObservable<number> | undefined;
        switch (type) {
            case GameConstants.VitaminType.RareCandy:
                vitaminsUsed = this.rareCandiesUsed;
                break;
            case GameConstants.VitaminType.HpUp:
                vitaminsUsed = this.hpUpsUsed;
                break;
            case GameConstants.VitaminType.Protein:
                vitaminsUsed = this.proteinsUsed;
                break;
            case GameConstants.VitaminType.Iron:
                vitaminsUsed = this.ironsUsed;
                break;
            case GameConstants.VitaminType.Calcium:
                vitaminsUsed = this.calciumsUsed;
                break;
            case GameConstants.VitaminType.Zinc:
                vitaminsUsed = this.zincsUsed;
                break;
            case GameConstants.VitaminType.Carbos:
                vitaminsUsed = this.carbosUsed;
                break;
            default:
                break;
        }
        return vitaminsUsed;
    }

    public vitaminsUsed(type: GameConstants.VitaminType): number {
        const vu = this.getVitaminsUsedByType(type);
        return vu === undefined ? 0 : vu();
    }

    public useVitamin(type: GameConstants.VitaminType, amount = 1) {
        const vitaminsUsed = this.getVitaminsUsedByType(type);
        if (vitaminsUsed === undefined) {
            return;
        }

        const usesRemaining = vitaminUsesRemaining(vitaminsUsed());

        if (!usesRemaining) {
            Notifier.notify({
                message: 'This Pokémon cannot increase their power any higher!',
                type: NotificationConstants.NotificationOption.warning,
            });
            return;
        }

        // The lowest number of amount they want to use, total in inventory, uses remaining for this Pokemon
        amount = Math.min(amount, player.itemList[getVitaminNameByType(type)](), usesRemaining);
        if (ItemHandler.useItem(getVitaminNameByType(type), amount)) {
            GameHelper.incrementObservable(vitaminsUsed, amount);
        }
    }

    public useProtein(amount: number): void {
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

        this.rareCandiesUsed = ko.observable(json['rareCandiesUsed'] ?? this.defaults.rareCandiesUsed);
        this.hpUpsUsed = ko.observable(json['hpUpsUsed'] ?? this.defaults.hpUpsUsed);
        this.proteinsUsed = ko.observable(json['proteinsUsed'] ?? this.defaults.proteinsUsed);
        this.ironsUsed = ko.observable(json['ironsUsed'] ?? this.defaults.ironsUsed);
        this.calciumsUsed = ko.observable(json['calciumsUsed'] ?? this.defaults.calciumsUsed);
        this.zincsUsed = ko.observable(json['zincsUsed'] ?? this.defaults.zincsUsed);
        this.carbosUsed = ko.observable(json['carbosUsed'] ?? this.defaults.carbosUsed);
        this.exp = json['exp'] ?? this.defaults.exp;
        this.breeding = json['breeding'] ?? this.defaults.breeding;
        this.shiny = json['shiny'] ?? this.defaults.shiny;
        this.category = json['category'] ?? this.defaults.category;
        this.timesHatched = ko.observable(json['timesHatched'] ?? this.defaults.timesHatched);
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
            rareCandiesUsed: this.rareCandiesUsed(),
            hpUpsUsed: this.hpUpsUsed(),
            proteinsUsed: this.proteinsUsed(),
            ironsUsed: this.ironsUsed(),
            calciumsUsed: this.calciumsUsed(),
            zincsUsed: this.zincsUsed(),
            carbosUsed: this.carbosUsed(),
            exp: this.exp,
            breeding: this.breeding,
            shiny: this.shiny,
            levelEvolutionTriggered: levelEvolutionTriggered,
            category: this.category,
            timesHatched: this.timesHatched(),
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
        return this._damage();
    }

    set attack(attack: number) {
        this._damage(attack);
    }

    get breeding(): boolean {
        return this._breeding();
    }

    set breeding(bool: boolean) {
        this._breeding(bool);
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

function calcEggstepsBonus(eggCycles: number): number {
    return Math.max(0.25, Math.sqrt(eggCycles / 25));
}

function calcStatBonus(baseStat: number, buffsUsed: number): number {
    return baseStat * ((GameConstants.BREEDING_ATTACK_BONUS + buffsUsed) / 100);
}

function vitaminUsesRemaining(vitaminsUsed: number): number {
    // Allow 5 for every region visited (including Kanto)
    return (player.highestRegion() + 1) * 5 - vitaminsUsed;
}
