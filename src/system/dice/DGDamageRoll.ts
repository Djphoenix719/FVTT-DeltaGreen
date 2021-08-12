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

/**
 * A modifier for the target number of a percentile roll.
 */
export interface DGDamageRollPart {
    label: string;
    value: number;
}

/**
 * Data required for a damage roll.
 */
export interface DGDamageRollData {
    /**
     * Label of this entire roll, e.g. "Lethality", "Accounting", "STR", etc...
     */
    label: string;
    /**
     * Base damage formula. Will be overwritten by lethality.
     */
    formula: string;
    /**
     * Percentage chance for lethality (0-100, not 0-1).
     */
    lethality: number;
}

/**
 * Result of a rolled damage die.
 */
export interface DGDamageDieResult {
    /**
     * The size of the damage die.
     */
    size: number;
    /**
     * The value the damage die rolled.
     */
    value: number;
}

export class DGDamageRoll extends Roll<DGDamageRollData> {
    public constructor(data: DGDamageRollData, options?: Roll['options']) {
        let formula = data.formula;
        if (data.lethality > 0) {
            formula = '2d10';
        }

        super(formula, data, options);
    }

    /**
     * Get die values for display in this roll.
     */
    public get results(): DGDamageDieResult[] | undefined {
        if (this.total === undefined) {
            return undefined;
        }

        const values: DGDamageDieResult[] = [];
        for (const group of this.dice) {
            for (const die of group.results) {
                values.push({ size: group.faces, value: die.result });
            }
        }
        return values;
    }
}
