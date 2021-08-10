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

interface DieData {
    size: number;
    value: number;
}
interface SuccessData {
    type: RollResultType;
    label: string;
}
export interface DiceResult {
    total: number;
    target: number;
    results: DieData[];
    success: SuccessData;
}

/**
 * Roll a percentile die under a target.
 * @param target The maximum value to be considered a success.
 */
export async function rollPercentile(target: number): Promise<DiceResult> {
    target = Math.clamped(target, 1, 100);

    const diceRoll = await new Roll('1d100').roll({ async: true });

    if (!diceRoll.total) {
        throw new Error('Something went wrong with the roll.');
    }

    const ones = diceRoll.total % 10;
    const tens = Math.floor(diceRoll.total / 10);

    let successType: RollResultType;
    if (ones === tens) {
        if (diceRoll.total <= target) {
            successType = RollResultType.CriticalSuccess;
        } else {
            successType = RollResultType.CriticalFailure;
        }
    } else {
        if (diceRoll.total <= target) {
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
        total: tens * 10 + ones,
        target: target,
        results: [
            {
                value: tens,
                size: 10,
            },
            {
                value: ones,
                size: 10,
            },
        ],
        success: {
            type: successType,
            label: game.i18n.localize(`DG.DICE.${successType}`),
        },
    };
}
