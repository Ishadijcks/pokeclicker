// class ProfOakNPC extends NPC {

//     constructor(
//         public name: string,
//         public dialog: string[]
//     ) {
//         super(name, dialog, { image: 'assets/images/oak.png' });
//     }

//     get dialogHTML(): string {
//         const uniquePokemonCaught = new Set(App.game.party.caughtPokemon.filter(p => p.id > 0).map(p => Math.floor(p.id))).size;

//         if (uniquePokemonCaught >= GameConstants.TotalPokemonsPerRegion[GameConstants.Region.unova]) {
//             return `<p>Let me see your progress...Ah, fantastic, as usual!</p>
//                     <p>Allow me some time to arrange tickets for your next destination.</p>`;
//         }

//         if (uniquePokemonCaught >= GameConstants.TotalPokemonsPerRegion[GameConstants.Region.sinnoh]) {
//             return `<p>Congratulations, you're more than half-way completed on the national Pokédex!</p>
//                     <p>Next stop is Unova! I've always wanted to visit Castelia City personally...</p>`;
//         }

//         if (uniquePokemonCaught >= GameConstants.TotalPokemonsPerRegion[GameConstants.Region.hoenn]) {
//             return `<p>That's another regional Pokédex completed! Fantastic.</p>
//                     <p>I really appreciate being able to see your outstanding progress, thank you!</p>`;
//         }

//         if (uniquePokemonCaught >= GameConstants.TotalPokemonsPerRegion[GameConstants.Region.johto]) {
//             return `<p>Oh, another regional Pokédex completed so soon?</p>
//                     <p>Amazing! Next stop is Hoenn, enjoy the sunshine while you're there!</p>`;
//         }

//         if (uniquePokemonCaught >= GameConstants.TotalPokemonsPerRegion[GameConstants.Region.kanto]) {
//             return `<p>Congratulations on completing your Kanto Pokédex!</p>
//                     <p>Your journey isn't over yet, a whole world awaits you! Onwards to Johto!</p>`;
//         }

//         if (App.game.badgeCase.badgeCount() >= 13) {
//             return `<p>Hello, new Champion, you've come a long way!</p>
//                     <p>If you complete your Pokédex I can arrange for you to travel to Johto!</p>`;
//         }

//         //Else, it does the default message.
//         return super.dialogHTML;
//     }
// }
