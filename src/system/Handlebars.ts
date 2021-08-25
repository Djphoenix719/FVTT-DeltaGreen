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

import { SYSTEM_NAME } from './Constants';

type TemplatePath = `static/templates/${string}`;
export async function registerHandlebarsTemplatesAndPartials() {
    const templatePath = (relative: TemplatePath) => `systems/${SYSTEM_NAME}/${relative}`;

    const partials: Record<string, TemplatePath> = {
        'li-weapon-agent': 'static/templates/actor/agent/partial/inventory/ListItemWeapon.html',
        'li-armor-agent': 'static/templates/actor/agent/partial/inventory/ListItemArmor.html',
        'li-gear-agent': 'static/templates/actor/agent/partial/inventory/ListItemGear.html',
        'li-bond-agent': 'static/templates/actor/agent/partial/psychological/ListItemBond.html',
        'li-disorder-agent': 'static/templates/actor/agent/partial/psychological/ListItemDisorder.html',
        'li-motivation-agent': 'static/templates/actor/agent/partial/psychological/ListItemMotivation.html',
        'li-skill-agent': 'static/templates/actor/agent/partial/skill/ListItemSkill.html',
        'list-adaptation': 'static/templates/actor/agent/partial/psychological/Adaptation.html',

        'li-weapon-npc': 'static/templates/actor/npc/partial/inventory/ListItemWeapon.html',
        'li-armor-npc': 'static/templates/actor/npc/partial/inventory/ListItemArmor.html',
        'li-gear-npc': 'static/templates/actor/npc/partial/inventory/ListItemGear.html',
        'li-bond-npc': 'static/templates/actor/npc/partial/psychological/ListItemBond.html',
        'li-disorder-npc': 'static/templates/actor/npc/partial/psychological/ListItemDisorder.html',
        'li-motivation-npc': 'static/templates/actor/npc/partial/psychological/ListItemMotivation.html',
        'li-skill-npc': 'static/templates/actor/npc/partial/skill/ListItemSkill.html',
        'li-ability-npc': 'static/templates/actor/npc/partial/ability/ListItemAbility.html',
    };

    const templates: TemplatePath[] = [
        `static/templates/actor/agent/AgentSheet.html`,
        `static/templates/actor/agent/tabs/Attributes.html`,
        `static/templates/actor/agent/tabs/Biography.html`,
        `static/templates/actor/agent/tabs/Inventory.html`,
        `static/templates/actor/agent/tabs/Psychological.html`,
        `static/templates/actor/agent/tabs/SkillsList.html`,
        `static/templates/actor/agent/tabs/Statistics.html`,
        `static/templates/actor/agent/tabs/Description.html`,

        `static/templates/actor/npc/NPCSheet.html`,
        `static/templates/actor/npc/tabs/SkillsList.html`,
        `static/templates/actor/npc/tabs/Statistics.html`,
        `static/templates/actor/npc/tabs/Attributes.html`,
        `static/templates/actor/npc/tabs/Psychological.html`,
        `static/templates/actor/npc/tabs/Inventory.html`,
        `static/templates/actor/npc/tabs/Abilities.html`,

        `static/templates/item/GearSheet.html`,
        `static/templates/item/WeaponSheet.html`,
        `static/templates/item/ArmorSheet.html`,
        `static/templates/item/BondSheet.html`,
        `static/templates/item/SkillSheet.html`,
        `static/templates/item/AbilitySheet.html`,
        `static/templates/item/partial/PhysicalItemCommon.html`,

        ...Object.values(partials),
    ];

    for (const [name, path] of Object.entries(partials)) {
        Handlebars.registerPartial(name, `{{> ${templatePath(path)} }}`);
    }

    await loadTemplates(templates.map(templatePath));
    registerHelpers();
}

export function registerHelpers() {
    Handlebars.registerHelper('enrichHTML', (content: string) => {
        return TextEditor.enrichHTML(content);
    });
}
