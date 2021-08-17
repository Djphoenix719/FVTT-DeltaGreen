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

import { AgentDataProperties, DGAgent } from '../../actor/DGAgent';
import { StatisticType, UNNATURAL_ID } from '../../../types/Constants';
import { Value } from '../../../types/Helpers';
import { DGSkill } from '../../item/DGSkill';

interface Updatable {
    update(data: Record<string, any>): Promise<void>;
    delete(): Promise<void>;
}
interface V100Agent extends Updatable {
    items: Map<string, V100Item>;
    data: {
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
interface V100NPC extends Updatable {
    items: Map<string, V100Item>;
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
interface V100Unnatural extends Updatable {
    items: Map<string, V100Item>;
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
type V100Actor = V100Agent | V100NPC | V100Unnatural;

interface V100ItemWeapon extends Updatable {
    data: {
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
interface V100ItemArmor extends Updatable {
    data: {
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
interface V100ItemMotivation extends Updatable {
    data: {
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
interface V100ItemBond extends Updatable {
    data: {
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
interface V100ItemGear extends Updatable {
    data: {
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
type V100Item = V100ItemWeapon | V100ItemArmor | V100ItemMotivation | V100ItemBond | V100ItemGear;

export class Migrate_v1v2 {
    public async updateScene(scene: Scene) {}

    public async convertActor(oldActor: V100Actor) {
        console.warn(`Converting actor: "${oldActor.data.name}"`);
        switch (oldActor.data.type) {
            case 'agent':
                return this.convertAgent(oldActor as V100Agent);
            case 'npc':
                return this.convertNPC(oldActor as V100NPC);
            case 'unnatural':
                return this.convertUnnatural(oldActor as V100Unnatural);
        }
    }
    public async convertAgent(oldActor: V100Agent) {
        const updateData: DeepPartial<AgentDataProperties> = {};
        updateData.type = 'agent';
        updateData.data = {};

        updateData.data.health = {
            value: oldActor.data.data.health.value,
        };

        updateData.data.statistics = {
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

        updateData.data.biography = {
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

        updateData.data.sanity = {
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

        const newSkills: DGSkill[] = [];
        const allSkills = mergeObject(oldActor.data.data.skills, oldActor.data.data.typedSkills);
        for (const [oldKey, oldSkill] of Object.entries(allSkills)) {
            let id: string;
            if (oldKey === 'unnatural') {
                id = UNNATURAL_ID;
            } else {
                if (oldSkill.proficiency === 0) {
                    continue;
                }
                id = foundry.utils.randomID(16);
            }

            newSkills.push(
                new DGSkill(
                    {
                        _id: id,
                        type: 'skill',
                        name: oldSkill.label,
                        data: {
                            rating: { value: oldSkill.proficiency },
                            group: { value: '' },
                            canDelete: { value: true },
                            failureImproves: { value: oldSkill.hasOwnProperty('failure') },
                            sessionFailure: { value: oldSkill.failure ?? false },
                        },
                    },
                    {},
                ),
            );
        }

        for (const item of Object.values(oldActor.items)) {
            await this.convertItem(item);
        }

        updateData.data.schemaVersion = 2;

        console.warn('old data');
        console.warn(oldActor);
        console.warn('new data');
        console.warn(newSkills);
        console.warn(updateData);
    }
    public async convertNPC(oldActor: V100NPC) {}
    public async convertUnnatural(oldActor: V100Unnatural) {}

    public async convertItem(oldItem: V100Item) {
        console.info(`Converting item: "${oldItem.data.name}"`);
        switch (oldItem.data.type) {
            case 'weapon':
                return this.convertWeapon(oldItem as V100ItemWeapon);
            case 'armor':
                return this.convertArmor(oldItem as V100ItemArmor);
            case 'motivation':
                return this.convertMotivation(oldItem as V100ItemMotivation);
            case 'bond':
                return this.convertBond(oldItem as V100ItemBond);
            case 'gear':
                return this.convertGear(oldItem as V100ItemGear);
        }
    }
    public async convertWeapon(oldItem: V100ItemWeapon) {}
    public async convertArmor(oldItem: V100ItemArmor) {}
    public async convertMotivation(oldItem: V100ItemMotivation) {}
    public async convertBond(oldItem: V100ItemBond) {}
    public async convertGear(oldItem: V100ItemGear) {}

    public async updateItemDirectory() {
        for (let item of game.items!) {
            const oldItem = item as unknown as V100Item;
            if (oldItem.data.data.hasOwnProperty('schemaVersion')) {
            }
        }
    }
    public async updateActorDirectory() {
        for (let actor of game.actors!) {
            const oldActor = actor as unknown as V100Actor;
        }
    }

    public async run() {}
}
