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

import { RecursiveKeyOf } from '../../../types/Helpers';
import { BaseMigration } from '../BaseMigration';
import { SystemSetting, SystemSettings } from '../../SystemSettings';
import { SYSTEM_NAME } from '../../Constants';
import { getCleanedEntityUpdates } from '../../util/UpdateHelpers';
import { DGActor } from '../../actor/DGActor';
import { DGItem } from '../../item/DGItem';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

// <editor-fold desc="V1 Types">
interface DataStore<TType extends string, TData extends object> {
    _id: string;
    type: TType;
    name: string;
    data: TData;
}

// <editor-fold desc="V1 Actor Types">
interface V1CoreSkill {
    label: string;
    proficiency: number;
    failure: boolean;
}
interface V1CustomSkill extends V1CoreSkill {
    group: string;
}

interface V1BaseActorData {
    health: {
        value: number;
        min: number;
        max: number;
    };
    wp: {
        value: number;
        min: number;
        max: number;
    };
    statistics: {
        str: {
            value: number;
            distinguishing_feature: string;
        };
        con: {
            value: number;
            distinguishing_feature: string;
        };
        dex: {
            value: number;
            distinguishing_feature: string;
        };
        int: {
            value: number;
            distinguishing_feature: string;
        };
        pow: {
            value: number;
            distinguishing_feature: string;
        };
        cha: {
            value: number;
            distinguishing_feature: string;
        };
    };
    skills: {
        [T in string]: V1CoreSkill;
    };
    typedSkills: {
        [T in string]: V1CustomSkill;
    };
}

interface V1AgentData extends V1BaseActorData {
    sanity: {
        value: number;
        currentBreakingPoint: number;
        adaptations: {
            violence: {
                incident1: boolean;
                incident2: boolean;
                incident3: boolean;
            };
            helplessness: {
                incident1: boolean;
                incident2: boolean;
                incident3: boolean;
            };
        };
    };

    physical: {
        description: string;
        wounds: string;
        firstAidAttempted: boolean;
    };

    biography: {
        profession: string;
        employer: string;
        nationality: string;
        sex: string;
        age: string;
        education: string;
    };
}
interface V1Agent extends DataStore<'agent', V1AgentData> {
    items: V1Item[];
}

interface V1NPCData extends V1BaseActorData {
    sanity: {
        value: number;
        currentBreakingPoint: number;
    };

    notes: string;
    shortDescription: string;
    showUntrainedSkills: boolean;
}
interface V1NPC extends DataStore<'npc', V1NPCData> {
    items: V1Item[];
}

interface V1UnnaturalData extends V1BaseActorData {
    sanity: {
        notes: string;
        failedLoss: string;
        successLoss: string;
    };

    notes: string;
    shortDescription: string;
    showUntrainedSkills: boolean;
}
interface V1Unnatural extends DataStore<'unnatural', V1UnnaturalData> {
    items: V1Item[];
}

type V1Actor = V1Agent | V1NPC | V1Unnatural;
// </editor-fold>

// <editor-fold desc="V1 Item Types">
interface V1BaseItemData {
    name: string;
    description: string;
}
interface V1PhysicalItemData extends V1BaseItemData {
    equipped: boolean;
    expense: string;
}

interface V1WeaponData extends V1PhysicalItemData {
    skill: string;
    range: string;
    damage: string;
    armorPiercing: number;
    lethality: number;
    isLethal: boolean;
    killRadius: string;
    ammo: string;
}
interface V1ItemWeapon extends DataStore<'weapon', V1WeaponData> {}

interface V1ArmorData extends V1PhysicalItemData {
    protection: number;
}
interface V1ItemArmor extends DataStore<'armor', V1ArmorData> {}

interface V1GearData extends V1PhysicalItemData {}
interface V1ItemGear extends DataStore<'gear', V1GearData> {}

interface V1MotivationData extends V1BaseItemData {
    disorder: string;
    crossedOut: boolean;
    disorderCured: boolean;
}
interface V1ItemMotivation extends DataStore<'motivation', V1MotivationData> {}

