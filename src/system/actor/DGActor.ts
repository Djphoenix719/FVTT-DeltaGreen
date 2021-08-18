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
import { AdaptationType, DEFAULT_SKILLS_DEFINITION, ItemTypeArmor, ItemTypeSkill, StatisticType } from '../../types/Constants';
import { ActorType, ActorTypeAgent, Statistic } from '../../types/Actor';
import { DGSkill } from '../item/DGSkill';

type PreCreateActorOptions = {
    temporary: boolean;
    renderSheet: boolean;
    render: boolean;
};
Hooks.on('preCreateActor', (actor: Actor, args: PreCreateActorOptions, id: string) => {
    if (actor.items.filter((item) => item.type === ItemTypeSkill).length > 0) {
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
}

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
}
export interface DGActor extends Actor {
    readonly data: ActorData;
}
