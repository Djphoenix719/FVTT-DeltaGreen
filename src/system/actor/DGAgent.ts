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

import { AdaptationType, UNNATURAL_ID } from '../../types/Constants';
import { DGItem } from '../item/DGItem';
import { DGPercentageRollPart, DGPercentileRoll } from '../dice/DGPercentileRoll';
import { Bounded, Value } from '../../types/Helpers';
import { ActorTypeAgent } from '../../types/Actor';
import { ActorDataSourceData, DGActor } from './DGActor';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

interface AgentDataSourceData extends ActorDataSourceData {}
interface AgentDataPropertiesData extends AgentDataSourceData {}

export interface AgentDataSource {
    type: ActorTypeAgent;
    data: AgentDataSourceData;
}
export interface AgentDataProperties {
    type: ActorTypeAgent;
    data: AgentDataPropertiesData;
}

export class DGAgent extends DGActor {}
export interface DGAgent extends DGActor {
    readonly data: ActorData & AgentDataProperties;
}
