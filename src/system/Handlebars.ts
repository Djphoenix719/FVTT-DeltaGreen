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

type TemplatePath = `templates/${string}`;
export async function registerHandlebarsTemplatesAndPartials() {
    const templatePath = (relative: TemplatePath) => `systems/${SYSTEM_NAME}/${relative}`;

    const partials: Record<string, TemplatePath> = {
        'list-item-weapon': 'templates/actor/agent/partial/inventory/ListItemWeapon.html',
        'list-item-armor': 'templates/actor/agent/partial/inventory/ListItemArmor.html',
        'list-item-gear': 'templates/actor/agent/partial/inventory/ListItemGear.html',
        'list-item-bond': 'templates/actor/agent/partial/psychological/ListItemBond.html',
        'list-item-disorder': 'templates/actor/agent/partial/psychological/ListItemDisorder.html',
        'list-item-motivation': 'templates/actor/agent/partial/psychological/ListItemMotivation.html',
        'list-item-skill': 'templates/actor/agent/partial/skill/ListItemSkill.html',
        'list-adaptation': 'templates/actor/agent/partial/psychological/Adaptation.html',
    };

    const templates: TemplatePath[] = [
        `templates/actor/agent/AgentSheet.html`,
        `templates/actor/agent/tabs/Attributes.html`,
        `templates/actor/agent/tabs/Biography.html`,
        `templates/actor/agent/tabs/Inventory.html`,
        `templates/actor/agent/tabs/Miscellaneous.html`,
        `templates/actor/agent/tabs/Psychological.html`,
        `templates/actor/agent/tabs/SkillsList.html`,
        `templates/actor/agent/tabs/Statistics.html`,
        `templates/actor/agent/tabs/Description.html`,

        `templates/actor/npc/NPCSheet.html`,
        `templates/actor/npc/tabs/SkillsList.html`,
        `templates/actor/npc/tabs/Statistics.html`,
        `templates/actor/npc/tabs/Attributes.html`,

        `templates/item/GearSheet.html`,
        `templates/item/WeaponSheet.html`,
        `templates/item/ArmorSheet.html`,
        `templates/item/BondSheet.html`,
        `templates/item/SkillSheet.html`,
        `templates/item/partial/PhysicalItemCommon.html`,

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
