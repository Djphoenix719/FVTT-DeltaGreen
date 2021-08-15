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
import { DGContext } from '../../types/Helpers';
import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import { BaseActor } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs';

export class DGActor extends Actor {
    constructor(data: ConstructorDataType<ActorData>, context?: DGContext<InstanceType<typeof BaseActor>>) {
        if (context?.dg?.ready) {
            super(data, context);
        } else {
            const ready = { dg: { ready: true } };
            return new CONFIG.DG.Actor.documentClasses[data.type](data, { ...context, ...ready });
        }
    }
}
export interface DGActor extends Actor {}
