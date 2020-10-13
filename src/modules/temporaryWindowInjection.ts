// TODO: Remove temporary code after all code in ../scripts has been ported.
// This is only here so that the code in ../scripts can use the new functionality

import DataStore from './DataStore';
import * as GameConstants from './GameConstants';
import BadgeEnums from './enums/Badges';

Object.assign(<any>window, {
    GameConstants,
    DataStore,
    BadgeCase: DataStore.badge,
    Statistics: DataStore.statistics,
    BadgeEnums,
});
