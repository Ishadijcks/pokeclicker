/// <reference path="../../declarations/GameHelper.d.ts" />

class DamageCalculator {
    static type1 = ko.observable(PokemonType.None);
    static type2 = ko.observable(PokemonType.None);
    static region = ko.observable(GameConstants.Region.none);
    static includeNonBattle = ko.observable(false);
    static baseAttackOnly = ko.observable(false);
    static detailType = ko.observable(PokemonType.None);

    static observableTypeDamageArray = ko.pureComputed(DamageCalculator.getDamageByTypes, DamageCalculator);
    static observableTypeDetails = ko.pureComputed(DamageCalculator.getTypeDetail);
    static observableTotalDamage = ko.pureComputed(DamageCalculator.totalDamage);

    static totalDamage(): number {
        const ignoreRegionMultiplier = DamageCalculator.region() == GameConstants.Region.none;

        return App.game.party.calculatePokemonAttack(
            DamageCalculator.type1(),
            DamageCalculator.type2(),
            ignoreRegionMultiplier,
            DamageCalculator.region(),
            DamageCalculator.includeNonBattle(),
            DamageCalculator.baseAttackOnly(),
            false
        );
    }

    static getDamageByTypes(): number[] {
        const typedamage = new Array(GameHelper.enumLength(PokemonType) - 1).fill(0);
        const ignoreRegionMultiplier = this.region() == GameConstants.Region.none;

        for (const pokemon of App.game.party.caughtPokemon) {
            const dataPokemon = PokemonHelper.getPokemonByName(pokemon.name);
            if (dataPokemon.type1 === PokemonType.None) {
                continue;
            }

            const attack = App.game.party.calculateOnePokemonAttack(pokemon, this.type1(), this.type2(), this.region(), ignoreRegionMultiplier, this.includeNonBattle(), this.baseAttackOnly());

            typedamage[dataPokemon.type1] += attack / 2;
            const otherType = dataPokemon.type2 !== PokemonType.None ? dataPokemon.type2 : dataPokemon.type1;
            typedamage[otherType] += attack / 2;
        }

        return typedamage;
    }

    static getTypeDetail(): TypeDetail[] {
        return App.game.party.caughtPokemon.filter(pokemon => {
            const dataPokemon = PokemonHelper.getPokemonByName(pokemon.name);
            return dataPokemon.type1 == DamageCalculator.detailType() || dataPokemon.type2 == DamageCalculator.detailType();
        }).reduce((details, pokemon) => {
            details.push(DamageCalculator.getOneTypeDetail(pokemon));
            return details;
        }, []).sort((a, b) => b.damage - a.damage);
    }

    static getOneTypeDetail(pokemon: PartyPokemon): TypeDetail {
        const ignoreRegionMultiplier = DamageCalculator.region() == GameConstants.Region.none;
        const dataPokemon = PokemonHelper.getPokemonByName(pokemon.name);
        return {
            id: dataPokemon.id,
            name: dataPokemon.name,
            type1: dataPokemon.type1,
            type2: dataPokemon.type2,
            damage: App.game.party.calculateOnePokemonAttack(
                pokemon,
                DamageCalculator.type1(),
                DamageCalculator.type2(),
                DamageCalculator.region(),
                ignoreRegionMultiplier,
                DamageCalculator.includeNonBattle(),
                DamageCalculator.baseAttackOnly()
            ),
        };
    }
}

type TypeDetail = {
  id: number,
  name: string,
  type1: PokemonType,
  type2: PokemonType,
  damage: number
}
