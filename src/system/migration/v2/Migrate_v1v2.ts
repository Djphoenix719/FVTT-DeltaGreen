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

interface Updatable {
    update(data: Record<string, any>): Promise<void>;
    delete(): Promise<void>;
}

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
    schemaVersion: 1.0;
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
interface V1Agent {
    items: Collection<V1Item>;
    data: DataStore<'agent', V1AgentData>;
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
interface V1NPC {
    items: Collection<V1Item>;
    data: DataStore<'npc', V1NPCData>;
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
interface V1Unnatural {
    items: Collection<V1Item>;
    data: DataStore<'unnatural', V1UnnaturalData>;
}

type V1Actor = V1Agent | V1NPC | V1Unnatural;
// </editor-fold>

// <editor-fold desc="V1 Item Types">
interface V1BaseItemData {
    name: string;
    description: string;
    schemaVersion?: 1.0;
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
interface V1ItemWeapon extends Updatable {
    data: DataStore<'weapon', V1WeaponData>;
}

interface V1ArmorData extends V1PhysicalItemData {
    protection: number;
}
interface V1ItemArmor extends Updatable {
    data: DataStore<'armor', V1ArmorData>;
}

interface V1GearData extends V1PhysicalItemData {}
interface V1ItemGear extends Updatable {
    data: DataStore<'gear', V1GearData>;
}

interface V1MotivationData extends V1BaseItemData {
    disorder: string;
    crossedOut: boolean;
    disorderCured: boolean;
}
interface V1ItemMotivation extends Updatable {
    data: DataStore<'motivation', V1MotivationData>;
}

interface V1BondData extends V1BaseItemData {
    relationship: string;
    score: number;
}
interface V1ItemBond extends Updatable {
    data: DataStore<'bond', V1BondData>;
}

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
    label: string;
    percentile?: number;
}

interface V2AgentData {
    schemaVersion: 2;
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
interface V2ActorAgent {
    data: DataStore<'agent', V2AgentData>;
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

type V2Item = V2ItemGear | V2ItemWeapon | V2ItemArmor | V2ItemSkill | V2ItemMotivation | V2ItemDisorder | V2ItemBond;

type FlatDataMap<TData extends object> = {
    [TKey in RecursiveKeyOf<TData>]?: any;
};
// </editor-fold>

export class Migrate_v1v2 extends BaseMigration {
    public getActorUpdates(oldActor: V1Actor): FlatDataMap<V2ActorAgent['data']> {
        console.info(`Converting actor: "${oldActor.data.name}"`);
        switch (oldActor.data.type) {
            case 'agent':
                return this.getAgentUpdates(oldActor as V1Agent);
            case 'npc':
                return {};
                return this.getNPCUpdates(oldActor as V1NPC);
            case 'unnatural':
                return {};
                return this.getUnnaturalUpdates(oldActor as V1Unnatural);
        }
    }