interface V1BondData extends V1BaseItemData {
    relationship: string;
    score: number;
}
interface V1ItemBond extends DataStore<'bond', V1BondData> {}

type V1Item = V1ItemWeapon | V1ItemArmor | V1ItemMotivation | V1ItemBond | V1ItemGear;
// </editor-fold>

// </editor-fold>

// <editor-fold desc="V2 Types">
// These types are copied here so future updates to them don't affect the migration

interface Value<T> {
    value: T;
}
interface Bounded<T> {
    max: T;
    value: T;
}

const UNNATURAL_ID = '4l35w618j8doxnfq';

enum AdaptationType {
    Violence = 'violence',
    Helplessness = 'helplessness',
}

enum StatisticType {
    Strength = 'strength',
    Constitution = 'constitution',
    Dexterity = 'dexterity',
    Intelligence = 'intelligence',
    Power = 'power',
    Charisma = 'charisma',
}

enum ExpenseType {
    Trivial = 'trivial',
    Standard = 'standard',
    Unusual = 'unusual',
    Major = 'major',
    Extreme = 'extreme',
}

interface Statistic<T extends StatisticType> {
    id: T;
    value: number;
    percentile?: number;
}

interface V2AgentData {
    health: Bounded<number>;
    willpower: Bounded<number>;
    sanity: Bounded<number> & {
        breakingPoint: Value<number>;
        adaptations: {
            [TType in AdaptationType]: {
                adapted: boolean;
                value: boolean[];
            };
        };
    };
    luck: Value<number>;
    statistics: {
        [TType in StatisticType]: Statistic<TType>;
    };
    biography: {
        profession: Value<string>;
        employer: Value<string>;
        nationality: Value<string>;
        gender: Value<string>;
        age: Value<string>;
        education: Value<string>;
        appearance: Value<string>;
        notes: Value<string>;
    };
}
interface V2ActorAgent extends DataStore<'agent', V2AgentData> {
    items: V2Item[];
}

interface V2NPCData extends V2AgentData {
    sanity: V2AgentData['sanity'] & {
        failureLoss: string;
        successLoss: string;
    };
}
interface V2ActorNPC extends DataStore<'npc', V2NPCData> {
    items: V2Item[];
}

interface V2PhysicalItemData {
    expense: Value<ExpenseType>;
    equipped: Value<boolean>;
    carried: Value<boolean>;
    description: Value<string>;
}

interface V2GearData extends V2PhysicalItemData {}
interface V2ItemGear {
    data: DataStore<'gear', V2GearData>;
}

interface V2WeaponData extends V2PhysicalItemData {
    skill: Value<string>;
    range: Value<number>;
    damage: Value<string>;
    armorPiercing: Value<number>;
    lethality: Value<number>;
    killRadius: Value<number>;
    ammo: Bounded<number>;
}
interface V2ItemWeapon {
    data: DataStore<'weapon', V2WeaponData>;
}

interface V2ArmorData extends V2PhysicalItemData {
    armorRating: Value<number>;
}
interface V2ItemArmor {
    data: DataStore<'armor', V2ArmorData>;
}

interface V2SkillData {
    rating: Value<number>;
    group: Value<string>;
    failureImproves: Value<boolean>;
    sessionFailure: Value<boolean>;
    canDelete: Value<boolean>;
}
interface V2ItemSkill {
    data: DataStore<'skill', V2SkillData>;
}

interface V2MotivationData {
    description: Value<string>;
    crossed: Value<boolean>;
}
interface V2ItemMotivation {
    data: DataStore<'motivation', V2MotivationData>;
}

interface V2DisorderData {
    description: Value<string>;
    crossed: Value<boolean>;
}
interface V2ItemDisorder {
    data: DataStore<'disorder', V2DisorderData>;
}

interface V2BondData {
    description: Value<string>;
    crossed: Value<boolean>;
    score: Value<number>;
    damaged: Value<boolean>;
}
interface V2ItemBond {
    data: DataStore<'bond', V2BondData>;
}

type V2Actor = V2ActorAgent | V2ActorNPC;
type V2Item = V2ItemGear | V2ItemWeapon | V2ItemArmor | V2ItemSkill | V2ItemMotivation | V2ItemDisorder | V2ItemBond;

