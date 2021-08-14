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

import { DGActor } from './actor/DGActor';

export const createTestDocuments = async () => {
    createTestActor();
    createTestItem();
};

export const createTestActor = async () => {
    setTimeout(async () => {
        await game.actors?.getName('Test Agent')?.delete();
        const actor = (await Actor.create({
            name: 'Test Agent',
            type: 'agent',
            img: 'worlds/delta-green/mcmurtry.jpg',
            permission: { default: 2 },
        })) as DGActor;

        await game.actors?.getName('Test Agent')?.sheet?.render(true);

        await actor.createEmbeddedDocuments('Item', [
            {
                type: 'weapon',
                name: 'Example Weapon 1',
                data: {
                    lethality: {
                        value: 25,
                    },
                    skill: {
                        value: 'rfrdw98rykpr84ca',
                    },
                    description: {
                        value: 'Example Weapon w/ Description',
                    },
                },
            },
            {
                type: 'weapon',
                name: 'Example Weapon 2',
                data: {
                    ammo: {
                        value: 30,
                        max: 30,
                    },
                    skill: {
                        value: '06s5h4abkvl8nx0c',
                    },
                    description: {
                        value: 'Example Weapon w/ Description 2',
                    },
                },
            },
            {
                type: 'weapon',
                name: 'Example Weapon 3',
                data: {
                    ammo: {
                        value: 15,
                        max: 30,
                    },
                    damage: {
                        value: '8d4',
                    },
                    description: {
                        value: 'Example Weapon w/ Description 3',
                    },
                },
            },
            {
                type: 'armor',
                name: 'Example Armor 1',
                data: {
                    armorRating: {
                        value: 3,
                    },
                    description: {
                        value: 'Example Armor w/ Description 1',
                    },
                },
            },
            {
                type: 'gear',
                name: 'Example Gear 1',
                data: {
                    description: {
                        value: 'Example Gear w/ Description 1',
                    },
                },
            },
            {
                type: 'bond',
                name: 'Example Bond 1',
                data: {
                    score: {
                        value: 15,
                    },
                    description: {
                        value: 'Example Bond w/ Description 1',
                    },
                },
            },
        ]);
    }, 250);
};
export const createTestItem = async () => {
    // await game.items?.getName('Test Gear')?.delete();
    // await Item.create({ name: 'Test Gear', type: 'weapon', img: 'icons/equipment/chest/breastplate-metal-pieced-grey-02.webp' });
    // await game.items?.getName('Test Gear')?.sheet?.render(true);
};