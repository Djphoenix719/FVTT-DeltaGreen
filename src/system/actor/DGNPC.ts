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

import { ActorDataSourceData, DGActor } from './DGActor';
import { ActorTypeNPC } from '../../types/Actor';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { SYSTEM_NAME } from '../Constants';
import { StatisticType } from '../../types/Constants';
import { DGPercentageRollPart, DGPercentileRoll } from '../dice/DGPercentileRoll';
import { SystemSetting, SystemSettings } from '../SystemSettings';

interface NPCDataSourceData extends ActorDataSourceData {}
interface NPCDataPropertiesData extends NPCDataSourceData {}

export interface NPCDataSource {
    type: ActorTypeNPC;
    data: NPCDataSourceData;
    flags: {
        [SYSTEM_NAME]: {
            editMode: boolean;
            unnatural: boolean;
        };
    };
}
export interface NPCDataProperties {
    type: ActorTypeNPC;
    data: NPCDataPropertiesData;
}

export class DGNPC extends DGActor {
    /**
     * Is this an unnatural NPC?
     */
    public getUnnatural(): boolean {
        return this.getFlag(SYSTEM_NAME, 'unnatural') as boolean;
    }

    /**
     * Set if this actor is unnatural.
     * @param value The unnatural value.
     */
    public async setUnnatural(value: boolean): Promise<DGNPC> {
        return this.setFlag(SYSTEM_NAME, 'unnatural', value);
    }

    public async rollStatistic(id: StatisticType, modifiers?: DGPercentageRollPart[]): Promise<DGPercentileRoll> {
        if (modifiers === undefined) {
            modifiers = [];
        }

        const statistic = this.data.data.statistics[id];

        let critical: number = 1;
        if (SystemSettings.get(SystemSetting.InhumanStatTests) && this.getUnnatural() && statistic.value >= 20) {
            critical = statistic.value;
        }

        return new DGPercentileRoll({
            label: statistic.label ?? '',
            target: {
                base: {
                    label: statistic.label ?? '',
                    value: statistic.value * 5,
                },
                parts: modifiers,
                critical,
            },
        }).roll({ async: true });
    }
}
export interface DGNPC extends DGActor {
    readonly data: ActorData & NPCDataProperties;
}
