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

import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

/*********************
 ACTOR CONSTANTS & ENUMS
 *********************/

export const ActorTypeAgent = 'agent';

export enum StatisticType {
    Strength = 'strength',
    Constitution = 'constitution',
    Dexterity = 'dexterity',
    Intelligence = 'intelligence',
    Power = 'power',
    Charisma = 'charisma',
}

export enum CoreSkillType {
    Accounting = 'accounting',
    Alertness = 'alertness',
    Anthropology = 'anthropology',
    Archeology = 'archeology',
    Artillery = 'artillery',
    Athletics = 'athletics',
    Bureaucracy = 'bureaucracy',
    computer_science = 'computer_science',
    Criminology = 'criminology',
    Demolitions = 'demolitions',
    Disguise = 'disguise',
    Dodge = 'dodge',
    Drive = 'drive',
    Firearms = 'firearms',
    FirstAid = 'first_aid',
    Forensics = 'forensics',
    HeavyMachinery = 'heavy_machinery',
    HeavyWeapons = 'heavy_weapons',
    History = 'history',
    HumanIntelligence = 'human_intelligence',
    Law = 'law',
    Medicine = 'medicine',
    MeleeWeapons = 'melee_weapons',
    Navigate = 'navigate',
    Occult = 'occult',
    Persuade = 'persuade',
    Pharmacy = 'pharmacy',
    Psychotherapy = 'psychotherapy',
    Ride = 'ride',
    Search = 'search',
    SignalIntelligence = 'signal_intelligence',
    Stealth = 'stealth',
    Surgery = 'surgery',
    Survival = 'survival',
    Swim = 'swim',
    UnarmedCombat = 'unarmed_combat',
    Unnatural = 'unnatural',
}

interface SkillDefinition {
    _id: string;
    name: string;
    type: 'skill';
    data: {
        value: number;
        group: string;
        failureImproves: boolean;
        sessionFailure: boolean;
        canDelete: boolean;
    };
}

export const UNNATURAL_ID = '4l35w618j8doxnfq';
// We generate a new id when using the new Skill Button
export const NEW_SKILL_DEFAULTS: Omit<SkillDefinition, '_id'> = {
    name: 'New Skill', // TODO: Localization
    type: 'skill',
    data: {
        value: 0,
        group: 'Default Skill Group',
        failureImproves: true,
        sessionFailure: false,
        canDelete: true,
    },
};

export const DEFAULT_SKILLS_DEFINITION: SkillDefinition[] = [
    {
        _id: 'vqioy388qui94jhn',
        name: 'Accounting',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'y2q8eq7kskotutkd',
        name: 'Alertness',
        type: 'skill',
        data: {
            value: 20,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '19gu3j166ykyi4hh',
        name: 'Athletics',
        type: 'skill',
        data: {
            value: 30,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '0kmmjqo6znb6xk2q',
        name: 'Bureaucracy',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '9ciuss1ij6fem9rv',
        name: 'Criminology',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'ees261e9lnchdaxc',
        name: 'Disguise',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'ohjvi3gzvqi2x97f',
        name: 'Dodge',
        type: 'skill',
        data: {
            value: 30,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'moahtggd9185nun3',
        name: 'Drive',
        type: 'skill',
        data: {
            value: 20,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'rfrdw98rykpr84ca',
        name: 'Firearms',
        type: 'skill',
        data: {
            value: 20,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'h7zzd5ktaqtivgpr',
        name: 'First Aid',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '9uewucfi1goeqnta',
        name: 'Heavy Machinery',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '57escpcf83o3wzfj',
        name: 'History',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'qhcmfwgcq4kg3din',
        name: 'HUMINT',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '06s5h4abkvl8nx0c',
        name: 'Melee Weapons',
        type: 'skill',
        data: {
            value: 30,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'x36jfmlib5lh6s9c',
        name: 'Navigate',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'cjeosj0hkvm26uv3',
        name: 'Occult',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'c6wccm0bjz4o5vpb',
        name: 'Persuade',
        type: 'skill',
        data: {
            value: 20,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'axeehmeq2xqurzmi',
        name: 'Psychotherapy',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'mwt6ho4el6bnezbz',
        name: 'Ride',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '1pvi1u4e73qbur2l',
        name: 'Search',
        type: 'skill',
        data: {
            value: 20,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'tup281l2q7n62qwh',
        name: 'Stealth',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'k03j9ybabcimlw7w',
        name: 'Survival',
        type: 'skill',
        data: {
            value: 10,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: '5cx7lv1roaowq9hd',
        name: 'Swim',
        type: 'skill',
        data: {
            value: 20,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: 'am25rt6d74jjx93v',
        name: 'Unarmed Combat',
        type: 'skill',
        data: {
            value: 40,
            group: 'Default Skill Group',
            failureImproves: true,
            sessionFailure: false,
            canDelete: false,
        },
    },
    {
        _id: UNNATURAL_ID,
        name: 'Unnatural',
        type: 'skill',
        data: {
            value: 0,
            group: 'Default Skill Group',
            failureImproves: false,
            sessionFailure: false,
            canDelete: false,
        },
    },
];

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

export enum ExpenseType {
    Trivial = 'trivial',
    Standard = 'standard',
    Unusual = 'unusual',
    Major = 'major',
    Extreme = 'extreme',
}