type FlatDataMap<TData extends object> = {
    [TKey in RecursiveKeyOf<TData>]?: any;
};
// </editor-fold>

export class Migrate_v1v2 extends BaseMigration {
    public migrateActorData(oldActor: V1Actor): { updateData: Record<string, any>; newItems: Record<string, any>[] } {
        const updates: Record<string, any> = {};
        const skills: Record<string, any>[] = [];

        if (oldActor.data.hasOwnProperty('wp')) {
            updates['willpower.value'] = oldActor.data.wp.value;
            updates['willpower.max'] = oldActor.data.wp.min;
        }

        if (oldActor.data.hasOwnProperty('health')) {
            updates['health.value'] = oldActor.data.health.value;
        }

        if (oldActor.data.statistics.hasOwnProperty('str')) {
            updates['statistics.strength.id'] = StatisticType.Strength;
            updates['statistics.constitution.id'] = StatisticType.Constitution;
            updates['statistics.dexterity.id'] = StatisticType.Dexterity;
            updates['statistics.intelligence.id'] = StatisticType.Intelligence;
            updates['statistics.power.id'] = StatisticType.Power;
            updates['statistics.charisma.id'] = StatisticType.Charisma;

            updates['statistics.strength.value'] = oldActor.data.statistics.str.value;
            updates['statistics.constitution.value'] = oldActor.data.statistics.con.value;
            updates['statistics.dexterity.value'] = oldActor.data.statistics.dex.value;
            updates['statistics.intelligence.value'] = oldActor.data.statistics.int.value;
            updates['statistics.power.value'] = oldActor.data.statistics.pow.value;
            updates['statistics.charisma.value'] = oldActor.data.statistics.cha.value;
        }

        if (oldActor.data.hasOwnProperty('skills')) {
            const oldSkills = { ...oldActor.data.skills, ...oldActor.data.typedSkills };
            const isTypedSkill = (skill: V1CoreSkill | V1CustomSkill): skill is V1CustomSkill => {
                return skill.hasOwnProperty('group');
            };
            for (const [key, skill] of Object.entries(oldSkills)) {
                let id: string;
                if (key === 'unnatural') {
                    id = UNNATURAL_ID;
                } else {
                    if (skill.proficiency === 0) {
                        continue;
                    }
                    id = foundry.utils.randomID(16);
                }

                let name = skill.label;
                if (isTypedSkill(skill) && skill.group !== '') {
                    name = `${skill.group} (${skill.label})`;
                }

                skills.push({
                    _id: id,
                    name,
                    type: 'skill',
                    data: {
                        'rating.value': skill.proficiency,
                        'group.value': '',
                        'failureImproves.value': skill.failure !== undefined,
                        'canDelete.value': true,
                        'sessionFailure.value': skill.failure ?? false,
                    },
                    [`flags.${SYSTEM_NAME}.prevSkillId`]: key,
                });
            }
        }

        if (oldActor.type === 'agent') {
            if (oldActor.data.biography.hasOwnProperty('sex')) {
                updates['biography.profession.value'] = oldActor.data.biography.profession;
                updates['biography.employer.value'] = oldActor.data.biography.employer;
                updates['biography.nationality.value'] = oldActor.data.biography.nationality;
                updates['biography.gender.value'] = oldActor.data.biography.sex;
                updates['biography.age.value'] = oldActor.data.biography.age;
                updates['biography.education.value'] = oldActor.data.biography.education;
                updates['biography.appearance.value'] = oldActor.data.physical.description;
                updates['biography.notes.value'] = oldActor.data.physical.wounds;
            }
            if (oldActor.data.sanity.hasOwnProperty('currentBreakingPoint')) {
                const violence = [
                    oldActor.data.sanity.adaptations.violence.incident1,
                    oldActor.data.sanity.adaptations.violence.incident2,
                    oldActor.data.sanity.adaptations.violence.incident3,
                ];
                const violenceAdapted = !violence.some((v) => !v);
                const helplessness = [
                    oldActor.data.sanity.adaptations.helplessness.incident1,
                    oldActor.data.sanity.adaptations.helplessness.incident2,
                    oldActor.data.sanity.adaptations.helplessness.incident3,
                ];
                const helplessnessAdapted = !helplessness.some((v) => !v);

                updates['sanity.value'] = oldActor.data.sanity.value;

                updates['sanity.adaptations.violence.adapted'] = violenceAdapted;
                updates['sanity.adaptations.violence.value'] = violence;

                updates['sanity.adaptations.helplessness.adapted'] = helplessnessAdapted;
                updates['sanity.adaptations.helplessness.value'] = helplessness;
            }
        }

        if (oldActor.type === 'npc') {
            updates['sanity.value'] = oldActor.data.sanity.value;

            updates[`flags.${SYSTEM_NAME}.unnatural`] = false;
        }

        if (oldActor.type === 'unnatural') {
            updates['type'] = 'npc';
            if (oldActor.data.sanity.hasOwnProperty('failedLoss')) {
                updates['sanity.failureLoss'] = oldActor.data.sanity.failedLoss;
            }
            if (oldActor.data.sanity.hasOwnProperty('successLoss')) {
                updates['sanity.successLoss'] = oldActor.data.sanity.successLoss;
            }

            const violence = [false, false, false];
            const helplessness = [false, false, false];

            updates['sanity.value'] = 0;

            updates['sanity.adaptations.violence.adapted'] = false;
            updates['sanity.adaptations.violence.value'] = violence;

            updates['sanity.adaptations.helplessness.adapted'] = false;
            updates['sanity.adaptations.helplessness.value'] = helplessness;

            updates[`flags.${SYSTEM_NAME}.unnatural`] = true;
        }

        if (oldActor.items) {
            const items = oldActor.items.reduce((arr: Record<string, any>, itemData) => {
                let itemUpdate = this.migrateItemData(itemData, skills);

                if (!isObjectEmpty(itemUpdate.updateData)) {
                    itemUpdate.updateData._id = itemData._id;
                    itemUpdate.updateData = getCleanedEntityUpdates(itemData as ItemData, itemUpdate.updateData);
                    arr.push(expandObject(itemUpdate.updateData));
                }

                return arr;
            }, []);

            if (items.length > 0) {
                updates.items = items;
            }
        }

        return { updateData: updates, newItems: skills };
    }

