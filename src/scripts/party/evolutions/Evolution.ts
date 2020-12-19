abstract class Evolution {
    basePokemon: string;
    type: EvolutionType[];

    constructor(basePokemon: string) {
        this.basePokemon = basePokemon;
        this.type = [];
    }

    isSatisfied(): boolean {
        // Check that evolution is within reached regions
        return PokemonHelper.calcNativeRegion(this.getEvolvedPokemon() as PokemonNameType) <= player.highestRegion();
    }

    abstract getEvolvedPokemon(): string

    evolve(notification = false): boolean {
        const evolvedPokemon = this.getEvolvedPokemon() as PokemonNameType;

        // This Pokemon is from a region we haven't reached yet
        if (PokemonHelper.calcNativeRegion(evolvedPokemon) > player.highestRegion()) {
            return false;
        }

        // Notify the player if they haven't already caught the evolution, or notifications are forced
        if (!App.game.party.alreadyCaughtPokemonByName(evolvedPokemon) || notification) {
            Notifier.notify({
                message: `Your ${this.basePokemon} evolved into a ${evolvedPokemon}`,
                type: NotificationConstants.NotificationOption.success,
            });
        }

        const shiny = PokemonFactory.generateShiny(GameConstants.SHINY_CHANCE_STONE);
        App.game.party.gainPokemonById(PokemonHelper.getPokemonByName(evolvedPokemon).id, shiny, true);
        return shiny;
    }

}

type MinimalEvo = ConstructorImplementing<Evolution, 'getEvolvedPokemon'>

function restrictEvoWith(restrictionTest: () => boolean, type: EvolutionType = null) {
    return function<T extends MinimalEvo>(Base: T): T {
        return class extends Base {
            constructor(...args: any[]) {
                super(...args);
                if (type !== null) {
                    this.type.push(type);
                }
            }

            isSatisfied(): boolean {
                return restrictionTest() && super.isSatisfied();
            }
        };
    };
}
