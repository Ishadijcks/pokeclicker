class DataPokemon implements PokemonInterface {
    shiny: boolean;

    constructor(
        public id: number,
        public name: PokemonNameType,
        public catchRate: number,
        public evolutions: Evolution[],
        public type1: PokemonType,
        public type2: PokemonType,
        public attack: number,
        public base: {
          hitpoints: number;
          attack: number;
          specialAttack: number;
          defense: number;
          specialDefense: number;
          speed: number;
        },
        public levelType: LevelType,
        public exp: number,
        public eggCycles: number,
        public heldItem: BagItem | null
    ) {
        this.shiny = false;
    }

}
