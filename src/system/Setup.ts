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

import { registerHandlebarsTemplatesAndPartials } from './Handlebars';
import { SYSTEM_NAME } from './Constants';
import { DGActor } from './actor/DGActor';
import { DGActorSheet } from './actor/sheet/DGActorSheet';
import { DGItem } from './item/DGItem';
import { DGGearSheet } from './item/sheet/DGGearSheet';
import { DGArmorSheet } from './item/sheet/DGArmorSheet';
import { DGWeaponSheet } from './item/sheet/DGWeaponSheet';
import { DGSkillSheet } from './item/sheet/DGSkillSheet';

function registerActorClasses() {
    Actors.unregisterSheet('core', ActorSheet);

    Actors.registerSheet(SYSTEM_NAME, DGActorSheet, {
        label: 'Agent',
        types: ['agent'],
        makeDefault: true,
    });

    CONFIG.Actor.documentClass = DGActor;
}
function registerItemClasses() {
    Items.unregisterSheet('core', ItemSheet);

    Items.registerSheet(SYSTEM_NAME, DGGearSheet, {
        label: 'Gear',
        types: ['gear'],
        makeDefault: true,
    });

    Items.registerSheet(SYSTEM_NAME, DGArmorSheet, {
        label: 'Armor',
        types: ['armor'],
        makeDefault: true,
    });

    Items.registerSheet(SYSTEM_NAME, DGWeaponSheet, {
        label: 'Weapon',
        types: ['weapon'],
        makeDefault: true,
    });

    Items.registerSheet(SYSTEM_NAME, DGSkillSheet, {
        label: 'Skill',
        types: ['skill'],
        makeDefault: true,
    });

    CONFIG.Item.documentClass = DGItem;
}

Hooks.on('init', async () => {
    await registerHandlebarsTemplatesAndPartials();
    registerActorClasses();
    registerItemClasses();
});

Hooks.on('ready', async () => {
    setTimeout(async () => {
        await game.actors?.getName('Test Agent')?.delete();
        await Actor.create({ name: 'Test Agent', type: 'agent', img: 'worlds/delta-green/mcmurtry.jpg' });
        await game.actors?.getName('Test Agent')?.sheet?.render(true);

        const actor = game.actors?.getName('Test Agent') as DGActor;
        const item = await actor.createEmbeddedDocuments('Item', [
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
                        maximum: 30,
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
                        maximum: 30,
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
        ]);

        await game.items?.getName('Test Gear')?.delete();
        // await Item.create({ name: 'Test Gear', type: 'weapon', img: 'icons/equipment/chest/breastplate-metal-pieced-grey-02.webp' });
        // await game.items?.getName('Test Gear')?.sheet?.render(true);
    }, 250);
});

CONFIG.debug.hooks = true;
