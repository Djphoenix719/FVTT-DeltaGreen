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

import { RollResultType } from '../types/Constants';
import { SYSTEM_NAME } from './Constants';

export interface DieData {
    size: number;
    value: number;
}
export interface SuccessData {
    type: RollResultType;
    label: string;
}
export interface DicePart {
    value: number;
    label: string;
}
export interface DiceResult {
    target?: {
        base: DicePart;
        total: number;
        modifiers: DicePart[];
    };
    results: {
        value: number;
        dice: DieData[];
    };
    success?: SuccessData;
}

export async function rollDamage(damageDice: string, lethality: number, actor: Actor): Promise<DiceResult> {
    console.warn(damageDice);
    console.warn(lethality);

    if (lethality > 0) {
        const lethalityResult = await rollPercentile([
            {
                label: 'Lethality',
                value: lethality,
            },
        ]);

        if (lethalityResult.results.value <= lethality) {
            return lethalityResult;
        } else {
            const templateData: Record<string, any> = { ...lethalityResult };
            templateData['actor'] = actor;

            const renderedTemplate = await renderTemplate(`systems/${SYSTEM_NAME}/templates/roll/PercentileRoll.html`, templateData);
            await ChatMessage.create({
                content: renderedTemplate,
            });
            damageDice = '2d10';
        }
    }

    const diceRoll = await new Roll(damageDice).roll({ async: true });
    console.warn(diceRoll);

    const term = diceRoll.terms[0] as any;
    const results = term.results.map((die: any) => {
        return {
            size: term.faces,
            value: die.result as number,
        };
    });

    return {
        results: {
            value: diceRoll.total!,
            dice: results,
        },
    };
}

/**
 * Roll a percentile die under a target.
 * @param targetParts Modifiers to the target number.
 */
export async function rollPercentile(targetParts: DicePart[]): Promise<DiceResult> {
    let totalTarget = 0;
    for (const modifier of targetParts) {
        totalTarget += modifier.value;
    }

    const diceRoll = await new Roll('1d100').roll({ async: true });

    if (!diceRoll.total) {
        throw new Error('Something went wrong with the roll.');
    }

    const ones = diceRoll.total % 10;
    const tens = Math.floor(diceRoll.total / 10);

    let successType: RollResultType;
    if (ones === tens) {
        if (diceRoll.total <= totalTarget) {
            successType = RollResultType.CriticalSuccess;
        } else {
            successType = RollResultType.CriticalFailure;
        }
    } else {
        if (diceRoll.total <= totalTarget) {
            successType = RollResultType.Success;
        } else {
            successType = RollResultType.Failure;
        }
    }

    if (diceRoll.total === 100) {
        successType = RollResultType.CriticalFailure;
    }

    if (diceRoll.total === 1) {
        successType = RollResultType.CriticalSuccess;
    }

    return {
        target: {
            base: targetParts[0],
            total: totalTarget,
            modifiers: targetParts,
        },
        results: {
            value: tens * 10 + ones,
            dice: [
                {
                    value: tens,
                    size: 10,
                },
                {
                    value: ones,
                    size: 10,
                },
            ],
        },
        success: {
            type: successType,
            label: game.i18n.localize(`DG.DICE.${successType}`),
        },
    };
}
