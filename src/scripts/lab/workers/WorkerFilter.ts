class WorkerFilter {

    public filter: (pokemon: PartyPokemon) => boolean;
    private _description?: string;

    constructor(filter: (pokemon: PartyPokemon) => boolean, description: string) {
        this.filter = filter;
        this._description = description;
    }

    get description(): string {
        return this._description || '';
    }

}
