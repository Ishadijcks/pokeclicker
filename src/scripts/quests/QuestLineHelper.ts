/**
 * Static class used to handle Quest Lines
 */
class QuestLineHelper {

    public static createTutorial() {
        const tutorial = new QuestLine('Tutorial Quests', 'A short set of quests to get you going');

        //Defeat Starter
        const defeatStarter = new CapturePokemonsQuest(1, 10);
        //Capture pokemon because start sequence resets route 1 kills to 0, making this quest think it is incomplete
        defeatStarter.customDescription = 'Defeat the Pokémon. Click to deal damage';
        tutorial.addQuest(defeatStarter);

        //Capture 1 pokemon
        const captureOne = new CapturePokemonsQuest(1, 20);
        captureOne.customDescription = 'Capture 1 Pokémon. When you defeat a Pokémon, a Pokéball is thrown and you have a chance to capture it.';
        tutorial.addQuest(captureOne);

        //Kill 5 on route 2
        const routeTwo = new DefeatPokemonsQuest(10, 20, 2, GameConstants.Region.kanto);
        routeTwo.customDescription = 'Defeat 10 Pokémon on route 2. Click route 2 on the map to move there and begin fighting.';
        tutorial.addQuest(routeTwo);

        //Buy pokeballs
        const buyPokeballs = new BuyPokeballsQuest(10, 50, GameConstants.Pokeball.Pokeball);
        buyPokeballs.customDescription = 'Buy 10 Pokéballs. You can find these in the Viridian City Shop.';
        tutorial.addQuest(buyPokeballs);

        //Buy Dungeon ticket
        const buyDungeonTicket = new CustomQuest(1, 50, 'Buy the Dungeon ticket from Viridian City Shop.', () => +App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Dungeon_ticket), 0);
        tutorial.addQuest(buyDungeonTicket);

        //Clear Viridian Forest
        const clearMtMoon = new DefeatDungeonQuest(1, 50, 'Viridian Forest');
        clearMtMoon.customDescription = 'Gather 50 Dungeon tokens by (re)capturing Pokémon, then clear the Viridian Forest dungeon.';
        tutorial.addQuest(clearMtMoon);

        //Defeat Pewter Gym
        const pewterReward = () => {
            Notifier.notify({ message: 'Tutorial completed!', type: NotificationConstants.NotificationOption.success });
            Information.show({
                steps: [
                    {
                        element: document.getElementById('questDisplayContainer'),
                        intro: 'Click "List" to see the current quests that can be completed for <img title="Quest points" src="assets/images/currency/questPoint.svg" height="25px"> Quest Points.',
                    },
                ],
            });
        };
        const pewter = new CustomQuest(1, pewterReward, 'Defeat Pewter City Gym. Click the town on the map to move there, then click the Gym button to start the battle.', () => App.game.statistics.gymsDefeated[GameConstants.getGymIndex('Pewter City')](), 0);
        tutorial.addQuest(pewter);

