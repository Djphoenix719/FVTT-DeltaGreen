/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*********************
 DICE CONSTANTS & ENUMS
 *********************/

import { ItemType } from './Item';
import { Value } from './Helpers';

/**
 * Result of a d100 die roll.
 */
export enum RollResultType {
    CriticalFailure = 'criticalFailure',
    Failure = 'failure',
    Success = 'success',
    CriticalSuccess = 'criticalSuccess',
}

/*********************
 ACTOR CONSTANTS & ENUMS
 *********************/

export const ActorTypeAgent = 'agent';
export const ActorTypeNPC = 'npc';
/**
 * @DEPRECATED: Preserved for compatability;
 */
export const ActorTypeUnnatural = 'unnatural';

/**
 * The type of statistic.
 */
export enum StatisticType {
    Strength = 'strength',
    Constitution = 'constitution',
    Dexterity = 'dexterity',
    Intelligence = 'intelligence',
    Power = 'power',
    Charisma = 'charisma',
}

interface SkillDefinition {
    _id: string;
    name: string;
    type: 'skill';
    data: {
        rating: Value<number>;
        group: Value<string>;
        failureImproves: Value<boolean>;
        sessionFailure: Value<boolean>;
        canDelete: Value<boolean>;
    };
}

export const UNNATURAL_ID = '4l35w618j8doxnfq';

const DEFAULT_SKILL_DEFINITION_DATA = {
    group: { value: '' },
    failureImproves: { value: true },
    sessionFailure: { value: false },
    canDelete: { value: false },
};
export const DEFAULT_SKILLS_DEFINITION: SkillDefinition[] = [
    {
        _id: 'vqioy388qui94jhn',
        name: 'DG.SKILLS.NAME.accounting',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'y2q8eq7kskotutkd',
        name: 'DG.SKILLS.NAME.alertness',
        type: 'skill',
        data: {
            rating: {
                value: 20,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '19gu3j166ykyi4hh',
        name: 'DG.SKILLS.NAME.athletics',
        type: 'skill',
        data: {
            rating: {
                value: 30,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '0kmmjqo6znb6xk2q',
        name: 'DG.SKILLS.NAME.bureaucracy',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '9ciuss1ij6fem9rv',
        name: 'DG.SKILLS.NAME.criminology',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'ees261e9lnchdaxc',
        name: 'DG.SKILLS.NAME.disguise',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'ohjvi3gzvqi2x97f',
        name: 'DG.SKILLS.NAME.dodge',
        type: 'skill',
        data: {
            rating: {
                value: 30,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'moahtggd9185nun3',
        name: 'DG.SKILLS.NAME.drive',
        type: 'skill',
        data: {
            rating: {
                value: 20,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'rfrdw98rykpr84ca',
        name: 'DG.SKILLS.NAME.firearms',
        type: 'skill',
        data: {
            rating: {
                value: 20,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'h7zzd5ktaqtivgpr',
        name: 'DG.SKILLS.NAME.firstAid',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '9uewucfi1goeqnta',
        name: 'DG.SKILLS.NAME.heavyMachinery',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '57escpcf83o3wzfj',
        name: 'DG.SKILLS.NAME.history',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'qhcmfwgcq4kg3din',
        name: 'DG.SKILLS.NAME.humint',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '06s5h4abkvl8nx0c',
        name: 'DG.SKILLS.NAME.meleeWeapons',
        type: 'skill',
        data: {
            rating: {
                value: 30,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'x36jfmlib5lh6s9c',
        name: 'DG.SKILLS.NAME.navigate',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'cjeosj0hkvm26uv3',
        name: 'DG.SKILLS.NAME.occult',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'c6wccm0bjz4o5vpb',
        name: 'DG.SKILLS.NAME.persuade',
        type: 'skill',
        data: {
            rating: {
                value: 20,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'axeehmeq2xqurzmi',
        name: 'DG.SKILLS.NAME.psychotherapy',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'mwt6ho4el6bnezbz',
        name: 'DG.SKILLS.NAME.ride',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '1pvi1u4e73qbur2l',
        name: 'DG.SKILLS.NAME.search',
        type: 'skill',
        data: {
            rating: {
                value: 20,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'tup281l2q7n62qwh',
        name: 'DG.SKILLS.NAME.stealth',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'k03j9ybabcimlw7w',
        name: 'DG.SKILLS.NAME.survival',
        type: 'skill',
        data: {
            rating: {
                value: 10,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '5cx7lv1roaowq9hd',
        name: 'DG.SKILLS.NAME.swim',
        type: 'skill',
        data: {
            rating: {
                value: 20,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: 'am25rt6d74jjx93v',
        name: 'DG.SKILLS.NAME.unarmedCombat',
        type: 'skill',
        data: {
            rating: {
                value: 40,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
        },
    },
    {
        _id: '4l35w618j8doxnfq',
        name: 'DG.SKILLS.NAME.unnatural',
        type: 'skill',
        data: {
            rating: {
                value: 0,
            },
            ...DEFAULT_SKILL_DEFINITION_DATA,
            failureImproves: {
                value: false,
            },
        },
    },
];

/**
 * Type of sanity adaptation.
 */
export enum AdaptationType {
    Violence = 'violence',
    Helplessness = 'helplessness',
}

/*********************
 ITEM CONSTANTS & ENUMS
 *********************/

export const ItemTypeSkill = 'skill';
export const ItemTypeGear = 'gear';
export const ItemTypeArmor = 'armor';
export const ItemTypeWeapon = 'weapon';
export const ItemTypeBond = 'bond';
export const ItemTypeMotivation = 'motivation';
export const ItemTypeDisorder = 'disorder';
export const ItemTypeAbility = 'ability';

export const DEFAULT_ITEM_NAME: Record<ItemType, string> = {
    [ItemTypeSkill]: `DG.ITEM.newSkill`,
    [ItemTypeGear]: `DG.ITEM.newGear`,
    [ItemTypeArmor]: `DG.ITEM.newArmor`,
    [ItemTypeWeapon]: `DG.ITEM.newWeapon`,
    [ItemTypeBond]: `DG.ITEM.newBond`,
    [ItemTypeMotivation]: `DG.ITEM.newMotivation`,
    [ItemTypeDisorder]: `DG.ITEM.newDisorder`,
    [ItemTypeAbility]: `DG.ITEM.newAbility`,
};

/**
 * Type of expense.
 */
export enum ExpenseType {
    Trivial = 'trivial',
    Standard = 'standard',
    Unusual = 'unusual',
    Major = 'major',
    Extreme = 'extreme',
}
