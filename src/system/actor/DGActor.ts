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

import { Skill } from '../../types/Actor';
import { CoreSkillType } from '../../types/Constants';

declare global {
    interface DocumentClassConfig {
        Actor: typeof DGActor;
    }
}
export class DGActor extends Actor {
    /**
     * Calculate in-the-moment maximum willpower.
     */
    public get willpowerMax() {
        let value = 0;
        value += this.data.data.statistics.power.value;
        return value;
    }

    /**
     * Calculate in-the-moment maximum health.
     */
    public get healthMax() {
        let value = 0;
        value += this.data.data.statistics.strength.value;
        value += this.data.data.statistics.constitution.value;
        return Math.ceil(value / 2);
    }

    /**
     * Calculate in-the-moment maximum sanity.
     */
    public get sanityMax() {
        return 99 - this.data.data.skills.core.unnatural.value;
    }

    /**
     * Get an in-the-moment listing of all skills, core and custom.
     */
    public get skills() {
        let values: Skill<CoreSkillType | string>[] = [];
        values.push(...Object.values(duplicate(this.data.data.skills.core)));
        values.push(...Object.values(duplicate(this.data.data.skills.custom)));
        return values;
    }

    prepareData() {
        super.prepareData();

        const data = this.data.data;

        data.health.maximum = this.healthMax;
        data.willpower.maximum = this.willpowerMax;
        data.sanity.maximum = this.sanityMax;

        for (const statistic of Object.values(data.statistics)) {
            data.statistics[statistic.id].percentile = statistic.value * 5;
        }
    }
}
