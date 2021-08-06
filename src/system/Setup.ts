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
import { DGItemSheet } from './item/sheet/DGItemSheet';

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
    Items.registerSheet(SYSTEM_NAME, DGItemSheet, {
        label: 'Weapon',
        types: ['weapon'],
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
    await game.actors?.getName('Test Agent')?.delete();
    await Actor.create({ name: 'Test Agent', type: 'agent', img: 'worlds/delta-green/mcmurtry.jpg' });
    await game.actors?.getName('Test Agent')?.sheet?.render(true);

    await game.items?.getName('Test Gear')?.delete();
    await Item.create({ name: 'Test Gear', type: 'gear', img: '' });
});
