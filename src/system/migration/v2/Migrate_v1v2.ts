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

import { Bounded, Label, Max, Value } from '../../../types/Helpers';
import { ExpenseType } from '../../../types/Constants';

interface Updatable {
    update(data: Record<string, any>): Promise<void>;
    delete(): Promise<void>;
}
interface V1Agent extends Updatable {
    items: Collection<V1Item>;
    data: {
        _id: string;
        type: 'agent';
        name: string;

        data: {
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
                [T in string]: {
                    label: string;
                    proficiency: number;
                    failure: boolean;
                };
            };

            typedSkills: {
                [T in string]: {
                    label: string;
                    group: string;
                    proficiency: number;
                    failure: boolean;
                };
            };

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
        };
    };
}
interface V1NPC extends Updatable {
    items: Collection<V1Item>;
    data: {
        type: 'npc';
        name: string;

        data: {
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
                [T in string]: {
                    label: string;
                    proficiency: number;
                    failure: boolean;
                };
            };

            typedSkills: {
                [T in string]: {
                    label: string;
                    group: string;
                    proficiency: number;
                    failure: boolean;
                };
            };

            sanity: {
                value: number;
                currentBreakingPoint: number;
            };

            notes: string;
            shortDescription: string;
            showUntrainedSkills: boolean;
        };
    };
}
interface V1Unnatural extends Updatable {
    items: Collection<V1Item>;
    data: {
        type: 'unnatural';
        name: string;
        items: any[];

        data: {
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
                [T in string]: {
                    label: string;
                    proficiency: number;
                    failure: boolean;
                };
            };

            typedSkills: {
                [T in string]: {
                    label: string;
                    group: string;
                    proficiency: number;
                    failure: boolean;
                };
            };

            sanity: {
                notes: string;
                failedLoss: string;
                successLoss: string;
            };

            notes: string;
            shortDescription: string;
            showUntrainedSkills: boolean;
        };
    };
}
type V1Actor = V1Agent | V1NPC | V1Unnatural;

interface V1ItemWeapon extends Updatable {
    data: {
        _id: string;
        type: 'weapon';
        name: string;

        data: {
            name: string;
            description: string;
            skill: string;
            range: string;
            damage: string;
            armorPiercing: number;
            lethality: number;
            isLethal: boolean;
            killRadius: string;
            ammo: string;
            expense: string;
            equipped: boolean;
        };
    };
}
interface V1ItemArmor extends Updatable {
    data: {
        _id: string;
        name: string;
        type: 'armor';

        data: {
            name: string;
            description: string;
            protection: number;
            equipped: boolean;
            expense: string;
        };
    };
}
interface V1ItemMotivation extends Updatable {
    data: {
        _id: string;
        name: string;
        type: 'motivation';

        data: {
            name: string;
            description: string;
            disorder: string;
            crossedOut: boolean;
            disorderCured: boolean;
        };
    };
}
interface V1ItemBond extends Updatable {
    data: {
        _id: string;
        name: string;
        type: 'bond';

        data: {
            name: string;
            description: string;
            relationship: string;
            score: number;
        };
    };
}
interface V1ItemGear extends Updatable {
    data: {
        _id: string;
        name: string;
        type: 'gear';

        data: {
            name: string;
            description: string;
            equipped: true;
            expense: string;
        };
    };
}
type V1Item = V1ItemWeapon | V1ItemArmor | V1ItemMotivation | V1ItemBond | V1ItemGear;

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
interface Statistic<T extends StatisticType> extends Value<number>, Label<string> {
    id: T;
    percentile?: number;
}

interface V2Agent extends Updatable {
    type: 'agent';
    name: string;

    data: {
        schemaVersion: number;
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
    };
}

type ActorUpdates = DeepPartial<V2Agent>;
interface ActorConversionResult {
    actorUpdates: Record<string, any>;
    itemUpdates: Record<string, any>[];
}

export class Migrate_v1v2 {
    public async updateScene(scene: Scene) {}