    public getAgentUpdates(oldActor: V1Agent): FlatDataMap<V2ActorAgent['data']> {
        const actorUpdates: FlatDataMap<V2ActorAgent['data']> = {};
        const data = oldActor.data.data;

        actorUpdates['data.schemaVersion'] = 2;

        actorUpdates['data.health.value'] = data.health.value;
        actorUpdates['data.willpower.value'] = data.wp.value;
        actorUpdates['data.willpower.max'] = data.wp.min;

        actorUpdates['data.statistics.strength.id'] = StatisticType.Strength;
        actorUpdates['data.statistics.constitution.id'] = StatisticType.Constitution;
        actorUpdates['data.statistics.dexterity.id'] = StatisticType.Dexterity;
        actorUpdates['data.statistics.intelligence.id'] = StatisticType.Intelligence;
        actorUpdates['data.statistics.power.id'] = StatisticType.Power;
        actorUpdates['data.statistics.charisma.id'] = StatisticType.Charisma;

        actorUpdates['data.statistics.strength.value'] = data.statistics.str.value;
        actorUpdates['data.statistics.constitution.value'] = data.statistics.con.value;
        actorUpdates['data.statistics.dexterity.value'] = data.statistics.dex.value;
        actorUpdates['data.statistics.intelligence.value'] = data.statistics.int.value;
        actorUpdates['data.statistics.power.value'] = data.statistics.pow.value;
        actorUpdates['data.statistics.charisma.value'] = data.statistics.cha.value;

        actorUpdates['data.statistics.strength.label'] = 'DG.STATISTICS.strength';
        actorUpdates['data.statistics.constitution.label'] = 'DG.STATISTICS.constitution';
        actorUpdates['data.statistics.dexterity.label'] = 'DG.STATISTICS.dexterity';
        actorUpdates['data.statistics.intelligence.label'] = 'DG.STATISTICS.intelligence';
        actorUpdates['data.statistics.power.label'] = 'DG.STATISTICS.power';
        actorUpdates['data.statistics.charisma.label'] = 'DG.STATISTICS.charisma';

        actorUpdates['data.biography.profession.value'] = data.biography.profession;
        actorUpdates['data.biography.employer.value'] = data.biography.employer;
        actorUpdates['data.biography.nationality.value'] = data.biography.nationality;
        actorUpdates['data.biography.gender.value'] = data.biography.sex;
        actorUpdates['data.biography.age.value'] = data.biography.age;
        actorUpdates['data.biography.education.value'] = data.biography.education;
        actorUpdates['data.biography.appearance.value'] = data.physical.description;
        actorUpdates['data.biography.notes.value'] = data.physical.wounds;

        const violence = [data.sanity.adaptations.violence.incident1, data.sanity.adaptations.violence.incident2, data.sanity.adaptations.violence.incident3];
        const violenceAdapted = !violence.some((v) => !v);
        const helplessness = [
            data.sanity.adaptations.helplessness.incident1,
            data.sanity.adaptations.helplessness.incident2,
            data.sanity.adaptations.helplessness.incident3,
        ];
        const helplessnessAdapted = !helplessness.some((v) => !v);

        actorUpdates['data.sanity.value'] = data.sanity.value;

        actorUpdates['data.sanity.adaptations.violence.adapted'] = violenceAdapted;
        actorUpdates['data.sanity.adaptations.violence.value'] = violence;

        actorUpdates['data.sanity.adaptations.helplessness.adapted'] = helplessnessAdapted;
        actorUpdates['data.sanity.adaptations.helplessness.value'] = helplessness;

        return actorUpdates;
    }
    public getNPCUpdates(oldActor: V1NPC): FlatDataMap<V2ActorAgent['data']> {
        throw new Error('');
    }
    public getUnnaturalUpdates(oldActor: V1Unnatural): FlatDataMap<V2ActorAgent['data']> {
        throw new Error('');
    }

    public getActorSkills(oldActor: V1Actor): Record<string, any>[] {
        const skills: Record<string, any>[] = [];
        const allSkills = mergeObject(oldActor.data.data.skills, oldActor.data.data.typedSkills);
        for (const key in allSkills) {
            const skillData = allSkills[key];

            let id: string;
            if (key === 'unnatural') {
                id = UNNATURAL_ID;
            } else {
                if (skillData.proficiency === 0) {
                    continue;
                }
                id = foundry.utils.randomID(16);
            }

            let name = skillData.label;
            if (skillData.hasOwnProperty('group') && skillData.group !== '') {
                name = `${skillData.group} (${skillData.label})`;
            }

            skills.push({
                _id: id,
                name,
                type: 'skill',
                data: {
                    rating: {
                        value: skillData.proficiency,
                    },
                    group: {
                        value: '',
                    },
                    failureImproves: {
                        value: skillData.failure !== undefined,
                    },
                    sessionFailure: {
                        value: skillData.failure ?? false,
                    },
                    canDelete: {
                        value: true,
                    },
                },
            });
        }
        return skills;
    }

    public getItemUpdates(oldItem: V1Item): Record<string, any> {
        console.info(`Converting item: "${oldItem.data.name}"`);
        switch (oldItem.data.type) {
            case 'weapon':
                return this.getWeaponUpdates(oldItem as V1ItemWeapon);
            case 'armor':
                return this.getArmorUpdates(oldItem as V1ItemArmor);
            case 'motivation':
                return this.getMotivationUpdates(oldItem as V1ItemMotivation);
            case 'bond':
                return this.getBondUpdates(oldItem as V1ItemBond);
            case 'gear':
                return this.getGearUpdates(oldItem as V1ItemGear);
        }
    }

