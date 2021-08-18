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

import { AdaptationType, DEFAULT_SKILLS_DEFINITION, ItemTypeArmor, ItemTypeSkill, ItemTypeWeapon, StatisticType, UNNATURAL_ID } from '../../types/Constants';
import { DGItem } from '../item/DGItem';
import { ItemType } from '../../types/Item';
import { DGPercentageRollPart, DGPercentileRoll } from '../dice/DGPercentileRoll';
import { DGDamageRoll, DGDamageRollPart } from '../dice/DGDamageRoll';
import { ItemTypeMap } from '../../types/System';
import { Bounded, Value } from '../../types/Helpers';
import { ActorTypeAgent } from '../../types/Actor';
import { ActorDataSourceData, DGActor } from './DGActor';
import { DGSkill } from '../item/DGSkill';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

interface AgentDataSourceData extends ActorDataSourceData {
    sanity: Bounded<number> & {
        breakingPoint: Value<number>;
        adaptations: {
            [TType in AdaptationType]: {
                adapted: boolean;
                value: boolean[];
            };
        };
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
interface AgentDataPropertiesData extends AgentDataSourceData {}

export interface AgentDataSource {
    type: ActorTypeAgent;
    data: AgentDataSourceData;
}
export interface AgentDataProperties {
    type: ActorTypeAgent;
    data: AgentDataPropertiesData;
}

export class DGAgent extends DGActor {
    // <editor-fold desc="Properties">

    /**
     * Calculate in-the-moment max sanity.
     */
    public get sanityMax() {
        let value = 99;
        const skill = this.items.get(UNNATURAL_ID) as DGItem | undefined;
        if (skill && skill.data.type === 'skill') {
            value -= skill.data.data.rating.value ?? 0;
        }
        return value;
    }

    // </editor-fold>

    /**
     * Get all items of a specific type.
     * @param type
     */
    public getItemsOfType<TType extends ItemType>(type: TType): InstanceType<ItemTypeMap[TType]['cls']>[] {
        return this.items.filter((item) => item.type === type) as InstanceType<ItemTypeMap[TType]['cls']>[];
    }

    /**
     * Get the name of a skill.
     * @param id The id of the skill.
     */
    public getSkillName(id: string): string | undefined {
        const skill = this.items.get(id);
        if (skill?.data.type === ItemTypeSkill) {
            return skill.name!;
        }
        return undefined;
    }

    // <editor-fold desc="Rolls">

    /**
     * Roll a skill with a specified name.
     * @param name The name of the skill.
     * @param modifiers Roll modifiers.
     */
    public async rollSkillName(name: string, modifiers: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        const skill = this.items.getName(name);

        if (skill?.data.type === ItemTypeSkill) {
            return this.rollSkill(skill.id!, modifiers);
        }

        throw new Error(`No skill with name of "${name}" found on actor.`);
    }

    /**
     * Roll a skill with a specified id.
     * @param id The id of the skill.
     * @param modifiers Roll modifiers.
     */
    public async rollSkill(id: string, modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        const skill = this.items.get(id);
        if (skill?.data.type === ItemTypeSkill) {
            return new DGPercentileRoll({
                label: skill.name!,
                target: {
                    base: {
                        label: skill.name!,
                        value: skill.data.data.rating.value ?? 0,
                    },
                    parts: modifiers,
                },
            }).roll();
        }

        throw new Error(`No skill with id of "${id}" found on actor.`);
    }

    /**
     * Roll a statistic * 5 check for the actor.
     * @param id The statistic to target.
     * @param modifiers Roll modifiers.
     */
    public async rollStatistic(id: StatisticType, modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        const statistic = this.data.data.statistics[id];
        return new DGPercentileRoll({
            label: statistic.label,
            target: {
                base: {
                    label: statistic.label,
                    value: statistic.value * 5,
                },
                parts: modifiers,
            },
        }).roll();
    }

    /**
     * Roll a sanity check for the actor.
     * @param modifiers Roll modifiers.
     */
    public async rollSanity(modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        return new DGPercentileRoll({
            label: game.i18n.localize(`DG.DICE.sanity`),
            target: {
                base: {
                    label: game.i18n.localize('DG.ATTRIBUTES.sanity'),
                    value: this.data.data.sanity.value,
                },
                parts: modifiers,
            },
        }).roll();
    }

    /**
     * Roll a luck check for the actor.
     * @param modifiers Roll modifiers.
     */
    public async rollLuck(modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        return new DGPercentileRoll({
            label: game.i18n.localize(`DG.DICE.luckCheck`),
            target: {
                base: {
                    label: game.i18n.localize('DG.ATTRIBUTES.luck'),
                    value: this.data.data.luck.value,
                },
                parts: modifiers,
            },
        }).roll();
    }

    /**
     * Roll a weapon's damage.
     * @param id The id of the weapon.
     * @param modifiers Roll modifiers.
     */
    public async rollDamageForWeapon(id: string, modifiers?: DGDamageRollPart[]): Promise<DGDamageRoll> {
        const weapon = this.items.get(id);
        if (weapon?.data.type === ItemTypeWeapon) {
            return new DGDamageRoll({
                label: `${weapon.name!}: ${game.i18n.localize('DG.DICE.damage')}`,
                lethality: weapon.data.data.lethality.value,
                damage: {
                    formula: weapon.data.data.damage.value,
                    parts: modifiers,
                },
            }).roll();
        }

        throw new Error(`No weapon with id of "${id}" found on actor.`);
    }

    /**
     * Roll a weapon's lethality.
     * @param id The id of the weapon.
     * @param modifiers Roll modifiers.
     */
    public async rollLethalityForWeapon(id: string, modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        const weapon = this.items.get(id);
        if (weapon?.data.type === ItemTypeWeapon) {
            return new DGPercentileRoll({
                label: game.i18n.localize('DG.DICE.lethalityCheck'),
                target: {
                    base: {
                        label: game.i18n.localize('DG.ITEM.lethality'),
                        value: weapon.data.data.lethality.value,
                    },
                    parts: modifiers,
                },
            }).roll();
        }

        throw new Error(`No weapon with id of "${id}" found on actor.`);
    }

    // </editor-fold>

    prepareData() {
        super.prepareData();

        const data = this.data.data;

        data.health.max = this.healthMax;
        data.willpower.max = this.willpowerMax;
        data.sanity.max = this.sanityMax;

        for (const statistic of Object.values(data.statistics)) {
            data.statistics[statistic.id].percentile = statistic.value * 5;
        }

        for (const adaptation of Object.values(data.sanity.adaptations)) {
            adaptation.adapted = !adaptation.value.some((value) => !value);
        }
    }
}
export interface DGAgent extends DGActor {
    readonly data: ActorData & AgentDataProperties;
}
