///<reference path="pokemons/PokemonFactory.ts"/>

/**
 * Handles all logic related to battling
 */
class Battle {
    static enemyPokemon: KnockoutObservable<BattlePokemon> = ko.observable(null);

    static counter = 0;
    static catching: KnockoutObservable<boolean> = ko.observable(false);
    static catchRateActual: KnockoutObservable<number> = ko.observable(null);
    static pokeball: KnockoutObservable<GameConstants.Pokeball>;

    /**
     * Probably not needed right now, but might be if we add more logic to a gameTick.
     */
    public static tick() {
        this.counter = 0;
        this.pokemonAttack();
    }

    /**
     * Attacks with Pokémon and checks if the enemy is defeated.
     */
    public static pokemonAttack() {
        if (!this.enemyPokemon().isAlive()) {
            return;
        }
        this.enemyPokemon().damage(player.calculatePokemonAttack(this.enemyPokemon().type1, this.enemyPokemon().type2));
        if (!this.enemyPokemon().isAlive()) {
            this.defeatPokemon();
        }
    }

    /**
     * Attacks with clicks and checks if the enemy is defeated.
     */
    public static clickAttack() {
        if (!this.enemyPokemon().isAlive()) {
            return;
        }
        App.game.oakItems.use(OakItems.OakItem.Poison_Barb);
        GameHelper.incrementObservable(player.statistics.clicks)
        this.enemyPokemon().damage(player.calculateClickAttack());
        if (!this.enemyPokemon().isAlive()) {
            this.defeatPokemon();
        }
    }

    /**
     * Award the player with money and exp, and throw a Pokéball if applicable
     */
    public static defeatPokemon() {
        GameHelper.incrementObservable(player.statistics.pokemonDefeated);
        App.game.wallet.gainMoney(this.enemyPokemon().money);
        player.gainExp(this.enemyPokemon().exp, this.enemyPokemon().level, false);
        player.gainShards(this.enemyPokemon());
        player.addRouteKill();
        App.game.breeding.progressEggs(Math.floor(Math.sqrt(player.route()) * 100) / 100);
        const pokemonName: string = this.enemyPokemon().name;
        const isShiny: boolean = this.enemyPokemon().shiny;
        const pokeBall: GameConstants.Pokeball = App.game.pokeballs.calculatePokeballToUse(pokemonName, isShiny);

        if (pokeBall !== GameConstants.Pokeball.None) {
            this.prepareCatch(pokeBall);
            setTimeout(
                () => {
                    this.attemptCatch();
                    this.generateNewEnemy();
                },
                App.game.pokeballs.calculateCatchTime(pokeBall)
            )
            ;

        } else {
            this.generateNewEnemy();
        }
        this.gainItem();
        player.lowerItemMultipliers();
        player.defeatedAmount[this.enemyPokemon().id](player.defeatedAmount[this.enemyPokemon().id]() + 1);
    }

    /**
     * Generate a new enemy based on the current route and region.
     * Reset the counter.
     */
    public static generateNewEnemy() {
        Battle.counter = 0;
        Battle.enemyPokemon(PokemonFactory.generateWildPokemon(player.route(), player.region));
    }

    protected static calculateActualCatchRate(pokeBall: GameConstants.Pokeball) {
        const pokeballBonus = App.game.pokeballs.getCatchBonus(pokeBall);
        const oakBonus = App.game.oakItems.calculateBonus(OakItems.OakItem.Magic_Ball);
        const totalChance = GameConstants.clipNumber(this.enemyPokemon().catchRate + pokeballBonus + oakBonus, 0, 100);
        return totalChance;
    }

    protected static prepareCatch(pokeBall: GameConstants.Pokeball) {
        this.pokeball = ko.observable(pokeBall);
        this.catching(true);
        this.catchRateActual(this.calculateActualCatchRate(pokeBall));
        App.game.pokeballs.usePokeball(pokeBall);
    }

    protected static attemptCatch() {
        const random: number = Math.floor(Math.random() * 100);
        if (random <= this.catchRateActual()) {
            this.catchPokemon();
        }
        this.catching(false);
        this.catchRateActual(null);
    }

    public static catchPokemon() {
        App.game.wallet.gainDungeonTokens(6 * Math.pow(this.enemyPokemon().level / 3, 1.05));
        player.capturePokemon(this.enemyPokemon().name, this.enemyPokemon().shiny);
    }

    static gainItem() {
        const p = player.route() / 1600 + 0.009375;

        if (Math.random() < p) {
            player.getRandomBerry()
        }
    }

}