    public getBasePhysicalItemData(oldItem: V1PhysicalItemData): FlatDataMap<DataStore<any, V2PhysicalItemData>> {
        const updates: FlatDataMap<DataStore<any, V2PhysicalItemData>> = {};

        updates['data.expense.value'] = oldItem.expense;
        updates['data.equipped.value'] = oldItem.equipped;
        updates['data.carried.value'] = true;
        updates['data.description.value'] = oldItem.description;

        return updates;
    }
    public getWeaponUpdates(oldItem: V1ItemWeapon): Record<string, any> {
        let updates: FlatDataMap<V2ItemWeapon['data']> = {};
        updates['_id'] = oldItem.data._id;

        updates = mergeObject(updates, this.getBasePhysicalItemData(oldItem.data.data));

        updates['data.skill.value'] = oldItem.data.data.skill;
        updates['data.range.value'] = oldItem.data.data.range.replace('M', '');
        updates['data.damage.value'] = oldItem.data.data.damage;
        updates['data.armorPiercing.value'] = oldItem.data.data.armorPiercing;
        updates['data.lethality.value'] = oldItem.data.data.lethality;
        updates['data.killRadius.value'] = oldItem.data.data.killRadius.replace('M', '');
        updates['data.ammo.value'] = oldItem.data.data.ammo;
        updates['data.ammo.max'] = oldItem.data.data.ammo;

        return mergeObject(updates, {
            ['data.-=name']: null,
            ['data.-=isLethal']: null,
        });
    }
    public getArmorUpdates(oldItem: V1ItemArmor): Record<string, any> {
        let updates: FlatDataMap<V2ItemArmor['data']> = {};
        updates['_id'] = oldItem.data._id;

        updates = mergeObject(updates, this.getBasePhysicalItemData(oldItem.data.data));

        updates['data.armorRating.value'] = oldItem.data.data.protection;

        return mergeObject(updates, {
            ['data.-=name']: null,
            ['data.-=protection']: null,
        });
    }
    public getGearUpdates(oldItem: V1ItemGear): Record<string, any> {
        let updates: FlatDataMap<V2ItemGear['data']> = {};
        updates['_id'] = oldItem.data._id;

        updates = mergeObject(updates, this.getBasePhysicalItemData(oldItem.data.data));

        return mergeObject(updates, {
            ['data.-=name']: null,
        });
    }
    public getMotivationUpdates(oldItem: V1ItemMotivation): Record<string, any> {
        const updates: FlatDataMap<V2ItemMotivation['data']> = {};
        updates['_id'] = oldItem.data._id;

        updates['data.crossed.value'] = oldItem.data.data.crossedOut;
        updates['data.description.value'] = oldItem.data.data.description;

        return mergeObject(updates, {
            ['data.-=name']: null,
            ['data.-=crossedOut']: null,
            ['data.-=disorder']: null,
            ['data.-=disorderCured']: null,
        });
    }
    public getBondUpdates(oldItem: V1ItemBond): FlatDataMap<V2ItemBond['data']> {
        const updates: FlatDataMap<V2ItemBond['data']> = {};
        updates['_id'] = oldItem.data._id;

        updates['data.description.value'] = `<p>${oldItem.data.data.relationship}</p><p>${oldItem.data.data.description}</p>`;
        updates['data.score.value'] = oldItem.data.data.score;

        return mergeObject(updates, {
            ['data.-=name']: null,
            ['data.-=relationship']: null,
        });
    }

    public getDisorderFromMotivation(oldItem: V1ItemMotivation): FlatDataMap<V2ItemDisorder['data']> | undefined {
        const updates: FlatDataMap<V2ItemDisorder['data']> = {};

        if (oldItem.data.data.disorder === '') {
            return undefined;
        }

        updates['_id'] = foundry.utils.randomID(16);
        updates['name'] = oldItem.data.data.disorder;
        updates['type'] = 'disorder';

        updates['data.crossed.value'] = oldItem.data.data.disorderCured;
        updates['data.description.value'] = oldItem.data.data.description;

        return updates;
    }

