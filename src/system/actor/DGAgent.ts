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

    prepareData() {
        super.prepareData();

        const data = this.data.data;

        data.sanity.max = this.sanityMax;

        for (const adaptation of Object.values(data.sanity.adaptations)) {
            adaptation.adapted = !adaptation.value.some((value) => !value);
        }
    }
}
export interface DGAgent extends DGActor {
    readonly data: ActorData & AgentDataProperties;
}
