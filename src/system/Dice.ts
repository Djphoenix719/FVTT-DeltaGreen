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

export interface DieData {
    size: number;
    value: number;
}
export interface SuccessData {
    type: RollResultType;
    label: string;
}
export interface TargetPart {
    value: number;
    label: string;
}
export interface DiceResult {
    target: {
        base: TargetPart;
        totalTarget: number;
        modifiers: TargetPart[];
    };
    results: {
        value: number;
        dice: DieData[];
    };
    success: SuccessData;
}

/**
 * Roll a percentile die under a target.
 * @param parts Modifiers to the target number.
 */
export async function rollPercentile(parts: TargetPart[]): Promise<DiceResult> {
    let totalTarget = parts[0].value;
    for (const modifier of parts) {
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
            base: parts[0],
            totalTarget: totalTarget,
            modifiers: parts,
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
