import { serverSupabaseClient } from '#supabase/server'
import { stripHtml } from "string-strip-html";
import {LanguageDetector} from "lingua-node"
const detector = new LanguageDetector([
    "en", "ru"
]);

import { HtmlValidate } from "html-validate";
const validator = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
        "no-trailing-whitespace": "off",
    },
});

import LintHTML from "@linthtml/linthtml";
const linthtml = LintHTML.default;
const linthtmlConfig = {
    'id-class-ignore-regex' : false,
    'line-max-len-ignore-regex': false,
    'rules': {
        'attr-bans': false,
        'attr-name-style': false,
        'attr-new-line' : [true, 6],
        'attr-no-dup': true,
        'attr-no-unsafe-char': true,
        'attr-order' : false,
        'attr-quote-style': [true, 'double'],
        'attr-req-value': false,
        'attr-validate': true, // todo: add custom validation
        'button-req-content' : true,
        'class-no-dup': true,
        'class-style' : false,
        'doctype-first': ["error", "smart"],
        'doctype-html5': true,
        'fieldset-contains-legend' : true,
        'fig-req-figcaption': true, // todo: add custom validation
        'focusable-tabindex-style' : true,
        'head-req-title': true,
        'head-valid-content-model': true,
        'href-style' : false,
        'html-req-lang': true,
        'html-valid-content-model': true,
        'id-class-no-ad' : false,
        'id-class-style' : false,
        'id-no-dup': true,
        'id-style' : [true, 'bem'],
        'img-req-alt': [true, 'allownull'],
        'img-req-src': true,
        'indent-style': [
            true,
            'spaces'
        ],
        'indent-width': false,
        'input-btn-req-value-or-title' : true,
        'input-radio-req-name': true,
        'input-req-label': false,
        'label-no-enc-textarea-or-select' : false,
        'label-req-for' : false,
        'lang-style' : [true, 'case'],
        'line-end-style' : false,
        'line-max-len': false,
        'line-no-trailing-whitespace': false,
        'link-min-length-4' : false,
        'link-req-noopener': true,
        'no-surrounding-whitespace' : true,
        'spec-char-escape' : false,
        'table-req-caption' : false,
        'table-req-header' : false,
        'tag-bans': false,
        'tag-close': true,
        'tag-name-lowercase': true,
        'tag-name-match': true,
        'tag-req-attr' : [true, {
            'img': [
                {'name': 'src'},
                {'name': 'width'},
                {'name': 'height'}
            ]}],
        'tag-self-close' : false,
        'title-max-len': false,
        'title-no-dup': true,
    }
}

import {HTMLHint} from "htmlhint";
const configHTMLHint = {
    "alt-require": true,
    "attr-lowercase": true,
    "attr-no-duplication": true,
    "attr-no-unnecessary-whitespace": true,
    "attr-sorted": false,
    "attr-unsafe-chars": true,
    "attr-value-double-quotes": true,
    "attr-value-not-empty": true,
    "attr-value-single-quotes": false,
    "attr-whitespace": true,
    "doctype-first": false,
    "doctype-html5": true,
    "empty-tag-not-self-closed": true,
    "head-script-disabled": false,
    "href-abs-or-rel": false,
    "html-lang-require": true,
    "id-class-ad-disabled": true,
    "id-class-value": true,
    "id-unique": true,
    "inline-script-disabled": true,
    "inline-style-disabled": true,
    "input-requires-label": true,
    "script-disabled": true,
    "space-tab-mixed-disabled": true,
    "spec-char-escape": true,
    "src-not-empty": true,
    "style-disabled": true,
    "tag-pair": true,
    "tag-self-close": false,
    "tagname-lowercase": true,
    "tagname-specialchars": true,
    "tags-check": false,
    "title-require": true
};

import {ESLint} from "eslint";
const eslint = new ESLint({
    fix: true,
    useEslintrc: false,
    overrideConfig: {
        plugins: ["@html-eslint"],
        parser: "@html-eslint/parser",
        extends: ["plugin:@html-eslint/recommended"],
        rules: {
            '@html-eslint/require-doctype': 'off',
            "@html-eslint/no-inline-styles": "error",
            "@html-eslint/require-attrs": [
                "error",
                {
                    tag: "img",
                    attr: "src",
                },
            ],
            "@html-eslint/no-multiple-empty-lines": "error",
            "@html-eslint/no-trailing-spaces": "error",
            "@html-eslint/no-trailing-br": "error",
            "@html-eslint/require-list-container": "error",
            "@html-eslint/require-text-context": "error",
        }
    },
});

export default defineEventHandler(async (event) => {
    const client = serverSupabaseClient(event)
    const { title, from, to } = getQuery(event)
    let { data, error } = await client
        .from('Challenge')
        .select('Html_GPT3(content), Task!inner(title)')
        .eq('Task.title', title)
        .range(Number(from) || 0, Number(to) || 0)
    const snippets = data?.map(({Html_GPT3}) => Html_GPT3?.content)
    const reports = await Promise.all((snippets || []).map(async (html) => {
        // const errors = HTMLHint.verify(html, configHTMLHint);
        // const errors = await linthtml(html, linthtmlConfig);

        const linter = await eslint.lintText(html);
        const { results } = validator.validateString(linter[0].output || html);
        const { result: stripped } = stripHtml(html, {
            stripTogetherWithTheirContents: [
                "script", // default
                "style", // default
                "xml", // default
                "pre", // <-- custom-added
            ],
        })
        const lang = detector.detectLanguage(stripped)
        return { validator: results, linter, stripped, lang }
    }));
    return { snippets, reports }
})

