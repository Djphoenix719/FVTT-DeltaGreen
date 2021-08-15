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
import { DGBondSheet } from './item/sheet/DGBondSheet';
import { DGMotivationSheet } from './item/sheet/DGMotivationSheet';
import { DGDisorderSheet } from './item/sheet/DGDisorderSheet';
import { registerChatHooks } from './Chat';
import { DGPercentileRoll } from './dice/DGPercentileRoll';
import { DGDamageRoll } from './dice/DGDamageRoll';
import { CorruptionTracker } from './app/CorruptionTracker';
import { improveSkills } from './macro/ImproveSkills';
import { createTestDocuments } from './TestData';
import { DGArmor } from './item/DGArmor';
import { DGBond } from './item/DGBond';
import { DGDisorder } from './item/DGDisorder';
import { DGGear } from './item/DGGear';
import { DGMotivation } from './item/DGMotivation';
import { DGSkill } from './item/DGSkill';
import { DGWeapon } from './item/DGWeapon';

function registerDiceClasses() {
    CONFIG.Dice.rolls.push(DGPercentileRoll);
    CONFIG.Dice.rolls.push(DGDamageRoll);
}

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
    Items.registerSheet(SYSTEM_NAME, DGBondSheet, {
        label: 'Bond',
        types: ['bond'],
        makeDefault: true,
    });
    Items.registerSheet(SYSTEM_NAME, DGMotivationSheet, {
        label: 'Motivation',
        types: ['motivation'],
        makeDefault: true,
    });
    Items.registerSheet(SYSTEM_NAME, DGDisorderSheet, {
        label: 'Disorder',
        types: ['disorder'],
        makeDefault: true,
    });
    CONFIG.Item.documentClass = DGItem;
    CONFIG.DG = {
        Item: {
            documentClasses: {
                armor: DGArmor,
                bond: DGBond,
                disorder: DGDisorder,
                gear: DGGear,
                motivation: DGMotivation,
                skill: DGSkill,
                weapon: DGWeapon,
            },
        },
    };
}

Hooks.on('init', async () => {
    await registerHandlebarsTemplatesAndPartials();
    registerActorClasses();
    registerItemClasses();
    registerChatHooks();
    registerDiceClasses();

    Hooks.on('getSceneControlButtons', CorruptionTracker.getSceneControlButtons);

    (game as any)['DG'] = {
        improveSkills,
    };
});

Hooks.on('ready', async () => {
    createTestDocuments();
});

CONFIG.debug.hooks = true;