    public async updateActor(actor: Actor): Promise<void> {
        const oldActor = actor as unknown as V1Actor;
        if (oldActor.data.data.schemaVersion !== 1) {
            return;
        }
        if (actor.data.type !== 'agent') {
            return;
        }

        const newData: Record<string, any> = flattenObject(this.getActorUpdates(oldActor));

        newData[`data.biography.-=sex`] = null;
        newData[`data.statistics.-=cha`] = null;
        newData[`data.statistics.-=pow`] = null;
        newData[`data.statistics.-=str`] = null;
        newData[`data.statistics.-=dex`] = null;
        newData[`data.statistics.-=int`] = null;
        newData[`data.statistics.-=con`] = null;
        newData[`data.-=skills`] = null;
        newData[`data.-=typedSkills`] = null;
        newData[`data.-=wp`] = null;
        newData[`data.-=physical`] = null;
        newData[`data.health.-=min`] = null;
        newData[`data.health.-=max`] = null;
        newData[`data.health.-=protection`] = null;
        newData[`data.sanity.-=min`] = null;
        newData[`data.sanity.-=max`] = null;
        newData[`data.sanity.-=currentBreakingPoint`] = null;
        newData[`data.-=physicalDescription`] = null;

        const newItems: Record<string, any>[] = this.getActorSkills(oldActor);
        const itemUpdates: Record<string, any>[] = [];
        for (const oldItem of oldActor.items) {
            itemUpdates.push(this.getItemUpdates(oldItem));
            if (oldItem.data.type === 'motivation') {
                const disorder = this.getDisorderFromMotivation(oldItem as V1ItemMotivation);
                if (disorder !== undefined) {
                    newItems.push(disorder);
                }
            }
        }

        await actor.update(expandObject(newData));
        await actor.updateEmbeddedDocuments('Item', itemUpdates);
        await actor.createEmbeddedDocuments('Item', newItems);
    }

    public async updateItem(item: Item): Promise<Record<string, any>[]> {
        const oldItem = item as unknown as V1Item;
        if (oldItem.data.data.schemaVersion !== 1) {
            return [];
        }

        const newData: Record<string, any> = flattenObject(this.getItemUpdates(oldItem));

        newData[`data.biography.-=sex`] = null;
        newData[`data.statistics.-=cha`] = null;

        let newItems: Record<string, any>[] = [];
        if (oldItem.data.type === 'motivation') {
            const disorder = this.getDisorderFromMotivation(oldItem as V1ItemMotivation);
            if (disorder !== undefined) {
                newItems.push(disorder);
            }
        }

        await item.update(this.getItemUpdates(oldItem));

        return newItems;
    }

    public async updateCompendium(compendium: CompendiumCollection<CompendiumCollection.Metadata>) {
        const entities = (await compendium.getDocuments()) as Actor[] | Item[];
        for (const entity of entities) {
            if (['agent', 'npc', 'unnatural'].includes(entity.data.type)) {
                await this.updateActor(entity as Actor);
            } else if (['weapon', 'armor', 'motivation', 'bond', 'gear'].includes(entity.data.type)) {
                await this.updateItem(entity as Item);
            }
        }
    }

    public async updateItemDirectory() {
        for (let item of game.items!) {
        }
    }
    public async updateActorDirectory() {
        for (let actor of game.actors!) {
            await this.updateActor(actor);
        }
    }
    public async updateCompendiums() {
        for (const compendium of game.packs) {
            await compendium.configure({ locked: false });

            await this.updateCompendium(compendium);

            await compendium.configure({ locked: false });
        }
    }

    public shouldRun(): boolean {
        return SystemSettings.get(SystemSetting.SchemaVersion) === 1;
    }

    public async _run() {
        await this.updateItemDirectory();
        await this.updateActorDirectory();
        await this.updateCompendiums();
    }
}
