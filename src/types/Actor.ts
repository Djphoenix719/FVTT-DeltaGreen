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

import { ActorTypeAgent, ActorTypeNPC, ActorTypeUnnatural, StatisticType } from './Constants';
import { Label, Value } from './Helpers';
import { AgentDataProperties, AgentDataSource } from '../system/actor/DGAgent';
import { NPCDataProperties, NPCDataSource } from '../system/actor/DGNPC';

export type ActorTypeAgent = typeof ActorTypeAgent;
export type ActorTypeNPC = typeof ActorTypeNPC;
/**
 * @DEPRECATED: Preserved for compatability;
 */
export type ActorTypeUnnatural = typeof ActorTypeUnnatural;

export interface Statistic<T extends StatisticType> extends Value<number>, Label<string> {
    id: T;
    percentile?: number;
}

export type ActorType = ActorTypeAgent | ActorTypeNPC | ActorTypeUnnatural;
export type ActorDataSource = AgentDataSource | NPCDataSource;
export type ActorDataProperties = AgentDataProperties | NPCDataProperties;

declare global {
    interface SourceConfig {
        Actor: ActorDataSource;
    }
    interface DataConfig {
        Actor: ActorDataProperties;
    }
}
