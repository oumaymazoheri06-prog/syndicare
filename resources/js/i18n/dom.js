import { translateText } from './translations';

const textNodeStates = new WeakMap();
const translatableAttributes = ['placeholder', 'aria-label', 'title', 'alt'];
const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);
let originalDocumentTitle = '';
let lastTranslatedDocumentTitle = '';

function shouldSkipNode(node) {
    const parent = node.parentElement;

    return !parent || ignoredTags.has(parent.tagName);
}

function translateTextNode(node, locale) {
    if (shouldSkipNode(node)) {
        return;
    }

    const current = node.nodeValue;
    let state = textNodeStates.get(node);

    if (!state) {
        state = {
            original: current,
            rendered: current,
        };
        textNodeStates.set(node, state);
    } else if (current !== state.rendered) {
        // React changed this text after the previous translation. Keep the
        // new value as the source instead of restoring a stale counter/value.
        state.original = current;
    }

    const translated = translateText(state.original, locale);
    state.rendered = translated;

    if (current !== translated) {
        node.nodeValue = translated;
    }
}

function translateAttributes(element, locale) {
    for (const attribute of translatableAttributes) {
        if (!element.hasAttribute(attribute)) {
            continue;
        }

        const storeKey = `i18nOriginal${attribute
            .replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`;

        if (!element.dataset[storeKey]) {
            element.dataset[storeKey] = element.getAttribute(attribute);
        }

        const translated = translateText(element.dataset[storeKey], locale);

        if (element.getAttribute(attribute) !== translated) {
            element.setAttribute(attribute, translated);
        }
    }
}

export function applyDomTranslations(locale) {
    if (typeof document === 'undefined' || !document.body) {
        return;
    }

    if (!originalDocumentTitle || document.title !== lastTranslatedDocumentTitle) {
        originalDocumentTitle = document.title;
    }

    lastTranslatedDocumentTitle = translateText(originalDocumentTitle, locale);
    document.title = lastTranslatedDocumentTitle;

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                if (!node.nodeValue?.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }

                return shouldSkipNode(node)
                    ? NodeFilter.FILTER_REJECT
                    : NodeFilter.FILTER_ACCEPT;
            },
        },
    );

    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => translateTextNode(node, locale));

    document.body
        .querySelectorAll(translatableAttributes.map((attr) => `[${attr}]`).join(','))
        .forEach((element) => translateAttributes(element, locale));
}
