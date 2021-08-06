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

export enum DiceResultType {
    CriticalFailure = 'criticalFailure',
    Failure = 'failure',
    Success = 'success',
    CriticalSuccess = 'criticalSuccess',
}

export interface DiceResult {
    roll: Roll;
    total: number;
    successType: DiceResultType;
}

/**
 * Roll a percentile die under a target.
 * @param target The maximum value to be considered a success.
 */
export async function rollPercentile(target: number): Promise<DiceResult> {
    target = Math.clamped(target, 1, 100);

    const roll = await new Roll('1d100').roll({ async: true });

    if (!roll.total) {
        throw new Error('Something went wrong with the roll.');
    }

    const ones = roll.total % 10;
    const tens = Math.floor(roll.total / 10);

    let successType: DiceResultType;
    if (ones === tens) {
        if (roll.total <= target) {
            successType = DiceResultType.CriticalSuccess;
        } else {
            successType = DiceResultType.CriticalFailure;
        }
    } else {
        if (roll.total <= target) {
            successType = DiceResultType.Success;
        } else {
            successType = DiceResultType.Failure;
        }
    }

    if (roll.total === 100) {
        successType = DiceResultType.CriticalFailure;
    }

    if (roll.total === 1) {
        successType = DiceResultType.CriticalSuccess;
    }

    return {
        roll,
        total: roll.total,
        successType,
    };
}
