

class TypeBoosterResearch extends ResearchWithCost {

    private _pokemonType: PokemonType;

    constructor(id: Lab.Research, pokemonType: PokemonType, points: number, option?: ResearchOption) {
        option = option ?? {};
        option.workerFilter = option.workerFilter ?? new TypeFilter([pokemonType]);
        option.requirements = []; // TODO: HLXII - Setup requirement for Typed BF stages
        super(id, ResearchType.Type_Booster, `Type Booster - ${PokemonType[pokemonType]}`, undefined, points, [{item: {type: ItemType.shard, id: pokemonType}, amount: 5000}], option);
        this._pokemonType = pokemonType;
    }

    get description(): string {
        return `Unlocks the ${PokemonType[this._pokemonType]} Type Booster Machine`;
    }

}
