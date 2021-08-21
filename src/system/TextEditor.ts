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

export const patchEnrichHTML = () => {
    const oldEnrich = TextEditor.enrichHTML;

    type EnrichHTMLArgs = { secrets: boolean; entities: boolean; links: boolean; rolls: boolean; rollData: object };
    TextEditor.enrichHTML = function (content: string, context: EnrichHTMLArgs): string {
        content = oldEnrich.apply(this, [content, context]);
        content = enrichSanityRolls(content);
        return content;
    };

    const enrichSanityRolls = (content: string) => {
        // TODO: This needs to support localization, which means it should be constructed dynamically.
        const matchRegex = /[^>]([0-9]+[dD]?[0-9]*)\/([0-9]+[dD]?[0-9]*)\s(SAN)[^<]/;

        const constructLink = (passLoss: string, failLoss: string): string => {
            return `<a class="inline-roll sanity-roll" data-pass="${passLoss}" data-fail="${failLoss}"><i class="fas fa-brain"></i>${passLoss}/${failLoss} SAN</a>`;
        };

        let matches: RegExpMatchArray | null;
        do {
            matches = content.match(matchRegex);
            if (matches !== null) {
                const fullMatch = matches[0];
                const passLoss = matches[1];
                const failLoss = matches[2];

                content =
                    content.slice(0, matches.index! + 1) +
                    constructLink(passLoss, failLoss) +
                    content.slice(matches.index! + fullMatch.length - 1, content.length);
            }
        } while (matches !== null);

        return content;
    };
};
