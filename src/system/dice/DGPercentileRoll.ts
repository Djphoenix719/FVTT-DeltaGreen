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

import { RollResultType } from '../../types/Constants';
import { SystemSetting, SystemSettings } from '../SystemSettings';

/**
 * A modifier for the target number of a percentile roll.
 */
export interface DGPercentageRollPart {
    label: string;
    value: number;
}

/**
 * Data required for a percentile roll.
 */
export interface DGPercentileRollData {
    /**
     * Label of this entire roll, e.g. "Lethality", "Accounting", "STR", etc...
     */
    label: string;
    target: {
        base: DGPercentageRollPart;
        parts: DGPercentageRollPart[];
        critical?: number;
    };
}

/**
 * A percentile roll, with helper properties to calculate data && success.
 */
export class DGPercentileRoll extends Roll<DGPercentileRollData> {
    public constructor(data: DGPercentileRollData, options?: Roll['options']) {
        super('1d100', data, options);
    }

    /**
     * Get the target number of the roll.
     */
    public get target(): number {
        let value = this.data.target.base.value;
        for (const modifier of this.data.target.parts) {
            value += modifier.value;
        }
        return value;
    }

    /**
     * Ones value of the die.
     */
    public get ones(): number | undefined {
        if (this.total === undefined) {
            return undefined;
        }

        return this.total % 10;
    }

    /**
     * Tens value of the die.
     */
    public get tens(): number | undefined {
        if (this.total === undefined) {
            return undefined;
        }

        return Math.floor(this.total / 10);
    }

    /**
     * Get the success type of the roll.
     */
    public get successType(): RollResultType | undefined {
        if (this.total === undefined) {
            return undefined;
        }

        const target = this.target;
        let successType: RollResultType;
        if (this.ones === this.tens) {
            if (this.total <= target) {
                successType = RollResultType.CriticalSuccess;
            } else {
                successType = RollResultType.CriticalFailure;
            }
        } else {
            if (this.total <= target) {
                successType = RollResultType.Success;
            } else {
                successType = RollResultType.Failure;
            }
        }

        if (this.total === 100) {
            successType = RollResultType.CriticalFailure;
        }

        if (this.total <= (this.data.target.critical ?? 1)) {
            successType = RollResultType.CriticalSuccess;
        }

        if (this.total === 69 && SystemSettings.get(SystemSetting.NiceCriticals)) {
            successType = RollResultType.CriticalSuccess;
        }

        return successType;
    }

    /**
     * Get the appropriate label for the roll's success type.
     */
    public get successTypeLabel(): string | undefined {
        if (this.successType === undefined) {
            return undefined;
        }

        return `DG.DICE.${this.successType}`;
    }
}
