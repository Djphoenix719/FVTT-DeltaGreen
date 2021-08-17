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

import { Migrate_v1v2 } from './v2/Migrate_v1v2';

export abstract class BaseMigration {
    private static _migrations: BaseMigration[] = [new Migrate_v1v2()];
    public static async run(): Promise<void> {
        let shouldRun: BaseMigration[] = [];
        for (const migration of this._migrations) {
            if (!migration.shouldRun()) {
                continue;
            }

            shouldRun = [...shouldRun, migration];
        }

        if (shouldRun.length > 0) {
            new Dialog({
                title: game.i18n.localize('DG.MIGRATION.title'),
                content:
                    `<h1>${game.i18n.localize('DG.MIGRATION.warning')}</h1>` +
                    `<p>${game.i18n.localize('DG.MIGRATION.message1')}</p>` +
                    `<p>${game.i18n.localize('DG.MIGRATION.message2')}</p>`,
                buttons: {
                    confirm: {
                        label: game.i18n.localize('DG.MIGRATION.confirm'),
                        callback: async () => {
                            for (const migration of shouldRun) {
                                await migration._run();
                            }
                        },
                    },
                },
                default: 'confirm',
            });
        }
    }

    public abstract shouldRun(): boolean;

    protected abstract _run(): Promise<void>;
}
