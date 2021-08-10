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
        'stats-field': 'templates/actor/partials/StatsField.html',
        'labeled-field': 'templates/actor/partials/LabeledField.html',
        'actor-statistics': 'templates/actor/tabs/Statistics.html',
    };

    const templates: TemplatePath[] = [
        `templates/actor/Agent.html`,

        `templates/actor/tabs/Attributes.html`,
        `templates/actor/tabs/Biography.html`,
        `templates/actor/tabs/Inventory.html`,
        `templates/actor/tabs/Miscellaneous.html`,
        `templates/actor/tabs/Psychological.html`,
        `templates/actor/tabs/SkillsList.html`,

        `templates/item/Gear.html`,
        `templates/item/Weapon.html`,
        `templates/item/Armor.html`,

        ...Object.values(partials),
    ];

    for (const [name, path] of Object.entries(partials)) {
        Handlebars.registerPartial(name, `{{> ${templatePath(path)} }}`);
    }

    await loadTemplates(templates.map(templatePath));
    registerHelpers();
}

export function registerHelpers() {
    Handlebars.registerHelper('ifgt', function (this: any, a: any, b: any, options: Handlebars.HelperOptions) {
        if (typeof a === 'number' && typeof b === 'number' && a > b) {
            return options.fn(this);
        } else {
            return options.inverse !== undefined ? options.inverse(this) : undefined;
        }
    });

    Handlebars.registerHelper('enrichHTML', (content: string) => {
        return TextEditor.enrichHTML(content);
    });

    Handlebars.registerHelper('getItemName', (id: string, actor: Actor) => {
        return actor.items.get(id)?.name;
    });
}
