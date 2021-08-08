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

export enum AdaptationType {
    Violence = 'violence',
    Helplessness = 'helplessness',
}

/*********************
 ITEM CONSTANTS & ENUMS
 *********************/

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
