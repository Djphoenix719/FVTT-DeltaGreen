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

import { ConstructorDataType } from '@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes';
import { Bounded, DGContext, Value } from '../../types/Helpers';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { BaseActor } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs';
import { AdaptationType, DEFAULT_SKILLS_DEFINITION, ItemTypeArmor, ItemTypeSkill, ItemTypeWeapon, StatisticType, UNNATURAL_ID } from '../../types/Constants';
import { Statistic } from '../../types/Actor';
import { DGSkill } from '../item/DGSkill';
import { ItemType } from '../../types/Item';
import { ItemTypeMap } from '../../types/System';
import { DGPercentageRollPart, DGPercentileRoll } from '../dice/DGPercentileRoll';
import { DGDamageRoll, DGDamageRollPart } from '../dice/DGDamageRoll';
import { DGItem } from '../item/DGItem';

type PreCreateActorOptions = {
    temporary: boolean;
    renderSheet: boolean;
    render: boolean;
};
Hooks.on('preCreateActor', (actor: Actor, args: PreCreateActorOptions, id: string) => {
    if (actor.items.filter((item) => item.type === ItemTypeSkill).length > 0) {
        return;
    }
    if (actor.type === 'npc') {
        return;
    }

    actor.data.update({
        items: DEFAULT_SKILLS_DEFINITION.map((skill) => {
            return {
                _id: skill._id,
                name: game.i18n.localize(skill.name),
                type: skill.type,
                data: {
                    ...skill.data,
                    group: {
                        value: game.i18n.localize(skill.data.group.value),
                    },
                },
            };
        }),
    });
});

export interface ActorDataSourceData {
    health: Bounded<number>;
    willpower: Bounded<number>;
    luck: Value<number>;
    statistics: {
        [TType in StatisticType]: Statistic<TType>;
    };
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

export class DGActor extends Actor {
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
    /**
     * Calculate in-the-moment max willpower.
     */
    public get willpowerMax() {
        let value = 0;
        value += this.data.data.statistics.power.value;
        return value;
    }

    /**
     * Calculate in-the-moment max health.
     */
    public get healthMax() {
        let value = 0;
        value += this.data.data.statistics.strength.value;
        value += this.data.data.statistics.constitution.value;
        return Math.ceil(value / 2);
    }

    /**
     * Calculate in-the-moment equipped armor rating.
     */
    public get armorRating() {
        let value = 0;
        for (const item of this.items) {
            if (item.data.type === ItemTypeArmor) {
                if (!item.data.data.equipped.value) {
                    continue;
                }
                value += item.data.data.armorRating.value;
            }
        }
        return value;
    }

    /**
     * Get in-the-moment groups of skills as a record of skill arrays.
     */
    public get skillGroups() {
        let map: Record<string, DGSkill[]> = {};
        for (const item of this.items) {
            if (item.data.type === ItemTypeSkill) {
                const groupId = item.data.data.group.value;
                map[groupId] = map[groupId] ?? [];
                map[groupId].push(item as DGSkill);
            }
        }

        return map;
    }

    constructor(data: ConstructorDataType<ActorData>, context?: DGContext<InstanceType<typeof BaseActor>>) {
        if (context?.dg?.ready) {
            super(data, context);
        } else {
            const ready = { dg: { ready: true } };
            return new CONFIG.DG.Actor.documentClasses[data.type](data, { ...context, ...ready });
        }
    }

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

    /**
     * Roll a sanity check for the actor.
     * @param modifiers Roll modifiers.
     */
    public async rollSanity(modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        return new DGPercentileRoll({
            label: game.i18n.localize(`DG.DICE.sanityCheck`),
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

    prepareData() {
        super.prepareData();
        const data = this.data.data;

        data.health.max = this.healthMax;
        data.willpower.max = this.willpowerMax;
        data.sanity.max = this.sanityMax;

        for (const adaptation of Object.values(data.sanity.adaptations)) {
            adaptation.adapted = !adaptation.value.some((value) => !value);
        }

        for (const statistic of Object.values(data.statistics)) {
            data.statistics[statistic.id].percentile = statistic.value * 5;
        }
    }
}
export interface DGActor extends Actor {
    readonly data: ActorData;
}
