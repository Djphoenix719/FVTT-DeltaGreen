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
import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { DGActor } from '../actor/DGActor';
import { DGContext } from '../../types/Helpers';
import { WeaponDataProperties } from '../../types/Item';

declare global {
    interface DocumentClassConfig {
        Item: typeof DGItem;
    }
}

export class DGItem extends Item {
    constructor(data: ConstructorDataType<ItemData>, context: DGContext<InstanceType<typeof DGActor>>) {
        if (context.dg?.ready) {
            super(data, context);
        } else {
            const ready = { dg: { ready: true } };
            return new CONFIG.DG.Item.documentClasses[data.type](data, { ...context, ...ready });
        }
    }
}
export interface DGItem extends Item {
    readonly data: ItemData;
}