    public migrateItemData(oldItem: V1Item, skills?: Record<string, any>[]): { updateData: Record<string, any>; newItems: Record<string, any>[] } {
        const updates: Record<string, any> = {};
        const newItems: Record<string, any>[] = [];
        if (oldItem.data.hasOwnProperty('name')) {
            updates['_id'] = oldItem._id;

            switch (oldItem.type) {
                case 'weapon':
                case 'armor':
                case 'gear':
                    updates['expense.value'] = oldItem.data.expense ?? ExpenseType.Standard;
                    updates['equipped.value'] = oldItem.data.equipped ?? true;
                    updates['description.value'] = oldItem.data.description ?? '';
                    break;
            }

            switch (oldItem.type) {
                case 'weapon':
                    updates['skill.value'] = skills?.find((skill) => skill[`flags.${SYSTEM_NAME}.prevSkillId`] === oldItem.data.skill)?._id ?? '';
                    updates['range.value'] = oldItem.data.range.replace('M', '');
                    updates['damage.value'] = oldItem.data.damage ?? '0';
                    updates['armorPiercing.value'] = parseInt(oldItem.data.armorPiercing.toString()) ?? 0;
                    updates['lethality.value'] = oldItem.data.lethality;
                    updates['killRadius.value'] = oldItem.data.killRadius.replace('M', '');
                    updates['ammo.value'] = oldItem.data.ammo ?? '';
                    updates['ammo.max'] = oldItem.data.ammo ?? '';
                    break;
                case 'armor':
                    updates['armorRating.value'] = oldItem.data.protection;
                    break;
                case 'gear':
                    break;
                case 'motivation':
                    updates['crossed.value'] = oldItem.data.crossedOut ?? false;
                    updates['description.value'] = oldItem.data.description ?? '';

                    if (oldItem.data.disorder) {
                        const disorder: Record<string, any> = {};
                        disorder['_id'] = foundry.utils.randomID(16);
                        disorder['name'] = oldItem.data.disorder;
                        disorder['type'] = 'disorder';
                        disorder['crossed.value'] = oldItem.data.disorderCured;
                        disorder['description.value'] = oldItem.data.description;
                        newItems.push(disorder);
                    }
                    break;
                case 'bond':
                    updates['description.value'] = `${oldItem.data.relationship}\n${oldItem.data.description}`;
                    updates['score.value'] = oldItem.data.score;
                    break;
            }
        }

        return {
            updateData: updates,
            newItems,
        };
    }

