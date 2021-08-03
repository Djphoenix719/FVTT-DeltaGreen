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

import { Bounded, Label, Value, VersionNumber } from './Common';

type ActorTypeAgent = 'agent';

interface Statistic<T extends BaseStatisticType> extends Value<number>, Label<string> {
    id: T;
    percentile?: number;
}

interface Skill<T extends string> extends Value<number>, Label<string> {
    id: T;
    failure?: boolean;
}

export enum BaseStatisticType {
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
    Bureaucracy = 'Bureaucracy',
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
export type CustomSkillType = `custom_${number}`;
export type ActorSkillType = CoreSkillType | CustomSkillType;

export enum AdaptationType {
    Violence = 'violence',
    Helplessness = 'helplessness',
}

// this is the template.json data
interface AgentDataSourceData {
    schema: VersionNumber;
    health: Bounded<number>;
    willpower: Bounded<number>;
    sanity: Bounded<number> & {
        breakingPoint: Value<number>;
        adaptations: {
            [TType in AdaptationType]: boolean[];
        };
    };
    statistics: {
        [TType in BaseStatisticType]: Statistic<TType>;
    };
    skills: {
        core: {
            [TSkill in CoreSkillType]: Skill<TSkill>;
        };
        custom: {
            [skill: string]: Skill<typeof skill>;
        };
    };
    description: {
        appearance: Value<string>;
        wounds: Value<string>;
    };
    biography: {
        profession: Value<string> & Label<string>;
        employer: Value<string> & Label<string>;
        nationality: Value<string> & Label<string>;
        gender: Value<string> & Label<string>;
        age: Value<string> & Label<string>;
        education: Value<string> & Label<string>;
    };
}

export interface AgentDataPropertiesData extends AgentDataSourceData {}

export interface AgentDataSource {
    type: ActorTypeAgent;
    data: AgentDataSourceData;
}
export interface AgentDataProperties {
    type: ActorTypeAgent;
    data: AgentDataPropertiesData;
}

declare global {
    interface SourceConfig {
        Actor: AgentDataSource;
    }
    interface DataConfig {
        Actor: AgentDataProperties;
    }
}