        App.game.quests.questLines().push(tutorial);
    }

    public static createDeoxysQuestLine() {
        const deoxysQuestLine = new QuestLine('Mystery of Deoxys', 'Discover the mystery of Deoxys');

        // Defeat 50 Pokemon on route 129
        const route129 = new DefeatPokemonsQuest(50, 0, 129, GameConstants.Region.hoenn);
        deoxysQuestLine.addQuest(route129);

        // Defeat 500 Psychic type Pokemon
        const psychicShardReward = () => {
            App.game.shards.gainShards(500, PokemonType.Psychic);
            Notifier.notify({
                title: deoxysQuestLine.name,
                message: 'You have gained 500 Psychic shards',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const defeatPsychic = new CustomQuest(500, psychicShardReward, 'Defeat 500 Psychic type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Psychic)).map(p => App.game.statistics.pokemonDefeated[p.id]()).reduce((a,b) => a + b, 0);
        });
        deoxysQuestLine.addQuest(defeatPsychic);

        // Capture 200 Psychic type Pokemon
        const mindPlateReward = () => {
            const mindPlate = UndergroundItem.list.find(item => item.name == 'Mind Plate');
            if (!mindPlate) {
                return console.error('Unable to find item Mind Plate');
            }
            Underground.gainMineItem(mindPlate.id, 20);
            Notifier.notify({
                title: deoxysQuestLine.name,
                message: 'You have gained 20 ${mindPlate.name}s',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchPsychic = new CustomQuest(200, mindPlateReward, 'Capture 200 Psychic type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Psychic)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        deoxysQuestLine.addQuest(catchPsychic);

        // Reach stage 100 in battle frontier
        const reachStage100Reward = () => {
            Notifier.notify({
                title: deoxysQuestLine.name,
                message: 'Quest line completed!<br/><i>You have uncovered the Mystery of Deoxys</i>',
                type: NotificationConstants.NotificationOption.success,
                timeout: 3e4,
            });
        };
        const reachStage100 = new CustomQuest(100, reachStage100Reward, 'Defeat stage 100 in the Battle Frontier', App.game.statistics.battleFrontierHighestStageCompleted, 0);
        deoxysQuestLine.addQuest(reachStage100);

        App.game.quests.questLines().push(deoxysQuestLine);
    }

    public static createUndergroundQuestLine() {
        const undergroundQuestLine = new QuestLine('Mining Expedition', 'Explore the underground');

        //Buy Explorer Kit (no reward)
        const buyExplorerKit = new CustomQuest(1, () => {}, 'Buy the Explorer Kit from Cinnabar Island Shop', () => +App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Explorer_kit), 0);
        undergroundQuestLine.addQuest(buyExplorerKit);

        // Mine 5 layers in the Unerground
        const OldAmberReward = () => {
            // Gain an Old Amber
            const oldAmber = UndergroundItem.list.find(item => item.name == 'Old Amber');
            if (!oldAmber) {
                return console.error('Unable to find item Old Amber');
            }
            Underground.gainMineItem(oldAmber.id);
            Notifier.notify({
                title: undergroundQuestLine.name,
                message: 'You have gained an Old Amber fossil!<br/><i>You can breed this in the hatchery.</i>',
                type: NotificationConstants.NotificationOption.success,
                timeout: GameConstants.MINUTE,
            });
        };
        const mineLayers = new CustomQuest(5, OldAmberReward, 'Mine 5 layers in the Underground', App.game.statistics.undergroundLayersMined);
        undergroundQuestLine.addQuest(mineLayers);

        App.game.quests.questLines().push(undergroundQuestLine);
    }
    public static createVivillonQuestLine() {
        const VivillonQuestLine = new QuestLine('The great hunt', 'Discover the beauty of Vivillon');


        // Capture 100 Water type Pokemon
        const ViviMarineAdd = () => {
            dungeonList['Lake Verity'].bossList.push(new DungeonBossPokemon('Vivillon (Marine)', 93659450, 80));
            dungeonList['Lake Valor'].bossList.push(new DungeonBossPokemon('Vivillon (Marine)', 93659450, 80));
            dungeonList['Lake Acuity'].bossList.push(new DungeonBossPokemon('Vivillon (Marine)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It has been spotted at some Lake',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchWater = new CustomQuest(100, undefined, 'Capture 100 Water type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Water)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchWater);
        // Capture Vivillon (Marine)
        const ViviMarineRemove = () => {
            dungeonList['Lake Verity'].bossList = dungeonList['Lake Verity'].bossList.filter(boss => boss.name != 'Vivillon (Marine)');
            dungeonList['Lake Valor'].bossList = dungeonList['Lake Valor'].bossList.filter(boss => boss.name != 'Vivillon (Marine)');
            dungeonList['Lake Acuity'].bossList = dungeonList['Lake Acuity'].bossList.filter(boss => boss.name != 'Vivillon (Marine)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchMarine = new CustomQuest(
            1,
            ViviMarineRemove,
            'Find and capture the rare Vivillon! Hint: It has been spotted at some Lake.',
            App.game.statistics.pokemonCaptured[666.09],
            undefined,
            ViviMarineAdd
        );
        VivillonQuestLine.addQuest(catchMarine);
        // Capture 100 Psychic type Pokemon
        const ViviModernAdd = () => {
            dungeonList['Cerulean Cave'].bossList.push(new DungeonBossPokemon('Vivillon (Modern)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s surrounded by strong Pokémon.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchPsychic2 = new CustomQuest(100, ViviModernAdd, 'Capture 100 Psychic type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Psychic)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchPsychic2);
        // Capture Vivillon (Modern)
        const ViviModernRemove = () => {
            dungeonList['Cerulean Cave'].bossList = dungeonList['Cerulean Cave'].bossList.filter(boss => boss.name != 'Vivillon (Modern)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchModern = new CustomQuest(
            1,
            ViviModernRemove,
            'Find and capture the rare Vivillon! Hint: It\'s surrounded by strong Pokémon.',
            App.game.statistics.pokemonCaptured[666.08]
        );
        VivillonQuestLine.addQuest(catchModern);
        // Capture 100 Poison type Pokemon
        const ViviJungleAdd = () => {
            dungeonList['Moor of Icirrus'].bossList.push(new DungeonBossPokemon('Vivillon (Jungle)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It has been spotted in a swamp.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchPoison = new CustomQuest(100, ViviJungleAdd, 'Capture 100 Poison type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Poison)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchPoison);
        // Capture Vivillon (Jungle)
        const ViviJungleRemove = () => {
            dungeonList['Moor of Icirrus'].bossList = dungeonList['Moor of Icirrus'].bossList.filter(boss => boss.name != 'Vivillon (Jungle)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchJungle = new CustomQuest(
            1,
            ViviJungleRemove,
            'Find and capture the rare Vivillon! Hint: It has been spotted in a swamp.',
            App.game.statistics.pokemonCaptured[666.18]
        );
        VivillonQuestLine.addQuest(catchJungle);
        // Capture 100 Dark type Pokemon
        const ViviMonsoonAdd = () => {
            dungeonList['Dark Cave'].bossList.push(new DungeonBossPokemon('Vivillon (Monsoon)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s hiding at a dark place.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchDark = new CustomQuest(100, ViviMonsoonAdd, 'Capture 100 Dark type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Dark)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchDark);
        // Capture Vivillon (Monsoon)
        const ViviMonsoonRemove = () => {
            dungeonList['Dark Cave'].bossList = dungeonList['Dark Cave'].bossList.filter(boss => boss.name != 'Vivillon (Monsoon)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchMonsoon = new CustomQuest(
            1,
            ViviMonsoonRemove,
            'Find and capture the rare Vivillon! Hint: It\'s hiding at a dark place.',
            App.game.statistics.pokemonCaptured[666.14]
        );
        VivillonQuestLine.addQuest(catchMonsoon);
        // Capture 100 Steel type Pokemon
        const ViviTundraAdd = () => {
            dungeonList['Pokéball Factory'].bossList.push(new DungeonBossPokemon('Vivillon (Tundra)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It flew into a factory.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchSteel = new CustomQuest(100, ViviTundraAdd, 'Capture 100 Steel type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Steel)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchSteel);
        // Capture Vivillon (Tundra)
        const ViviTundraRemove = () => {
            dungeonList['Pokéball Factory'].bossList = dungeonList['Pokéball Factory'].bossList.filter(boss => boss.name != 'Vivillon (Tundra)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchTundra = new CustomQuest(
            1,
            ViviTundraRemove,
            'Find and capture the rare Vivillon! Hint: It flew into a factory.',
            App.game.statistics.pokemonCaptured[666.03]
        );
        VivillonQuestLine.addQuest(catchTundra);
        // Capture 100 Fire type Pokemon
        const ViviSunAdd = () => {
            dungeonList['Mt. Chimney'].bossList.push(new DungeonBossPokemon('Vivillon (Sun)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It seems to like hot places.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchFire = new CustomQuest(100, ViviSunAdd, 'Capture 100 Fire type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Fire)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchFire);
        // Capture Vivillon (Sun)
        const ViviSunRemove = () => {
            dungeonList['Mt. Chimney'].bossList = dungeonList['Mt. Chimney'].bossList.filter(boss => boss.name != 'Vivillon (Sun)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchSun = new CustomQuest(
            1,
            ViviSunRemove,
            'Find and capture the rare Vivillon! Hint: It seems to like hot places.',
            App.game.statistics.pokemonCaptured[666.16]
        );
        VivillonQuestLine.addQuest(catchSun);
        // Capture 100 Fighting type Pokemon
        const ViviArchAdd = () => {
            dungeonList['Sprout Tower'].bossList.push(new DungeonBossPokemon('Vivillon (Archipelago)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s sitting on a swaying pillar.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchFighting = new CustomQuest(100, ViviArchAdd, 'Capture 100 Fighting type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Fighting)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchFighting);
        // Capture Vivillon (Archipelago)
        const ViviArchRemove = () => {
            dungeonList['Sprout Tower'].bossList = dungeonList['Sprout Tower'].bossList.filter(boss => boss.name != 'Vivillon (Archipelago)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchArch = new CustomQuest(
            1,
            ViviArchRemove,
            'Find and capture the rare Vivillon! Hint: It\'s sitting on a swaying pillar.',
            App.game.statistics.pokemonCaptured[666.10]
        );
        VivillonQuestLine.addQuest(catchArch);
        // Capture 100 Ghost type Pokemon
        const ViviElegantAdd = () => {
            dungeonList['Lost Hotel'].bossList.push(new DungeonBossPokemon('Vivillon (Elegant)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s visiting an abandoned and spooky place.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchGhost = new CustomQuest(100, ViviElegantAdd, 'Capture 100 Ghost type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Ghost)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchGhost);
        // Capture Vivillon (Elegant)
        const ViviElegantRemove = () => {
            dungeonList['Lost Hotel'].bossList = dungeonList['Lost Hotel'].bossList.filter(boss => boss.name != 'Vivillon (Elegant)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchElegant = new CustomQuest(
            1,
            ViviElegantRemove,
            'Find and capture the rare Vivillon! Hint: It\'s visiting an abandoned and spooky place.',
            App.game.statistics.pokemonCaptured[666.06]
        );
        VivillonQuestLine.addQuest(catchElegant);
        // Capture 100 Fairy type Pokemon
        const ViviOceanAdd = () => {
            dungeonList['Dreamyard'].bossList.push(new DungeonBossPokemon('Vivillon (Ocean)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s flying around an overgrown place full of dreams.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchFairy = new CustomQuest(100, ViviOceanAdd, 'Capture 100 Fairy type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Fairy)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchFairy);
        // Capture Vivillon (Ocean)
        const ViviOceanRemove = () => {
            dungeonList['Dreamyard'].bossList = dungeonList['Dreamyard'].bossList.filter(boss => boss.name != 'Vivillon (Ocean)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchOcean = new CustomQuest(
            1,
            ViviOceanRemove,
            'Find and capture the rare Vivillon! Hint: It\'s flying around an overgrown place full of dreams.',
            App.game.statistics.pokemonCaptured[666.17]
        );
        VivillonQuestLine.addQuest(catchOcean);
        // Capture 100 Electric type Pokemon
        const ViviContiAdd = () => {
            dungeonList['New Mauville'].bossList.push(new DungeonBossPokemon('Vivillon (Continental)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\s currently in a City full of Electric type Pokémon.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchElectric = new CustomQuest(100, ViviContiAdd, 'Capture 100 Electric type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Electric)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchElectric);
        // Capture Vivillon (Continental)
        const ViviContiRemove = () => {
            dungeonList['New Mauville'].bossList = dungeonList['New Mauville'].bossList.filter(boss => boss.name != 'Vivillon (Continental)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchConti = new CustomQuest(
            1,
            ViviContiRemove,
            'Find and capture the rare Vivillon! Hint: It\s currently in a City full of Electric type Pokémon.',
            App.game.statistics.pokemonCaptured[666.04]
        );
        VivillonQuestLine.addQuest(catchConti);
        // Capture 100 Bug type Pokemon
        const ViviRiverAdd = () => {
            dungeonList['Eterna Forest'].bossList.push(new DungeonBossPokemon('Vivillon (River)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It hides in a dark Forest.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchBug = new CustomQuest(100, ViviRiverAdd, 'Capture 100 Bug type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Bug)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchBug);
        // Capture Vivillon (River)
        const ViviRiverRemove = () => {
            dungeonList['Eterna Forest'].bossList = dungeonList['Eterna Forest'].bossList.filter(boss => boss.name != 'Vivillon (River)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchRiver = new CustomQuest(
            1,
            ViviRiverRemove,
            'Find and capture the rare Vivillon! Hint: It hides in a dark Forest.',
            App.game.statistics.pokemonCaptured[666.13]
        );
        VivillonQuestLine.addQuest(catchRiver);
        // Capture 100 Flying type Pokemon
        const ViviPolarAdd = () => {
            dungeonList['Sky Pillar'].bossList.push(new DungeonBossPokemon('Vivillon (Polar)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s high up in the sky.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchFly = new CustomQuest(100, ViviPolarAdd, 'Capture 100 Flying type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Flying)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchFly);
        // Capture Vivillon (Polar)
        const ViviPolarRemove = () => {
            dungeonList['Sky Pillar'].bossList = dungeonList['Sky Pillar'].bossList.filter(boss => boss.name != 'Vivillon (Polar)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchPolar = new CustomQuest(
            1,
            ViviPolarRemove,
            'Find and capture the rare Vivillon! Hint: It\'s high up in the sky..',
            App.game.statistics.pokemonCaptured[666.02]
        );
        VivillonQuestLine.addQuest(catchPolar);
        // Capture 100 Ground type Pokemon
        const ViviSandstormAdd = () => {
            dungeonList['Relic Castle'].bossList.push(new DungeonBossPokemon('Vivillon (Sandstorm)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It got lost in the desert sand.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchGround = new CustomQuest(100, ViviSandstormAdd, 'Capture 100 Ground type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Ground)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchGround);
        // Capture Vivillon (Sandstorm)
        const ViviSandstormRemove = () => {
            dungeonList['Relic Castle'].bossList = dungeonList['Relic Castle'].bossList.filter(boss => boss.name != 'Vivillon (Sandstorm)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchSandstorm = new CustomQuest(
            1,
            ViviSandstormRemove,
            'Find and capture the rare Vivillon! Hint: It got lost in the desert sand.',
            App.game.statistics.pokemonCaptured[666.12]
        );
        VivillonQuestLine.addQuest(catchSandstorm);
        // Capture 100 Grass type Pokemon
        const ViviGardenAdd = () => {
            dungeonList['Flower Paradise'].bossList.push(new DungeonBossPokemon('Vivillon (Garden)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It only shows up amongst the most beautiful flowers.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchGrass = new CustomQuest(100, ViviGardenAdd, 'Capture 100 Grass type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Grass)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchGrass);
        // Capture Vivillon (Garden)
        const ViviGardenRemove = () => {
            dungeonList['Flower Paradise'].bossList = dungeonList['Flower Paradise'].bossList.filter(boss => boss.name != 'Vivillon (Garden)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchGarden = new CustomQuest(
            1,
            ViviGardenRemove,
            'Find and capture the rare Vivillon! Hint: It only shows up amongst the most beautiful flowers.',
            App.game.statistics.pokemonCaptured[666.05]
        );
        VivillonQuestLine.addQuest(catchGarden);
        // Capture 100 Rock type Pokemon
        const ViviPlainsAdd = () => {
            dungeonList['Mt. Moon'].bossList.push(new DungeonBossPokemon('Vivillon (High Plains)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It has been spotted dancing in the moonlight.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchRock = new CustomQuest(100, ViviPlainsAdd, 'Capture 100 Rock type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Rock)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchRock);
        // Capture Vivillon (High Plains)
        const ViviPlainsRemove = () => {
            dungeonList['Mt. Moon'].bossList = dungeonList['Mt. Moon'].bossList.filter(boss => boss.name != 'Vivillon (High Plains)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchPlains = new CustomQuest(
            1,
            ViviPlainsRemove,
            'Find and capture the rare Vivillon! Hint: It has been spotted dancing in the moonlight.',
            App.game.statistics.pokemonCaptured[666.11]
        );
        VivillonQuestLine.addQuest(catchPlains);
        // Capture 100 Dragon type Pokemon
        const ViviSavannaAdd = () => {
            dungeonList['Dragonspiral Tower'].bossList.push(new DungeonBossPokemon('Vivillon (Savanna)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It\'s surrounded by dragons.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchDragon = new CustomQuest(100, ViviSavannaAdd, 'Capture 100 Dragon type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Dragon)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchDragon);
        // Capture Vivillon (Savanna)
        const ViviSavannaRemove = () => {
            dungeonList['Dragonspiral Tower'].bossList = dungeonList['Dragonspiral Tower'].bossList.filter(boss => boss.name != 'Vivillon (Savanna)');
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchSavanna = new CustomQuest(
            1,
            ViviSavannaRemove,
            'Find and capture the rare Vivillon! Hint: It\'s surrounded by dragons.',
            App.game.statistics.pokemonCaptured[666.15]
        );
        VivillonQuestLine.addQuest(catchSavanna);
        // Capture 100 Ice type Pokemon
        const ViviSnowAdd = () => {
            dungeonList['Frost Cavern'].bossList.push(new DungeonBossPokemon('Vivillon (Icy Snow)', 93659450, 80));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'A Vivillon is hiding somewhere. It can be found at a very cold place.',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchIce = new CustomQuest(100, ViviSnowAdd, 'Capture 100 Ice type Pokémon', () => {
            return pokemonMap.filter(p => p.type.includes(PokemonType.Ice)).map(p => App.game.statistics.pokemonCaptured[p.id]()).reduce((a,b) => a + b, 0);
        });
        VivillonQuestLine.addQuest(catchIce);
        // Capture Vivillon (Icy Snow)
        const ViviSnowRemove = () => {
            dungeonList['Frost Cavern'].bossList = dungeonList['Frost Cavern'].bossList.filter(boss => boss.name != 'Vivillon (Icy Snow)');
            BattleFrontierMilestones.addMilestone(new BattleFrontierMilestonePokemon(666, 'Vivillon (Pokéball)'));
            Notifier.notify({
                title: VivillonQuestLine.name,
                message: 'You caught the rare Vivillon. Congratulations! Check out the Battle Frontier for your last Reward!',
                type: NotificationConstants.NotificationOption.success,
            });
        };
        const catchSnow = new CustomQuest(
            1,
            ViviSnowRemove,
            'Find and capture the rare Vivillon! Hint: It can be found at a very cold place.',
            App.game.statistics.pokemonCaptured[666.07]
        );
        VivillonQuestLine.addQuest(catchSnow);
        App.game.quests.questLines().push(VivillonQuestLine);
    }
    public static isQuestLineCompleted(name: string) {
        return App.game.quests.getQuestLine(name)?.state() == QuestLineState.ended;
    }
    public static loadQuestLines() {
        this.createTutorial();
        this.createDeoxysQuestLine();
        this.createUndergroundQuestLine();
        this.createVivillonQuestLine();
    }
}
