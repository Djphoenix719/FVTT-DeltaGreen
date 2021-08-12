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

export enum DamagePartType {
    Add = 'add',
    Multiply = 'multiply',
}

/**
 * A modifier for the target number of a percentile roll.
 */
export interface DGDamageRollPart {
    label: string;
    value: number | string;
    type: DamagePartType;
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
     * Percentage chance for lethality (0-100, not 0-1).
     */
    lethality: number;

    /**
     * Data used to calculate damage.
     */
    damage: {
        /**
         * Base damage formula. Will be overwritten by lethality.
         */
        formula: string;
        /**
         * Gets added to base formula/lethality formula.
         */
        parts?: DGDamageRollPart[];
    };
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
    private static formulaFromParts(base: string, parts: DGDamageRollPart[]): string {
        let formula = base;
        for (const part of parts) {
            switch (part.type) {
                case DamagePartType.Add:
                    formula += `+${part.value}`;
                    break;
                case DamagePartType.Multiply:
                    formula = `(${formula})*${part.value}`;
                    break;
            }
        }
        return formula;
    }

    public constructor(data: DGDamageRollData | string, options?: Roll['options']) {
        if (typeof data === 'string') {
            super(data, undefined, options);
        } else {
            let formula = data.damage.formula;

            if (data.lethality > 0) {
                formula = '2d10';
            }

            if (data.damage.parts === undefined) {
                data.damage.parts = [];
            }

            formula = DGDamageRoll.formulaFromParts(formula, data.damage.parts);

            super(formula, data, options);
        }
    }

    /**
     * Return a modified formula.
     */
    public get modifiedFormula(): string {
        return DGDamageRoll.formulaFromParts(this.data.damage.formula, this.data.damage.parts ?? []);
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
