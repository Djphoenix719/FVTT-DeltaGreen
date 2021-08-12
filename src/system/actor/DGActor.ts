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

import { DEFAULT_SKILLS_DEFINITION, ItemTypeArmor, ItemTypeSkill, StatisticType, UNNATURAL_ID } from '../../types/Constants';
import { DGItem } from '../item/DGItem';
import { ItemType } from '../../types/Item';
import { DGPercentileRoll, DGPercentageRollPart } from '../dice/DGPercentileRoll';
import { DGDamageRoll, DGDamageRollPart } from '../dice/DGDamageRoll';

declare global {
    interface DocumentClassConfig {
        Actor: typeof DGActor;
    }
}

type PreCreateActorOptions = {
    temporary: boolean;
    renderSheet: boolean;
    render: boolean;
};
Hooks.on('preCreateActor', (actor: Actor, args: PreCreateActorOptions, id: string) =>
    actor.data.update({
        items: DEFAULT_SKILLS_DEFINITION.map((skill) => {
            return {
                _id: skill._id,
                name: game.i18n.localize(skill.name),
                type: skill.type,
                data: {
                    ...skill.data,
                    group: game.i18n.localize(skill.data.group),
                },
            };
        }),
    }),
);

export class DGActor extends Actor {
    // <editor-fold desc="Properties">

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
     * Calculate in-the-moment max sanity.
     */
    public get sanityMax() {
        let value = 99;
        const skill = this.items.get(UNNATURAL_ID) as DGItem | undefined;
        if (skill && skill.data.type === 'skill') {
            value -= skill.data.data.value ?? 0;
        }
        return value;
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
     * Get an in-the-moment listing of all skills, core and custom.
     */
    public get skills() {
        return this.items.filter((item) => item.type === ItemTypeSkill);
    }

    /**
     * Get in-the-moment groups of skills as a record of skill arrays.
     */
    public get groupedSkills() {
        let groups: Record<string, DGItem[]> = {};

        for (const item of this.items) {
            if (item.data.type === ItemTypeSkill) {
                const groupId = item.data.data.group;
                groups[groupId] = groups[groupId] ?? [];
                groups[groupId].push(item);
            }
        }

        return groups;
    }

    // </editor-fold>

    /**
     * Get all items of a specific type.
     * @param type
     */
    public getItemsOfType(type: ItemType) {
        return this.items.filter((item) => item.type === type);
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
     * @param modifiers Target modifiers.
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
     * @param modifiers Target modifiers.
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
                        value: skill.data.data.value ?? 0,
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
     * @param modifiers Target modifiers.
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
     * @param modifiers Target modifiers.
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
     * @param modifiers Target modifiers.
     */
    public async rollLuck(modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        return new DGPercentileRoll({
            label: game.i18n.localize(`DG.DICE.luck`),
            target: {
                base: {
                    label: game.i18n.localize('DG.ATTRIBUTES.luck'),
                    value: this.data.data.luck.value,
                },
                parts: modifiers,
            },
        }).roll();
    }

    public async rollDamageForWeapon(modifiers?: DGDamageRollPart[]): Promise<DGDamageRoll> {
        throw new Error();
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
