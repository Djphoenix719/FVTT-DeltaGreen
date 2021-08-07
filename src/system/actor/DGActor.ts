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

declare global {
    interface DocumentClassConfig {
        Actor: typeof DGActor;
    }
}
export class DGActor extends Actor {
    public get allSkills() {
        return Object.values(mergeObject(duplicate(this.data.data.skills.core), duplicate(this.data.data.skills.custom)));
    }

    public get willpowerMax() {
        return this.data.data.statistics.power.value;
    }

    public get healthMax() {
        return Math.ceil((this.data.data.statistics.strength.value + this.data.data.statistics.constitution.value) / 2);
    }

    public get sanityMax() {
        return 99 - this.data.data.skills.core.unnatural.value;
    }

    prepareData() {
        super.prepareData();

        const data = this.data.data;

        data.willpower.maximum = this.willpowerMax;
        data.health.maximum = this.healthMax;
        data.sanity.maximum = this.sanityMax;

        for (const statistic of Object.values(data.statistics)) {
            data.statistics[statistic.id].percentile = statistic.value * 5;
        }
    }
}
