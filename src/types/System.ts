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

import { ItemType, ItemTypeArmor, ItemTypeBond, ItemTypeDisorder, ItemTypeGear, ItemTypeMotivation, ItemTypeSkill, ItemTypeWeapon } from './Item';
import { DGAgent } from '../system/actor/DGAgent';
import { DGItem } from '../system/item/DGItem';
import { DGSkill } from '../system/item/DGSkill';
import { DGBond } from '../system/item/DGBond';
import { DGMotivation } from '../system/item/DGMotivation';
import { DGDisorder } from '../system/item/DGDisorder';
import { DGGear } from '../system/item/DGGear';
import { DGArmor } from '../system/item/DGArmor';
import { DGWeapon } from '../system/item/DGWeapon';
import { ActorType, ActorTypeAgent } from './Actor';
import { DGActor } from '../system/actor/DGActor';


interface TypeMapEntry<TType, TItem> {
    type: TType;
    cls: TItem;
}
type TypeMap<TType extends string, TItem> = {
    [TValue in TType]: TypeMapEntry<TValue, TItem>;
};
export interface ItemTypeMap extends TypeMap<ItemType, typeof DGItem> {
    skill: {
        type: ItemTypeSkill;
        cls: typeof DGSkill;
    };
    bond: {
        type: ItemTypeBond;
        cls: typeof DGBond;
    };
    motivation: {
        type: ItemTypeMotivation;
        cls: typeof DGMotivation;
    };
    disorder: {
        type: ItemTypeDisorder;
        cls: typeof DGDisorder;
    };
    gear: {
        type: ItemTypeGear;
        cls: typeof DGGear;
    };
    armor: {
        type: ItemTypeArmor;
        cls: typeof DGArmor;
    };
    weapon: {
        type: ItemTypeWeapon;
        cls: typeof DGWeapon;
    };
}
export interface ActorTypeMap extends TypeMap<ActorType, typeof DGActor> {
    agent: {
        type: ActorTypeAgent;
        cls: typeof DGAgent;
    };
}

declare global {
    interface CONFIG {
        DG: {
            Item: {
                documentClasses: {
                    [T in ItemType]: ItemTypeMap[T]['cls'];
                };
            };
            Actor: {
                documentClasses: {
                    [T in ActorType]: ActorTypeMap[T]['cls'];
                };
            };
        };
    }
    interface DocumentClassConfig {
        Actor: typeof DGAgent;
        Item: typeof DGItem;
    }
}
