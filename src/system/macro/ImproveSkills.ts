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

import { ActorTypeAgent, ItemTypeSkill } from '../../types/Constants';

export async function improveSkills() {
    const selected = [...canvas.tokens!.controlled.map((token) => token.actor)];
    if (selected.length === 0 && game.user?.character) {
        selected.push(game.user.character);
    }

    for (const token of canvas.tokens!.controlled) {
        const actor = token.actor;
        if (actor === null) {
            continue;
        }

        const improvements: Record<string, number> = {};
        if (actor.data.type === ActorTypeAgent) {
            for (const item of actor.data.items) {
                if (item.data.type !== ItemTypeSkill) {
                    continue;
                }
                if (!item.data.data.failureImproves) {
                    continue;
                }
                if (!item.data.data.sessionFailure) {
                    continue;
                }

                const amount = await new Roll('1d4').roll({ async: true });
                if (amount.total !== undefined) {
                    await item.update({
                        ['data.value']: (item.data.data.value ?? 0) + amount.total,
                        ['data.sessionFailure']: false,
                    });
                    improvements[item.name!] = amount.total;
                }
            }
        }

        // TODO: Just make this a chat card w/ a CSS file
        let content = `<h3>Skill Improvements</h3><div style="display: flex; flex-direction: column">`;
        content += Object.entries(improvements)
            .map(([k, v]) => {
                return `<div style="display: flex">
                            <label style="flex: 1">${k}</label>
                            <label>+${v}%</label>
                        </div>`;
            })
            .join('\n');
        content += '</div>';

        await ChatMessage.create({
            user: game.user?.id,
            speaker: {
                alias: actor.name,
            },
            content,
        });
    }
}
