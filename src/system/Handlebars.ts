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
        'skill-field': 'templates/actor/partials/SkillField.html',
        'stats-field': 'templates/actor/partials/StatsField.html',
        'bounded-value': 'templates/actor/partials/BoundedValue.html',
        'labeled-field': 'templates/actor/partials/LabeledField.html',
        'actor-statistics': 'templates/actor/tabs/Statistics.html',
    };

    const templates: TemplatePath[] = [
        `templates/actor/Agent.html`,
        `templates/actor/tabs/Biography.html`,
        `templates/actor/tabs/Skills.html`,
        ...Object.values(partials),
    ];

    for (const [name, path] of Object.entries(partials)) {
        Handlebars.registerPartial(name, `{{> ${templatePath(path)} }}`);
    }

    await loadTemplates(templates.map(templatePath));
    registerHelpers();
}

export function registerHelpers() {}
