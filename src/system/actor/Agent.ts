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

export class Agent extends Actor {
    prepareData() {
        super.prepareData();

        const data = this.data.data;

        data.willpower.maximum = data.statistics.power.value;
        data.health.maximum = Math.ceil((data.statistics.strength.value + data.statistics.constitution.value) / 2);
        data.sanity.maximum = 99 - data.skills.core.unnatural.value;

        for (const statistic of Object.values(data.statistics)) {
            data.statistics[statistic.id].percentile = statistic.value * 5;
        }
    }
}
