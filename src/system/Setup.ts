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

// const testData =
//     'Marionette\n' +
//     'Foot soldiers of Carcosa\n' +
//     'STR 10 CON 20 DEX 10 INT 10 POW 10\n' +
//     'HP 15 WP 10\n' +
//     'ARMOR: See METAL AND PORCELAIN.\n' +
//     '    ATTACKS: Impale 35%, Lethality 10%, Armor Piercing 2\n' +
//     '(see SWARM AND SPIKE).\n' +
//     'ENDLESS EXITS: Marionettes are impossible to trap.\n' +
//     '    Placing one in a room or a box or even burying\n' +
//     'it underground fails to contain it. The moment it is\n' +
//     'unobserved, it returns to Carcosa to continue its work.\n' +
//     '    IMPOSSIBLE GEARS: The construction of each marionette\n' +
//     'is unique and impossible. Anyone examining its\n' +
//     'machinery loses 0/1D4 SAN from the unnatural as\n' +
//     '    they realize it is powered by nothing. Those with Craft\n' +
//     '(Mechanics) at 30%+ or who make a successful roll at\n' +
//     '+20% automatically lose 4 SAN from the unnatural and\n' +
//     'gain +1 Corruption. It should not be able to move at all.\n' +
//     '    METAL AND PORCELAIN: Beneath the costume, each\n' +
//     'marionette is made of metal and porcelain. An attack\n' +
//     'on a marionette that rolls an odd amount of damage\n' +
//     'or with an odd-numbered Lethality roll inflicts only 1\n' +
//     'damage. There is an endless army of marionettes to\n' +
//     'replace any that might be destroyed.\n' +
//     '    SWARM AND SPIKE: To attack, marionettes swarm a\n' +
//     'target and make single impale attack roll. The victim\n' +
//     'can attempt to Dodge or fight back, as usual. If the\n' +
//     'victim loses, they are surrounded and treated as\n' +
//     '    pinned. If the victim is pinned when the marionettes\n' +
//     'next act, the victim suffers a Lethality 10% roll as the\n' +
//     'swarm releases dozens of spring-loaded spikes into the\n' +
//     'victim’s body.\n' +
//     '    SANITY LOSS: 0/1D4 SAN from the unnatural, or 1/1D6\n' +
//     'SAN if the marionette was known in life.';
Hooks.on('ready', async () => {
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

        // static renderSceneControls(controls, html) {
        //     html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
        //         event.preventDefault();
        //         new OverwatchScoreTracker().render(true);
        //     });
        // }
        //
        // static getSceneControlButtons(controls) {
        //     const tokenControls = controls.find((c) => c.name === 'token');
        //
        //     if (game.user?.isGM) {
        //         tokenControls.tools.push({
        //             name: 'overwatch-score-tracker',
        //             title: 'CONTROLS.SR5.OverwatchScoreTracker',
        //             icon: 'fas fa-network-wired',
        //             button: true
        //         });
        //     }
        //
        //     tokenControls.tools.push(EnvModifiersApplication.getControl());
        // }

        // await game.items?.getName('Test Gear')?.delete();
        // await Item.create({ name: 'Test Gear', type: 'weapon', img: 'icons/equipment/chest/breastplate-metal-pieced-grey-02.webp' });
        // await game.items?.getName('Test Gear')?.sheet?.render(true);
    }, 250);
});

// CONFIG.debug.hooks = true;
