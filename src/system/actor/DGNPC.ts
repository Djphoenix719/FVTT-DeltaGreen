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

import { DGActor } from './DGActor';
import { Bounded, Value } from '../../types/Helpers';
import { AdaptationType, StatisticType } from '../../types/Constants';
import { ActorTypeNPC, Statistic } from '../../types/Actor';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

interface NPCDataSourceData {
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
}
interface NPCDataPropertiesData extends NPCDataSourceData {}

export interface NPCDataSource {
    type: ActorTypeNPC;
    data: NPCDataSourceData;
}
export interface NPCDataProperties {
    type: ActorTypeNPC;
    data: NPCDataPropertiesData;
}

export class DGNPC extends DGActor {}
export interface DGNPC extends DGActor {
    readonly data: ActorData & NPCDataProperties;
}