    public getActorUpdates(oldActor: V1Actor): ActorUpdates {
        console.warn(`Converting actor: "${oldActor.data.name}"`);
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

    public getAgentUpdates(oldActor: V1Agent): ActorUpdates {
        const actorUpdates: DeepPartial<V2Agent> = {};

        actorUpdates.data = {};

        actorUpdates.data.health = {
            value: oldActor.data.data.health.value,
        };

        actorUpdates.data.willpower = {
            value: oldActor.data.data.wp.value,
            max: oldActor.data.data.wp.min,
        };

        actorUpdates.data.statistics = {
            [StatisticType.Strength]: {
                id: StatisticType.Strength,
                value: oldActor.data.data.statistics.str.value,
                label: 'DG.STATISTICS.strength',
            },
            [StatisticType.Charisma]: {
                id: StatisticType.Charisma,
                value: oldActor.data.data.statistics.cha.value,
                label: 'DG.STATISTICS.charisma',
            },
            [StatisticType.Constitution]: {
                id: StatisticType.Constitution,
                value: oldActor.data.data.statistics.con.value,
                label: 'DG.STATISTICS.constitution',
            },
            [StatisticType.Dexterity]: {
                id: StatisticType.Dexterity,
                value: oldActor.data.data.statistics.dex.value,
                label: 'DG.STATISTICS.dexterity',
            },
            [StatisticType.Power]: {
                id: StatisticType.Power,
                value: oldActor.data.data.statistics.pow.value,
                label: 'DG.STATISTICS.power',
            },
            [StatisticType.Intelligence]: {
                id: StatisticType.Intelligence,
                value: oldActor.data.data.statistics.int.value,
                label: 'DG.STATISTICS.intelligence',
            },
        };

        actorUpdates.data.biography = {
            profession: { value: oldActor.data.data.biography.profession },
            employer: { value: oldActor.data.data.biography.employer },
            nationality: { value: oldActor.data.data.biography.nationality },
            gender: { value: oldActor.data.data.biography.sex },
            age: { value: oldActor.data.data.biography.age },
            education: { value: oldActor.data.data.biography.education },
            appearance: { value: oldActor.data.data.physical.description },
            notes: { value: oldActor.data.data.physical.wounds },
        };

        const violence = [
            oldActor.data.data.sanity.adaptations.violence.incident1,
            oldActor.data.data.sanity.adaptations.violence.incident2,
            oldActor.data.data.sanity.adaptations.violence.incident3,
        ];
        const violenceAdapted = !violence.some((v) => !v);
        const helplessness = [
            oldActor.data.data.sanity.adaptations.helplessness.incident1,
            oldActor.data.data.sanity.adaptations.helplessness.incident2,
            oldActor.data.data.sanity.adaptations.helplessness.incident3,
        ];
        const helplessnessAdapted = !helplessness.some((v) => !v);

        actorUpdates.data.sanity = {
            value: oldActor.data.data.sanity.value,
            adaptations: {
                violence: {
                    adapted: violenceAdapted,
                    value: violence,
                },
                helplessness: {
                    adapted: helplessnessAdapted,
                    value: helplessness,
                },
            },
        };

        actorUpdates.data.schemaVersion = 2;

        return actorUpdates;
    }
    public getNPCUpdates(oldActor: V1NPC): ActorUpdates {
        throw new Error('');
    }
    public getUnnaturalUpdates(oldActor: V1Unnatural): ActorUpdates {
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

            skills.push({
                _id: id,
                name: skillData.label,
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
    public getWeaponUpdates(oldItem: V1ItemWeapon): Record<string, any> {
        const updates: Record<string, any> = {};
        updates['_id'] = oldItem.data._id;

        // expense: Value<ExpenseType>;
        // equipped: Value<boolean>;
        // carried: Value<boolean>;
        // description: Value<string>;

        // skill: Value<string>;
        // range: Value<number>;
        // damage: Value<string>;
        // armorPiercing: Value<number>;
        // lethality: Value<number>;
        // killRadius: Value<number>;
        // ammo: Value<number> & Max<number>;

        updates['data.expense.value'] = oldItem.data.data.expense;
        updates['data.equipped.value'] = oldItem.data.data.equipped;
        updates['data.carried.value'] = true;
        updates['data.description.value'] = oldItem.data.data.description;

        updates['data.skill.value'] = oldItem.data.data.skill;
        updates['data.range.value'] = oldItem.data.data.range;
        updates['data.damage.value'] = oldItem.data.data.damage;
        updates['data.armorPiercing.value'] = oldItem.data.data.armorPiercing;
        updates['data.lethality.value'] = oldItem.data.data.lethality;
        updates['data.killRadius.value'] = oldItem.data.data.killRadius;
        updates['data.ammo.value'] = oldItem.data.data.ammo;
        updates['data.ammo.max'] = oldItem.data.data.ammo;

        updates['data.-=name'] = null;
        updates['data.-=isLethal'] = null;

        return updates;
    }
    public getArmorUpdates(oldItem: V1ItemArmor): Record<string, any> {
        const updates: Record<string, any> = {};
        updates['_id'] = oldItem.data._id;

        // expense: Value<ExpenseType>;
        // equipped: Value<boolean>;
        // carried: Value<boolean>;
        // description: Value<string>;

        // armorRating: Value<number>;

        updates['data.expense.value'] = oldItem.data.data.expense;
        updates['data.equipped.value'] = oldItem.data.data.equipped;
        updates['data.carried.value'] = true;
        updates['data.description.value'] = oldItem.data.data.description;

        updates['data.armorRating.value'] = oldItem.data.data.protection;

        updates['data.-=name'] = null;
        updates['data.-=protection'] = null;

        return updates;
    }
    public getGearUpdates(oldItem: V1ItemGear): Record<string, any> {
        const updates: Record<string, any> = {};
        updates['_id'] = oldItem.data._id;

        // expense: Value<ExpenseType>;
        // equipped: Value<boolean>;
        // carried: Value<boolean>;
        // description: Value<string>;

        updates['data.expense.value'] = oldItem.data.data.expense;
        updates['data.equipped.value'] = oldItem.data.data.equipped;
        updates['data.carried.value'] = true;
        updates['data.description.value'] = oldItem.data.data.description;

        updates['data.-=name'] = null;

        return updates;
    }
    public getMotivationUpdates(oldItem: V1ItemMotivation): Record<string, any> {
        const updates: Record<string, any> = {};
        updates['_id'] = oldItem.data._id;

        // description: Value<string>;
        // crossed: Value<boolean>;

        updates['data.crossed.value'] = oldItem.data.data.crossedOut;
        updates['data.description.value'] = oldItem.data.data.description;

        updates['data.-=name'] = null;
        updates['data.-=crossedOut'] = null;
        updates['data.-=disorder'] = null;
        updates['data.-=disorderCured'] = null;

        return updates;
    }
    public getDisorderUpdates(oldItem: V1ItemMotivation): Record<string, any> | undefined {
        const updates: Record<string, any> = {};

        if (oldItem.data.data.disorder === '') {
            return undefined;
        }

        updates['_id'] = foundry.utils.randomID(16);
        updates['name'] = oldItem.data.data.disorder;
        updates['type'] = 'disorder';

        // description: Value<string>;
        // crossed: Value<boolean>;

        updates['data.crossed.value'] = oldItem.data.data.disorderCured;
        updates['data.description.value'] = oldItem.data.data.description;

        return updates;
    }
    public getBondUpdates(oldItem: V1ItemBond): Record<string, any> {
        const updates: Record<string, any> = {};
        updates['_id'] = oldItem.data._id;

        return updates;
    }

    public async updateItemDirectory() {
        for (let item of game.items!) {
            const oldItem = item as unknown as V1Item;
            const version: number = (oldItem.data.data as any).schemaVersion ?? 1;
            if (version !== 1) {
                continue;
            }

            await this.getItemUpdates(oldItem);
        }
    }
    public async updateActorDirectory() {
        for (let actor of game.actors!) {
            const oldActor = actor as unknown as V1Actor;
            const version: number = oldActor.data.data.schemaVersion ?? 1;
            if (version !== 1) {
                console.warn(`Actor "${actor.name}" does not require updating`);
                continue;
            }

            if (actor.data.type !== 'agent') {
                continue;
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

            let itemUpdates: Record<string, any>[] = [];
            for (const oldItem of oldActor.items) {
                itemUpdates.push(this.getItemUpdates(oldItem));
                if (oldItem.data.type === 'motivation') {
                    const disorder = this.getDisorderUpdates(oldItem as V1ItemMotivation);
                    if (disorder !== undefined) {
                        newItems.push(disorder);
                    }
                }
            }

            console.warn(newItems);
            console.warn(itemUpdates);

            await actor.update(expandObject(newData));
            await actor.updateEmbeddedDocuments('Item', itemUpdates);
            await actor.createEmbeddedDocuments('Item', newItems);
        }
    }

    public async run() {
        // await this.updateItemDirectory();
        await this.updateActorDirectory();
    }
}
