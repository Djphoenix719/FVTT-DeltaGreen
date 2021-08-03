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
import { AgentSheet } from './sheet/AgentSheet';
import { Agent } from './actor/Agent';

function registerEntities() {
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, AgentSheet, {
        label: 'Agent',
        types: ['agent'],
        makeDefault: true,
    });

    CONFIG.Actor.documentClass = Agent;
}

Hooks.on('init', async () => {
    await registerHandlebarsTemplatesAndPartials();
    registerEntities();
});

Hooks.on('ready', async () => {
    await game.actors?.getName('Test Agent')?.delete();
    await Actor.create({ name: 'Test Agent', type: 'agent', img: 'worlds/delta-green/mcmurtry.jpg' });
    await game.actors?.getName('Test Agent')?.sheet?.render(true);
});