    public migrateSceneData(scene: Scene) {
        const tokens = scene.tokens.map((token) => {
            const tokenData = token.toJSON();
            if (!tokenData.actorId || tokenData.actorLink) {
                tokenData.actorData = {};
            } else if (!game.actors!.has(tokenData.actorId)) {
                tokenData.actorId = null;
                tokenData.actorData = {};
            } else if (!tokenData.actorLink) {
                const actorData = duplicate(tokenData.actorData);
                const updateData = this.migrateActorData(actorData as unknown as V1Actor);
                mergeObject(tokenData.actorData, updateData.updateData);
            }
            return tokenData;
        });
        return { tokens };
    }

    public async updateCompendiums() {
        for (const pack of game.packs) {
            const entityType = pack.metadata.entity;
            if (pack.metadata.package !== 'world') {
                continue;
            }
            if (entityType !== 'Actor' && entityType !== 'Item' && entityType !== 'Scene') {
                continue;
            }

            let wasLocked = pack.locked;
            await pack.configure({ locked: false });
            await pack.migrate();

            const documents = await pack.getDocuments();
            for (const document of documents) {
                try {
                    let updateData: Record<string, any> = {};
                    let newItems: Record<string, any>[] = [];

                    switch (entityType) {
                        case 'Actor':
                            const actorData = this.migrateActorData(document.toObject());
                            updateData = actorData.updateData;
                            newItems = actorData.newItems;
                            break;
                        case 'Item':
                            const itemData = this.migrateItemData(document.toObject());
                            updateData = itemData.updateData;
                            newItems = itemData.newItems;
                            break;
                        case 'Scene':
                            updateData = this.migrateSceneData(document.data);
                            break;
                    }

                    if (!foundry.utils.isObjectEmpty(updateData)) {
                        await document.update(getCleanedEntityUpdates(document.data, updateData));
                    }
                    if (newItems.length > 0) {
                        await document.createEmbeddedDocuments('Item', newItems);
                    }
                } catch (e) {
                    console.error(`Error migrating ${document.name} in ${pack.name}`);
                    console.error(e);
                }
            }

            await pack.configure({ locked: wasLocked });
        }
    }

    public shouldRun(): boolean {
        const version = SystemSettings.get(SystemSetting.SchemaVersion);
        return version === 0 || version == 1;
    }

    public async run() {
        for (const document of game.actors!) {
            try {
                const { updateData, newItems } = this.migrateActorData(document.toObject() as V1Actor);

                if (!foundry.utils.isObjectEmpty(updateData)) {
                    if ((document.type as string) === 'unnatural') {
                        document.data.type = 'npc';
                    }

                    await document.update(getCleanedEntityUpdates(document.data, updateData));
                }
                if (newItems.length > 0) {
                    await document.createEmbeddedDocuments('Item', newItems);
                }
            } catch (e) {
                console.error(`Error migrating ${document.name}`);
                console.error(e);
            }
        }

        for (const document of game.items!) {
            try {
                const { updateData, newItems } = this.migrateItemData(document.toObject() as V1Item);

                if (!foundry.utils.isObjectEmpty(updateData)) {
                    await document.update(getCleanedEntityUpdates(document.data, updateData));
                }
                if (newItems.length > 0) {
                    await Item.createDocuments(newItems as any);
                }
            } catch (e) {
                console.error(`Error migrating ${document.name}`);
                console.error(e);
            }
        }

        await this.updateCompendiums();
        await SystemSettings.set(SystemSetting.SchemaVersion, 2);
    }
}
