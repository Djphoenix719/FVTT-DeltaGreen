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

import { DEFAULT_SKILLS_DEFINITION, ItemTypeArmor, ItemTypeSkill, UNNATURAL_ID } from '../../types/Constants';
import { DGItem } from '../item/DGItem';
import { ItemType } from '../../types/Item';

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

    /**
     * Get all items of a specific type.
     * @param type
     */
    public getItemsOfType(type: ItemType) {
        return this.items.filter((item) => item.type === type);
    }

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
