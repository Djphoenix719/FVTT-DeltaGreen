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

import { ActorSkillType } from '../../types/Actor';
import { DGActor } from '../actor/DGActor';

/**
 * Get the correct localization for a skill. Will return the skill localization key or the raw label if it's custom.
 * Unknown/missing skills will return undefined.
 * @param skillId
 * @param actor
 */
export function getSkillLabel(skillId: ActorSkillType | '', actor: DGActor | null): string | undefined {
    if (skillId === '') {
        return undefined;
    }

    if (skillId.startsWith('custom')) {
        return actor?.data.data.skills.custom[skillId]?.label;
    } else {
        return game.i18n.localize(`DG.SKILLS.CORE.${skillId}`);
    }
}
