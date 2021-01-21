/// <reference path="../../declarations/DataStore/StatisticStore/index.d.ts" />
/// <reference path="../GameConstants.d.ts" />

class MapHelper {

    public static moveToRoute = function (route: number, region: GameConstants.Region) {
        if (isNaN(route)) {
            return;
        }
        let genNewEnemy = false;
        if (route != player.route()) {
            genNewEnemy = true;
        }
        if (this.accessToRoute(route, region)) {
            player.route(route);
            player.region = region;
            if (genNewEnemy) {
                Battle.generateNewEnemy();
            }
            App.game.gameState = GameConstants.GameState.fighting;
        } else {
            if (!MapHelper.routeExist(route, region)) {
                return Notifier.notify({
                    message: `${Routes.getName(route, region)} does not exist in the ${GameConstants.Region[region]} region.`,
                    type: NotificationConstants.NotificationOption.warning,
                });
            }

            const routeData = Routes.getRoute(region, route);
            const reqsList = [];

            routeData.requirements?.forEach(requirement => {
                if (!requirement.isCompleted()) {
                    reqsList.push(requirement.hint());
                }
            });

            Notifier.notify({
                message: `You don't have access to that route yet.<br/>${reqsList.join('<br/>')}`,
                type: NotificationConstants.NotificationOption.warning,
            });
        }
    };

    public static routeExist(route: number, region: GameConstants.Region): boolean {
        return !!Routes.getRoute(region, route);
    }

    public static normalizeRoute(route: number, region: GameConstants.Region): number {
        return Routes.normalizedNumber(region, route);
    }

    public static accessToRoute = function (route: number, region: GameConstants.Region) {
        return this.routeExist(route, region) && Routes.getRoute(region, route).isUnlocked();
    };

    public static getCurrentEnvironment(): GameConstants.Environment {
        const area = player.route() || player.town()?.name || undefined;

        const [env] = Object.entries(GameConstants.Environments).find(
            ([, regions]) => Object.values(regions).find(
                region => region.has(area)
            )
        ) || [];

        return (env as GameConstants.Environment);
    }

    public static calculateBattleCssClass(): string {
        return GameConstants.EnvironmentCssClass[this.getCurrentEnvironment()];
    }

    public static calculateRouteCssClass(route: number, region: GameConstants.Region): string {
        let cls;

        if (player.route() == route && player.region == region) {
            cls = 'currentRoute';
        } else if (MapHelper.accessToRoute(route, region)) {
            if (App.game.statistics.routeKills[region][route]() >= GameConstants.ROUTE_KILLS_NEEDED) {
                cls = 'unlockedRoute';
            } else {
                cls = 'unlockedUnfinishedRoute';
            }
        } else {
            cls = 'lockedRoute';
        }

        // Water routes
        if (GameConstants.Environments.Water[region]?.has(route)) {
            cls = `${cls} waterRoute`;
        }

        return cls;
    }

    public static calculateTownCssClass(town: string): string {
        if (!player.route() && player.town().name == town) {
            return 'city currentTown';
        }
        if (MapHelper.accessToTown(town)) {
            if (dungeonList.hasOwnProperty(town)) {
                if (App.game.statistics.dungeonsCleared[GameConstants.getDungeonIndex(town)]()) {
                    return 'dungeon completedDungeon';
                }
                return 'dungeon unlockedDungeon';
            }
            if (gymList.hasOwnProperty(town)) {
                const gym = gymList[town];
                // If defeated the previous gym, but not this one
                const gymIndex = GameConstants.getGymIndex(town);
                if (Gym.isUnlocked(gym) && !App.game.badgeCase.hasBadge(gym.badgeReward)) {
                    return 'city unlockedUnfinishedTown';
                }
            }
            return 'city unlockedTown';
        }
        if (dungeonList.hasOwnProperty(town)) {
            return 'dungeon';
        }
        return 'city';
    }

    public static accessToTown(townName: string): boolean {
        const town = TownList[townName];
        if (!town) {
            return false;
        }
        return town.isUnlocked();
    }

    public static moveToTown(townName: string) {
        if (MapHelper.accessToTown(townName)) {
            App.game.gameState = GameConstants.GameState.idle;
            player.route(0);
            const town = TownList[townName];
            if (town instanceof DungeonTown) {
                town.dungeon.calculateAllPokemonNames();
            }
            player.town(town);
            Battle.enemyPokemon(null);
            //this should happen last, so all the values all set beforehand
            App.game.gameState = GameConstants.GameState.town;
        } else {
            const town = TownList[townName];
            const reqsList = [];

            town.requirements?.forEach(requirement => {
                if (!requirement.isCompleted()) {
                    reqsList.push(requirement.hint());
                }
            });

            Notifier.notify({
                message: `You don't have access to that location yet.<br/>${reqsList.join('<br/>')}`,
                type: NotificationConstants.NotificationOption.warning,
            });
        }
    }

    public static validRoute(route = 0, region: GameConstants.Region = 0): boolean {
        return !!Routes.getRoute(region, route);
    }

    public static openShipModal() {
        const openModal = () => {
            $('#ShipModal').modal('show');
        };
        switch (player.region) {
            case 0:
                if (TownList['Vermilion City'].isUnlocked() && player.highestRegion() > 0) {
                    openModal();
                    return;
                }
            case 1:
                if (TownList['Olivine City'].isUnlocked()) {
                    openModal();
                    return;
                }
            case 2:
                if (TownList['Slateport City'].isUnlocked()) {
                    openModal();
                    return;
                }
            case 3:
                if (TownList['Canalave City'].isUnlocked()) {
                    openModal();
                    return;
                }
            case 4:
                if (TownList['Castelia City'].isUnlocked()) {
                    openModal();
                    return;
                }
            case 5:
                if (TownList['Coumarine City'].isUnlocked()) {
                    openModal();
                    return;
                }
        }

        Notifier.notify({
            message: 'You cannot access this dock yet',
            type: NotificationConstants.NotificationOption.warning,
        });
    }

    public static ableToTravel() {
        return player.highestRegion() < GameConstants.MAX_AVAILABLE_REGION && new Set(App.game.party.caughtPokemon.filter(p => p.id > 0 && PokemonHelper.calcNativeRegion(p.name) <= player.highestRegion()).map(p => Math.floor(p.id))).size >= GameConstants.TotalPokemonsPerRegion[player.highestRegion()];
    }

    public static travelToNextRegion() {
        if (MapHelper.ableToTravel()) {
            GameHelper.incrementObservable(player.highestRegion);
            MapHelper.moveToTown(GameConstants.StartingTowns[player.highestRegion()]);
            player.region = player.highestRegion();
        }
    }

}
