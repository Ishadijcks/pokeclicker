/// <reference path="../../scripts/ArrayOfObservables.ts"/>

import { Feature } from './common/Feature';
import * as GameConstants from '../GameConstants';
import BadgeEnums from '../enums/Badges';

const emptyBadgeList = new Array(GameConstants.RegionGyms.flat().length).fill(false);

export default class BadgeCase implements Feature {
    name = 'Badge Case';

    saveKey = 'badgeCase';

    defaults: Record<string, any> = {};

    badgeList: ArrayOfObservables<boolean> = new ArrayOfObservables(emptyBadgeList);

    badgeCount(): number {
        return this.badgeList.reduce((a, b) => (+a) + (+b), 0);
    }

    gainBadge(badge: BadgeEnums): void {
        this.badgeList[badge] = true;
    }

    hasBadge(badge: BadgeEnums): boolean {
        if (badge === null || badge === BadgeEnums.None) { return true; }
        return !!this.badgeList[badge];
    }

    // This method intentionally left blank
    // eslint-disable-next-line class-methods-use-this
    initialize(): void { }

    // eslint-disable-next-line class-methods-use-this
    canAccess(): boolean { return true; }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        json.forEach((hasBadge, index) => {
            this.badgeList[index] = hasBadge;
        });
    }

    toJSON(): Record<string, any> {
        let shouldReturn = false;
        // We only want to save upto the highest badge we have obtained,
        // everything else is assumed to be false
        return [...this.badgeList]
            .reverse()
            .filter((hasBadge) => {
                shouldReturn = shouldReturn || hasBadge;
                return shouldReturn;
            })
            .reverse();
    }

    // This method intentionally left blank
    // eslint-disable-next-line class-methods-use-this
    update(): void { }
}