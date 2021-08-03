export enum DiceResultType {
    Fumble = 'fumble',
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
            successType = DiceResultType.Fumble;
        }
    } else {
        if (roll.total <= target) {
            successType = DiceResultType.Success;
        } else {
            successType = DiceResultType.Failure;
        }
    }

    if (roll.total === 100) {
        successType = DiceResultType.Fumble;
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
