import {
    p as q,
    w as pe,
    a as Ve,
    a5 as Fe,
    s as Xe,
    n as J,
    o as We,
    b as f,
    f as b,
    g as k,
    c as Ke,
    e as Ye,
    k as ce,
    t as T,
    h as E,
    C as Je,
    j as P,
    l as $e,
    v as et,
    u as $,
    F as ee,
    r as ue,
    i as tt,
    Q as rt,
    y as O,
} from './app-B4LGLfGt.js'
import { u as nt, a as st } from './useOnlineStatus-B4V4wxVM.js'
import { u as lt } from './useToast-CELS0gRj.js'
import { p as it } from './purify.es-J9PU_gBl.js'
import { _ as at } from './_plugin-vue_export-helper-DlAUqK2U.js'
function fe() {
    return {
        async: !1,
        breaks: !1,
        extensions: null,
        gfm: !0,
        hooks: null,
        pedantic: !1,
        renderer: null,
        silent: !1,
        tokenizer: null,
        walkTokens: null,
    }
}
var H = fe()
function Be(r) {
    H = r
}
var D = { exec: () => null }
function Q(r) {
    let e = []
    return t => {
        let s = Math.max(0, Math.min(3, t - 1)),
            n = e[s]
        return (n || ((n = r(s)), (e[s] = n)), n)
    }
}
function g(r, e = '') {
    let t = typeof r == 'string' ? r : r.source,
        s = {
            replace: (n, l) => {
                let a = typeof l == 'string' ? l : l.source
                return ((a = a.replace(R.caret, '$1')), (t = t.replace(n, a)), s)
            },
            getRegex: () => new RegExp(t, e),
        }
    return s
}
var ot = ((r = '') => {
        try {
            return !!new RegExp('(?<=1)(?<!1)' + r)
        } catch {
            return !1
        }
    })(),
    R = {
        codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
        outputLinkReplace: /\\([\[\]])/g,
        indentCodeCompensation: /^(\s+)(?:```)/,
        beginningSpace: /^\s+/,
        endingHash: /#$/,
        startingSpaceChar: /^ /,
        endingSpaceChar: / $/,
        nonSpaceChar: /[^ ]/,
        newLineCharGlobal: /\n/g,
        tabCharGlobal: /\t/g,
        multipleSpaceGlobal: /\s+/g,
        blankLine: /^[ \t]*$/,
        doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
        blockquoteStart: /^ {0,3}>/,
        blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
        blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
        listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
        listIsTask: /^\[[ xX]\] +\S/,
        listReplaceTask: /^\[[ xX]\] +/,
        listTaskCheckbox: /\[[ xX]\]/,
        anyLine: /\n.*\n/,
        hrefBrackets: /^<(.*)>$/,
        tableDelimiter: /[:|]/,
        tableAlignChars: /^\||\| *$/g,
        tableRowBlankLine: /\n[ \t]*$/,
        tableAlignRight: /^ *-+: *$/,
        tableAlignCenter: /^ *:-+: *$/,
        tableAlignLeft: /^ *:-+ *$/,
        startATag: /^<a /i,
        endATag: /^<\/a>/i,
        startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
        endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
        startAngleBracket: /^</,
        endAngleBracket: />$/,
        pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
        unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
        escapeTest: /[&<>"']/,
        escapeReplace: /[&<>"']/g,
        escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
        escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
        caret: /(^|[^\[])\^/g,
        percentDecode: /%25/g,
        findPipe: /\|/g,
        splitPipe: / \|/,
        slashPipe: /\\\|/g,
        carriageReturn: /\r\n|\r/g,
        spaceLine: /^ +$/gm,
        notSpaceStart: /^\S*/,
        endingNewline: /\n$/,
        listItemRegex: r => new RegExp(`^( {0,3}${r})((?:[	 ][^\\n]*)?(?:\\n|$))`),
        nextBulletRegex: Q(
            r => new RegExp(`^ {0,${r}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)
        ),
        hrRegex: Q(
            r => new RegExp(`^ {0,${r}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)
        ),
        fencesBeginRegex: Q(r => new RegExp(`^ {0,${r}}(?:\`\`\`|~~~)`)),
        headingBeginRegex: Q(r => new RegExp(`^ {0,${r}}#`)),
        htmlBeginRegex: Q(r => new RegExp(`^ {0,${r}}<(?:[a-z].*>|!--)`, 'i')),
        blockquoteBeginRegex: Q(r => new RegExp(`^ {0,${r}}>`)),
    },
    ct = /^(?:[ \t]*(?:\n|$))+/,
    ut = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,
    pt =
        /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
    X = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
    ht = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
    xe = / {0,3}(?:[*+-]|\d{1,9}[.)])/,
    Ee =
        /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    Ie = g(Ee)
        .replace(/bull/g, xe)
        .replace(/blockCode/g, /(?: {4}| {0,3}\t)/)
        .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/)
        .replace(/blockquote/g, / {0,3}>/)
        .replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/)
        .replace(/html/g, / {0,3}<[^\n>]+>\n/)
        .replace(/\|table/g, '')
        .getRegex(),
    dt = g(Ee)
        .replace(/bull/g, xe)
        .replace(/blockCode/g, /(?: {4}| {0,3}\t)/)
        .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/)
        .replace(/blockquote/g, / {0,3}>/)
        .replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/)
        .replace(/html/g, / {0,3}<[^\n>]+>\n/)
        .replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/)
        .getRegex(),
    be =
        /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,
    kt = /^[^\n]+/,
    me = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,
    gt = g(
        /^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/
    )
        .replace('label', me)
        .replace('title', /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/)
        .getRegex(),
    ft = g(/^(bull)([ \t][^\n]*?)?(?:\n|$)/)
        .replace(/bull/g, xe)
        .getRegex(),
    le =
        'address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul',
    we = /<!--(?:-?>|[\s\S]*?(?:-->|$))/,
    xt = g(
        '^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))',
        'i'
    )
        .replace('comment', we)
        .replace('tag', le)
        .replace(
            'attribute',
            / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/
        )
        .getRegex(),
    Me = r =>
        g(be)
            .replace('hr', X)
            .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
            .replace('|lheading', '')
            .replace('|table', '')
            .replace('blockquote', ' {0,3}>')
            .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)')
            .replace('list', r)
            .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
            .replace('tag', le)
            .getRegex(),
    bt = Me(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),
    mt = Me(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),
    wt = g(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
        .replace('paragraph', mt)
        .getRegex(),
    ye = {
        blockquote: wt,
        code: ut,
        def: gt,
        fences: pt,
        heading: ht,
        hr: X,
        html: xt,
        lheading: Ie,
        list: ft,
        newline: ct,
        paragraph: bt,
        table: D,
        text: kt,
    },
    Re = g(
        '^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)'
    )
        .replace('hr', X)
        .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
        .replace('blockquote', ' {0,3}>')
        .replace('code', '(?: {4}| {0,3}	)[^\\n]')
        .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)')
        .replace('list', ' {0,3}(?:[*+-]|1[.)])[ \\t]')
        .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
        .replace('tag', le)
        .getRegex(),
    yt = {
        ...ye,
        lheading: dt,
        table: Re,
        paragraph: g(be)
            .replace('hr', X)
            .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
            .replace('|lheading', '')
            .replace('table', Re)
            .replace('blockquote', ' {0,3}>')
            .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)')
            .replace('list', ' {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]')
            .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
            .replace('tag', le)
            .getRegex(),
    },
    vt = {
        ...ye,
        html: g(
            `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
        )
            .replace('comment', we)
            .replace(
                /tag/g,
                '(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b'
            )
            .getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: D,
        lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
        paragraph: g(be)
            .replace('hr', X)
            .replace(
                'heading',
                ` *#{1,6} *[^
]`
            )
            .replace('lheading', Ie)
            .replace('|table', '')
            .replace('blockquote', ' {0,3}>')
            .replace('|fences', '')
            .replace('|list', '')
            .replace('|html', '')
            .replace('|tag', '')
            .getRegex(),
    },
    St = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    $t = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    qe = /^( {2,}|\\)\n(?!\s*$)/,
    Rt = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
    I = /[\p{P}\p{S}]/u,
    N = /[\s\p{P}\p{S}]/u,
    W = /[^\s\p{P}\p{S}]/u,
    _t = g(/^((?![*_])punctSpace)/, 'u')
        .replace(/punctSpace/g, N)
        .getRegex(),
    Tt = /[\p{Pi}\p{Ps}"']/u,
    De = /(?!~)[\p{P}\p{S}]/u,
    zt = /(?!~)[\s\p{P}\p{S}]/u,
    At = /(?:[^\s\p{P}\p{S}]|~)/u,
    Ct = g(/link|precode-code|html/, 'g')
        .replace(
            'link',
            /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/
        )
        .replace('precode-', ot ? '(?<!`)()' : '(^^|[^`])')
        .replace('code', /(?<b>`+)[^`]+\k<b>(?!`)/)
        .replace('html', /<(?! )[^<>]*?>/)
        .getRegex(),
    je = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,
    Pt = g(je, 'u').replace(/punct/g, I).getRegex(),
    Lt = g(je, 'u').replace(/punct/g, De).getRegex(),
    Bt =
        /^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,
    Et = g(Bt, 'u')
        .replace(/openQuote/g, Tt)
        .replace(/punct/g, I)
        .getRegex(),
    He =
        '^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)',
    It = g(He, 'gu')
        .replace(/notPunctSpace/g, W)
        .replace(/punctSpace/g, N)
        .replace(/punct/g, I)
        .getRegex(),
    Mt = g(He, 'gu')
        .replace(/notPunctSpace/g, At)
        .replace(/punctSpace/g, zt)
        .replace(/punct/g, De)
        .getRegex(),
    qt =
        '^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)',
    Dt = g(qt, 'gu')
        .replace(/notPunctSpace/g, W)
        .replace(/punctSpace/g, N)
        .replace(/punct/g, I)
        .getRegex(),
    jt = g(
        '^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)',
        'gu'
    )
        .replace(/notPunctSpace/g, W)
        .replace(/punctSpace/g, N)
        .replace(/punct/g, I)
        .getRegex(),
    Ht =
        '^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)',
    Zt = g(Ht, 'gu')
        .replace(/notPunctSpace/g, W)
        .replace(/punctSpace/g, N)
        .replace(/punct/g, I)
        .getRegex(),
    Ot = g(/^~~?(?:((?!~)punct)|[^\s~])/, 'u')
        .replace(/punct/g, I)
        .getRegex(),
    Qt =
        '^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)',
    Nt = g(Qt, 'gu')
        .replace(/notPunctSpace/g, W)
        .replace(/punctSpace/g, N)
        .replace(/punct/g, I)
        .getRegex(),
    Gt = g(/\\(punct)/, 'gu')
        .replace(/punct/g, I)
        .getRegex(),
    Ut = g(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
        .replace('scheme', /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
        .replace(
            'email',
            /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/
        )
        .getRegex(),
    Vt = g(we).replace('(?:-->|$)', '-->').getRegex(),
    Ft = g(
        '^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'
    )
        .replace('comment', Vt)
        .replace(
            'attribute',
            /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/
        )
        .getRegex(),
    re =
        /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,
    Xt = g(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/)
        .replace('label', re)
        .replace('href', /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/)
        .replace('title', /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/)
        .getRegex(),
    Ze = g(/^!?\[(label)\]\[(ref)\]/)
        .replace('label', re)
        .replace('ref', me)
        .getRegex(),
    Oe = g(/^!?\[(ref)\](?:\[\])?/)
        .replace('ref', me)
        .getRegex(),
    Wt = g('reflink|nolink(?!\\()', 'g')
        .replace('reflink', Ze)
        .replace('nolink', Oe)
        .getRegex(),
    _e = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,
    ve = {
        _backpedal: D,
        anyPunctuation: Gt,
        autolink: Ut,
        blockSkip: Ct,
        br: qe,
        code: $t,
        del: D,
        delLDelim: D,
        delRDelim: D,
        emStrongLDelim: Pt,
        emStrongRDelimAst: It,
        emStrongRDelimUnd: jt,
        escape: St,
        link: Xt,
        nolink: Oe,
        punctuation: _t,
        reflink: Ze,
        reflinkSearch: Wt,
        tag: Ft,
        text: Rt,
        url: D,
    },
    Kt = {
        ...ve,
        emStrongLDelim: Et,
        emStrongRDelimAst: Dt,
        emStrongRDelimUnd: Zt,
        link: g(/^!?\[(label)\]\((.*?)\)/)
            .replace('label', re)
            .getRegex(),
        reflink: g(/^!?\[(label)\]\s*\[([^\]]*)\]/)
            .replace('label', re)
            .getRegex(),
    },
    he = {
        ...ve,
        emStrongRDelimAst: Mt,
        emStrongLDelim: Lt,
        delLDelim: Ot,
        delRDelim: Nt,
        url: g(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/)
            .replace('protocol', _e)
            .replace(
                'email',
                /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/
            )
            .getRegex(),
        _backpedal:
            /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
        text: g(
            /^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
        )
            .replace('protocol', _e)
            .getRegex(),
    },
    Yt = {
        ...he,
        br: g(qe).replace('{2,}', '*').getRegex(),
        text: g(he.text)
            .replace('\\b_', '\\b_| {2,}\\n')
            .replace(/\{2,\}/g, '*')
            .getRegex(),
    },
    te = { normal: ye, gfm: yt, pedantic: vt },
    V = { normal: ve, gfm: he, breaks: Yt, pedantic: Kt },
    Jt = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' },
    Te = r => Jt[r]
function L(r, e) {
    if (e) {
        if (R.escapeTest.test(r)) return r.replace(R.escapeReplace, Te)
    } else if (R.escapeTestNoEncode.test(r)) return r.replace(R.escapeReplaceNoEncode, Te)
    return r
}
function ze(r) {
    try {
        r = encodeURI(r).replace(R.percentDecode, '%')
    } catch {
        return null
    }
    return r
}
function Ae(r, e) {
    let t = r.replace(R.findPipe, (l, a, i) => {
            let o = !1,
                c = a
            for (; --c >= 0 && i[c] === '\\'; ) o = !o
            return o ? '|' : ' |'
        }),
        s = t.split(R.splitPipe),
        n = 0
    if ((s[0].trim() || s.shift(), s.length > 0 && !s.at(-1)?.trim() && s.pop(), e))
        if (s.length > e) s.splice(e)
        else for (; s.length < e; ) s.push('')
    for (; n < s.length; n++) s[n] = s[n].trim().replace(R.slashPipe, '|')
    return s
}
function M(r, e, t) {
    let s = r.length
    if (s === 0) return ''
    let n = 0
    for (; n < s && r.charAt(s - n - 1) === e; ) n++
    return r.slice(0, s - n)
}
function Ce(r) {
    let e = r.split(`
`),
        t = e.length - 1
    for (; t >= 0 && R.blankLine.test(e[t]); ) t--
    return e.length - t <= 2
        ? r
        : e.slice(0, t + 1).join(`
`)
}
function er(r, e) {
    if (r.indexOf(e[1]) === -1) return -1
    let t = 0
    for (let s = 0; s < r.length; s++)
        if (r[s] === '\\') s++
        else if (r[s] === e[0]) t++
        else if (r[s] === e[1] && (t--, t < 0)) return s
    return t > 0 ? -2 : -1
}
function tr(r, e = 0) {
    let t = e,
        s = ''
    for (let n of r)
        if (n === '	') {
            let l = 4 - (t % 4)
            ;((s += ' '.repeat(l)), (t += l))
        } else ((s += n), t++)
    return s
}
function Pe(r, e, t, s, n) {
    let l = e.href,
        a = e.title || null,
        i = r[1].replace(n.other.outputLinkReplace, '$1'),
        o = r[0].charAt(0) === '!'
    s.state.inLink = !0
    let c = s.state.linkEmitted,
        p = s.state.inRawBlock
    s.state.linkEmitted = !1
    let u = s.inlineTokens(i),
        x = s.state.linkEmitted
    if (((s.state.linkEmitted = c), (s.state.inLink = !1), !o)) {
        if (x) {
            s.state.inRawBlock = p
            return
        }
        s.state.linkEmitted = !0
    }
    return { type: o ? 'image' : 'link', raw: t, href: l, title: a, text: i, tokens: u }
}
function rr(r, e, t) {
    let s = r.match(t.other.indentCodeCompensation)
    if (s === null) return e
    let n = s[1]
    return e
        .split(
            `
`
        )
        .map(l => {
            let a = l.match(t.other.beginningSpace)
            if (a === null) return l
            let [i] = a
            return i.length >= n.length ? l.slice(n.length) : l
        }).join(`
`)
}
var ne = class {
        options
        rules
        lexer
        constructor(r) {
            this.options = r || H
        }
        space(r) {
            let e = this.rules.block.newline.exec(r)
            if (e && e[0].length > 0) return { type: 'space', raw: e[0] }
        }
        code(r) {
            let e = this.rules.block.code.exec(r)
            if (e) {
                let t = this.options.pedantic ? e[0] : Ce(e[0]),
                    s = t.replace(this.rules.other.codeRemoveIndent, '')
                return { type: 'code', raw: t, codeBlockStyle: 'indented', text: s }
            }
        }
        fences(r) {
            let e = this.rules.block.fences.exec(r)
            if (e) {
                let t = e[0],
                    s = rr(t, e[3] || '', this.rules)
                return {
                    type: 'code',
                    raw: t,
                    lang: e[2]
                        ? e[2].trim().replace(this.rules.inline.anyPunctuation, '$1')
                        : e[2],
                    text: s,
                }
            }
        }
        heading(r) {
            let e = this.rules.block.heading.exec(r)
            if (e) {
                let t = e[2].trim()
                if (this.rules.other.endingHash.test(t)) {
                    let s = M(t, '#')
                    ;(this.options.pedantic ||
                        !s ||
                        this.rules.other.endingSpaceChar.test(s)) &&
                        (t = s.trim())
                }
                return {
                    type: 'heading',
                    raw: M(
                        e[0],
                        `
`
                    ),
                    depth: e[1].length,
                    text: t,
                    tokens: this.lexer.inline(t),
                }
            }
        }
        hr(r) {
            let e = this.rules.block.hr.exec(r)
            if (e)
                return {
                    type: 'hr',
                    raw: M(
                        e[0],
                        `
`
                    ),
                }
        }
        blockquote(r) {
            let e = this.rules.block.blockquote.exec(r)
            if (e) {
                let t = M(
                        e[0],
                        `
`
                    ).split(`
`),
                    s = '',
                    n = '',
                    l = []
                for (; t.length > 0; ) {
                    let a = !1,
                        i = [],
                        o
                    for (o = 0; o < t.length; o++)
                        if (this.rules.other.blockquoteStart.test(t[o]))
                            (i.push(t[o]), (a = !0))
                        else if (!a) i.push(t[o])
                        else break
                    t = t.slice(o)
                    let c = i.join(`
`),
                        p = c
                            .replace(
                                this.rules.other.blockquoteSetextReplace,
                                `
    $1`
                            )
                            .replace(this.rules.other.blockquoteSetextReplace2, '')
                    ;((s = s
                        ? `${s}
${c}`
                        : c),
                        (n = n
                            ? `${n}
${p}`
                            : p))
                    let u = this.lexer.state.top
                    if (
                        ((this.lexer.state.top = !0),
                        this.lexer.blockTokens(p, l, !0),
                        (this.lexer.state.top = u),
                        t.length === 0)
                    )
                        break
                    let x = l.at(-1)
                    if (x?.type === 'code') break
                    if (x?.type === 'blockquote') {
                        let v = x,
                            m = t.join(`
`),
                            S =
                                v.raw +
                                `
` +
                                m.replace(this.rules.other.blockquoteSetextReplace2, ''),
                            _ = this.blockquote(S)
                        ;((l[l.length - 1] = _),
                            (s = `${s}
${m}`),
                            (n = n.substring(0, n.length - v.text.length) + _.text))
                        break
                    } else if (x?.type === 'list') {
                        let v = x,
                            m =
                                v.raw +
                                `
` +
                                t.join(`
`),
                            S = this.list(m)
                        ;((l[l.length - 1] = S),
                            (s = s.substring(0, s.length - x.raw.length) + S.raw),
                            (n = n.substring(0, n.length - v.raw.length) + S.raw),
                            (t = m.substring(l.at(-1).raw.length).split(`
`)))
                        continue
                    }
                }
                return { type: 'blockquote', raw: s, tokens: l, text: n }
            }
        }
        list(r) {
            let e = this.rules.block.list.exec(r)
            if (e) {
                let t = e[1].trim(),
                    s = t.length > 1,
                    n = {
                        type: 'list',
                        raw: '',
                        ordered: s,
                        start: s ? +t.slice(0, -1) : '',
                        loose: !1,
                        items: [],
                    }
                ;((t = s ? `\\d{1,9}\\${t.slice(-1)}` : `\\${t}`),
                    this.options.pedantic && (t = s ? t : '[*+-]'))
                let l = this.rules.other.listItemRegex(t),
                    a = !1
                for (; r; ) {
                    let o = !1,
                        c = '',
                        p = ''
                    if (!(e = l.exec(r)) || this.rules.block.hr.test(r)) break
                    ;((c = e[0]), (r = r.substring(c.length)))
                    let u = tr(
                            e[2].split(
                                `
`,
                                1
                            )[0],
                            e[1].length
                        ),
                        x = r.split(
                            `
`,
                            1
                        )[0],
                        v = !u.trim(),
                        m = 0
                    if (
                        (this.options.pedantic
                            ? ((m = 2), (p = u.trimStart()))
                            : v
                              ? (m = e[1].length + 1)
                              : ((m = u.search(this.rules.other.nonSpaceChar)),
                                (m = m > 4 ? 1 : m),
                                (p = u.slice(m)),
                                (m += e[1].length)),
                        v &&
                            this.rules.other.blankLine.test(x) &&
                            ((c +=
                                x +
                                `
`),
                            (r = r.substring(x.length + 1)),
                            (o = !0)),
                        !o)
                    ) {
                        let S = this.rules.other.nextBulletRegex(m),
                            _ = this.rules.other.hrRegex(m),
                            G = this.rules.other.fencesBeginRegex(m),
                            K = this.rules.other.headingBeginRegex(m),
                            Y = this.rules.other.htmlBeginRegex(m),
                            ie = this.rules.other.blockquoteBeginRegex(m)
                        for (; r; ) {
                            let Z = r.split(
                                    `
`,
                                    1
                                )[0],
                                B
                            if (
                                ((x = Z),
                                this.options.pedantic
                                    ? ((x = x.replace(
                                          this.rules.other.listReplaceNesting,
                                          '  '
                                      )),
                                      (B = x))
                                    : (B = x.replace(this.rules.other.tabCharGlobal, '    ')),
                                G.test(x) ||
                                    K.test(x) ||
                                    Y.test(x) ||
                                    ie.test(x) ||
                                    S.test(x) ||
                                    _.test(x))
                            )
                                break
                            if (B.search(this.rules.other.nonSpaceChar) >= m || !x.trim())
                                p +=
                                    `
` + B.slice(m)
                            else {
                                if (
                                    v ||
                                    u
                                        .replace(this.rules.other.tabCharGlobal, '    ')
                                        .search(this.rules.other.nonSpaceChar) >= 4 ||
                                    G.test(u) ||
                                    K.test(u) ||
                                    _.test(u)
                                )
                                    break
                                p +=
                                    `
` + x
                            }
                            ;((v = !x.trim()),
                                (c +=
                                    Z +
                                    `
`),
                                (r = r.substring(Z.length + 1)),
                                (u = B.slice(m)))
                        }
                    }
                    ;(n.loose ||
                        (a
                            ? (n.loose = !0)
                            : this.rules.other.doubleBlankLine.test(c) && (a = !0)),
                        n.items.push({
                            type: 'list_item',
                            raw: c,
                            task: !!this.options.gfm && this.rules.other.listIsTask.test(p),
                            loose: !1,
                            text: p,
                            tokens: [],
                        }),
                        (n.raw += c))
                }
                let i = n.items.at(-1)
                if (i) ((i.raw = i.raw.trimEnd()), (i.text = i.text.trimEnd()))
                else return
                n.raw = n.raw.trimEnd()
                for (let o of n.items)
                    if (
                        ((this.lexer.state.top = !1),
                        (o.tokens = this.lexer.blockTokens(o.text, [])),
                        !n.loose)
                    ) {
                        let c = o.tokens.filter(u => u.type === 'space'),
                            p =
                                c.length > 0 &&
                                c.some(u => this.rules.other.anyLine.test(u.raw))
                        n.loose = p
                    }
                for (let o of n.items) {
                    let c = o.tokens[0]
                    if (o.task && (c?.type === 'text' || c?.type === 'paragraph')) {
                        ;((o.text = o.text.replace(this.rules.other.listReplaceTask, '')),
                            (c.raw = c.raw.replace(this.rules.other.listReplaceTask, '')),
                            (c.text = c.text.replace(this.rules.other.listReplaceTask, '')))
                        for (let u = this.lexer.inlineQueue.length - 1; u >= 0; u--)
                            if (
                                this.rules.other.listIsTask.test(this.lexer.inlineQueue[u].src)
                            ) {
                                this.lexer.inlineQueue[u].src = this.lexer.inlineQueue[
                                    u
                                ].src.replace(this.rules.other.listReplaceTask, '')
                                break
                            }
                        let p = this.rules.other.listTaskCheckbox.exec(o.raw)
                        if (p) {
                            let u = {
                                type: 'checkbox',
                                raw: p[0] + ' ',
                                checked: p[0] !== '[ ]',
                            }
                            ;((o.checked = u.checked),
                                n.loose
                                    ? o.tokens[0] &&
                                      ['paragraph', 'text'].includes(o.tokens[0].type) &&
                                      'tokens' in o.tokens[0] &&
                                      o.tokens[0].tokens
                                        ? ((o.tokens[0].raw = u.raw + o.tokens[0].raw),
                                          (o.tokens[0].text = u.raw + o.tokens[0].text),
                                          o.tokens[0].tokens.unshift(u))
                                        : o.tokens.unshift({
                                              type: 'paragraph',
                                              raw: u.raw,
                                              text: u.raw,
                                              tokens: [u],
                                          })
                                    : o.tokens.unshift(u))
                        }
                    } else o.task && (o.task = !1)
                }
                if (n.loose)
                    for (let o of n.items) {
                        o.loose = !0
                        for (let c of o.tokens) c.type === 'text' && (c.type = 'paragraph')
                    }
                return n
            }
        }
        html(r) {
            let e = this.rules.block.html.exec(r)
            if (e) {
                let t = Ce(e[0])
                return {
                    type: 'html',
                    block: !0,
                    raw: t,
                    pre: e[1] === 'pre' || e[1] === 'script' || e[1] === 'style',
                    text: t,
                }
            }
        }
        def(r) {
            let e = this.rules.block.def.exec(r)
            if (e) {
                let t = e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, ' '),
                    s = e[2]
                        ? e[2]
                              .replace(this.rules.other.hrefBrackets, '$1')
                              .replace(this.rules.inline.anyPunctuation, '$1')
                        : '',
                    n = e[3]
                        ? e[3]
                              .substring(1, e[3].length - 1)
                              .replace(this.rules.inline.anyPunctuation, '$1')
                        : e[3]
                return {
                    type: 'def',
                    tag: t,
                    raw: M(
                        e[0],
                        `
`
                    ),
                    href: s,
                    title: n,
                }
            }
        }
        table(r) {
            let e = this.rules.block.table.exec(r)
            if (!e || !this.rules.other.tableDelimiter.test(e[2])) return
            let t = Ae(e[1]),
                s = e[2].replace(this.rules.other.tableAlignChars, '').split('|'),
                n = e[3]?.trim()
                    ? e[3].replace(this.rules.other.tableRowBlankLine, '').split(`
`)
                    : [],
                l = {
                    type: 'table',
                    raw: M(
                        e[0],
                        `
`
                    ),
                    header: [],
                    align: [],
                    rows: [],
                }
            if (t.length === s.length) {
                for (let a of s)
                    this.rules.other.tableAlignRight.test(a)
                        ? l.align.push('right')
                        : this.rules.other.tableAlignCenter.test(a)
                          ? l.align.push('center')
                          : this.rules.other.tableAlignLeft.test(a)
                            ? l.align.push('left')
                            : l.align.push(null)
                for (let a = 0; a < t.length; a++)
                    l.header.push({
                        text: t[a],
                        tokens: this.lexer.inline(t[a]),
                        header: !0,
                        align: l.align[a],
                    })
                for (let a of n)
                    l.rows.push(
                        Ae(a, l.header.length).map((i, o) => ({
                            text: i,
                            tokens: this.lexer.inline(i),
                            header: !1,
                            align: l.align[o],
                        }))
                    )
                return l
            }
        }
        lheading(r) {
            let e = this.rules.block.lheading.exec(r)
            if (e) {
                let t = e[1].trim()
                return {
                    type: 'heading',
                    raw: M(
                        e[0],
                        `
`
                    ),
                    depth: e[2].charAt(0) === '=' ? 1 : 2,
                    text: t,
                    tokens: this.lexer.inline(t),
                }
            }
        }
        paragraph(r) {
            let e = this.rules.block.paragraph.exec(r)
            if (e) {
                let t =
                    e[1].charAt(e[1].length - 1) ===
                    `
`
                        ? e[1].slice(0, -1)
                        : e[1]
                return { type: 'paragraph', raw: e[0], text: t, tokens: this.lexer.inline(t) }
            }
        }
        text(r) {
            let e = this.rules.block.text.exec(r)
            if (e)
                return { type: 'text', raw: e[0], text: e[0], tokens: this.lexer.inline(e[0]) }
        }
        escape(r) {
            let e = this.rules.inline.escape.exec(r)
            if (e) return { type: 'escape', raw: e[0], text: e[1] }
        }
        tag(r) {
            let e = this.rules.inline.tag.exec(r)
            if (e)
                return (
                    !this.lexer.state.inLink && this.rules.other.startATag.test(e[0])
                        ? (this.lexer.state.inLink = !0)
                        : this.lexer.state.inLink &&
                          this.rules.other.endATag.test(e[0]) &&
                          (this.lexer.state.inLink = !1),
                    !this.lexer.state.inRawBlock &&
                    this.rules.other.startPreScriptTag.test(e[0])
                        ? (this.lexer.state.inRawBlock = !0)
                        : this.lexer.state.inRawBlock &&
                          this.rules.other.endPreScriptTag.test(e[0]) &&
                          (this.lexer.state.inRawBlock = !1),
                    {
                        type: 'html',
                        raw: e[0],
                        inLink: this.lexer.state.inLink,
                        inRawBlock: this.lexer.state.inRawBlock,
                        block: !1,
                        text: e[0],
                    }
                )
        }
        link(r) {
            let e = this.rules.inline.link.exec(r)
            if (e) {
                let t = e[2].trim()
                if (!this.options.pedantic && this.rules.other.startAngleBracket.test(t)) {
                    if (!this.rules.other.endAngleBracket.test(t)) return
                    let l = M(t.slice(0, -1), '\\')
                    if ((t.length - l.length) % 2 === 0) return
                } else {
                    let l = er(e[2], '()')
                    if (l === -2) return
                    if (l > -1) {
                        let a = (e[0].indexOf('!') === 0 ? 5 : 4) + e[1].length + l
                        ;((e[2] = e[2].substring(0, l)),
                            (e[0] = e[0].substring(0, a).trim()),
                            (e[3] = ''))
                    }
                }
                let s = e[2],
                    n = ''
                if (this.options.pedantic) {
                    let l = this.rules.other.pedanticHrefTitle.exec(s)
                    l && ((s = l[1]), (n = l[3]))
                } else n = e[3] ? e[3].slice(1, -1) : ''
                return (
                    (s = s.trim()),
                    this.rules.other.startAngleBracket.test(s) &&
                        (this.options.pedantic && !this.rules.other.endAngleBracket.test(t)
                            ? (s = s.slice(1))
                            : (s = s.slice(1, -1))),
                    Pe(
                        e,
                        {
                            href: s && s.replace(this.rules.inline.anyPunctuation, '$1'),
                            title: n && n.replace(this.rules.inline.anyPunctuation, '$1'),
                        },
                        e[0],
                        this.lexer,
                        this.rules
                    )
                )
            }
        }
        reflink(r, e) {
            let t
            if (
                (t = this.rules.inline.reflink.exec(r)) ||
                (t = this.rules.inline.nolink.exec(r))
            ) {
                let s = (t[2] || t[1]).replace(this.rules.other.multipleSpaceGlobal, ' '),
                    n = e[s.toLowerCase()]
                if (!n) {
                    let l = t[0].charAt(0)
                    return { type: 'text', raw: l, text: l }
                }
                return Pe(t, n, t[0], this.lexer, this.rules)
            }
        }
        emStrong(r, e, t = '') {
            let s = this.rules.inline.emStrongLDelim.exec(r)
            if (
                !(
                    !s ||
                    (!s[1] && !s[2] && !s[3] && !s[4]) ||
                    (s[4] && t.match(this.rules.other.unicodeAlphaNumeric))
                ) &&
                (!(s[1] || s[3]) || !t || this.rules.inline.punctuation.exec(t))
            ) {
                let n = [...s[0]].length - 1,
                    l,
                    a,
                    i = n,
                    o = 0,
                    c = s[0][0],
                    p = t === c,
                    u =
                        c === '*'
                            ? this.rules.inline.emStrongRDelimAst
                            : this.rules.inline.emStrongRDelimUnd
                for (
                    u.lastIndex = 0, e = e.slice(-1 * r.length + n);
                    (s = u.exec(e)) !== null;

                ) {
                    if (((l = s[1] || s[2] || s[3] || s[4] || s[5] || s[6]), !l)) continue
                    if (((a = [...l].length), s[3] || s[4])) {
                        i += a
                        continue
                    } else if (s[5] || s[6]) {
                        if (n % 3 && !((n + a) % 3)) {
                            o += a
                            continue
                        }
                        if (p) break
                    }
                    if (((i -= a), i > 0)) continue
                    a = Math.min(a, a + i + o)
                    let x = [...s[0]][0].length,
                        v = r.slice(0, n + s.index + x + a)
                    if (Math.min(n, a) % 2) {
                        let S = v.slice(1, -1)
                        return {
                            type: 'em',
                            raw: v,
                            text: S,
                            tokens: this.lexer.inlineTokens(S),
                        }
                    }
                    let m = v.slice(2, -2)
                    return {
                        type: 'strong',
                        raw: v,
                        text: m,
                        tokens: this.lexer.inlineTokens(m),
                    }
                }
            }
        }
        codespan(r) {
            let e = this.rules.inline.code.exec(r)
            if (e) {
                let t = e[2].replace(this.rules.other.newLineCharGlobal, ' '),
                    s = this.rules.other.nonSpaceChar.test(t),
                    n =
                        this.rules.other.startingSpaceChar.test(t) &&
                        this.rules.other.endingSpaceChar.test(t)
                return (
                    s && n && (t = t.substring(1, t.length - 1)),
                    { type: 'codespan', raw: e[0], text: t }
                )
            }
        }
        br(r) {
            let e = this.rules.inline.br.exec(r)
            if (e) return { type: 'br', raw: e[0] }
        }
        del(r, e, t = '') {
            let s = this.rules.inline.delLDelim.exec(r)
            if (s && (!s[1] || !t || this.rules.inline.punctuation.exec(t))) {
                let n = [...s[0]].length - 1,
                    l,
                    a,
                    i = n,
                    o = this.rules.inline.delRDelim
                for (
                    o.lastIndex = 0, e = e.slice(-1 * r.length + n);
                    (s = o.exec(e)) !== null;

                ) {
                    if (
                        ((l = s[1] || s[2] || s[3] || s[4] || s[5] || s[6]),
                        !l || ((a = [...l].length), a !== n))
                    )
                        continue
                    if (s[3] || s[4]) {
                        i += a
                        continue
                    }
                    if (((i -= a), i > 0)) continue
                    a = Math.min(a, a + i)
                    let c = [...s[0]][0].length,
                        p = r.slice(0, n + s.index + c + a),
                        u = p.slice(n, -n)
                    return { type: 'del', raw: p, text: u, tokens: this.lexer.inlineTokens(u) }
                }
            }
        }
        autolink(r) {
            let e = this.rules.inline.autolink.exec(r)
            if (e) {
                let t, s
                return (
                    e[2] === '@' ? ((t = e[1]), (s = 'mailto:' + t)) : ((t = e[1]), (s = t)),
                    {
                        type: 'link',
                        raw: e[0],
                        text: t,
                        href: s,
                        tokens: [{ type: 'text', raw: t, text: t }],
                    }
                )
            }
        }
        url(r) {
            let e
            if ((e = this.rules.inline.url.exec(r))) {
                let t, s
                if (e[2] === '@') ((t = e[0]), (s = 'mailto:' + t))
                else {
                    let n
                    do
                        ((n = e[0]),
                            (e[0] = this.rules.inline._backpedal.exec(e[0])?.[0] ?? ''))
                    while (n !== e[0])
                    ;((t = e[0]), e[1] === 'www.' ? (s = 'http://' + e[0]) : (s = e[0]))
                }
                return {
                    type: 'link',
                    raw: e[0],
                    text: t,
                    href: s,
                    tokens: [{ type: 'text', raw: t, text: t }],
                }
            }
        }
        inlineText(r) {
            let e = this.rules.inline.text.exec(r)
            if (e) {
                let t = this.lexer.state.inRawBlock
                return { type: 'text', raw: e[0], text: e[0], escaped: t }
            }
        }
    },
    z = class de {
        tokens
        options
        state
        inlineQueue
        tokenizer
        constructor(e) {
            ;((this.tokens = []),
                (this.tokens.links = Object.create(null)),
                (this.options = e || H),
                (this.options.tokenizer = this.options.tokenizer || new ne()),
                (this.tokenizer = this.options.tokenizer),
                (this.tokenizer.options = this.options),
                (this.tokenizer.lexer = this),
                (this.inlineQueue = []),
                (this.state = { inLink: !1, inRawBlock: !1, linkEmitted: !1, top: !0 }))
            let t = { other: R, block: te.normal, inline: V.normal }
            ;(this.options.pedantic
                ? ((t.block = te.pedantic), (t.inline = V.pedantic))
                : this.options.gfm &&
                  ((t.block = te.gfm),
                  this.options.breaks ? (t.inline = V.breaks) : (t.inline = V.gfm)),
                (this.tokenizer.rules = t))
        }
        static get rules() {
            return { block: te, inline: V }
        }
        static lex(e, t) {
            return new de(t).lex(e)
        }
        static lexInline(e, t) {
            return new de(t).inlineTokens(e)
        }
        lex(e) {
            ;((e = e.replace(
                R.carriageReturn,
                `
`
            )),
                this.blockTokens(e, this.tokens))
            for (let t = 0; t < this.inlineQueue.length; t++) {
                let s = this.inlineQueue[t]
                this.inlineTokens(s.src, s.tokens)
            }
            return ((this.inlineQueue = []), this.tokens)
        }
        blockTokens(e, t = [], s = !1) {
            ;((this.tokenizer.lexer = this),
                this.options.pedantic &&
                    (e = e.replace(R.tabCharGlobal, '    ').replace(R.spaceLine, '')))
            let n = 1 / 0
            for (; e; ) {
                if (e.length < n) n = e.length
                else {
                    this.infiniteLoopError(e.charCodeAt(0))
                    break
                }
                let l
                if (
                    this.options.extensions?.block?.some(i =>
                        (l = i.call({ lexer: this }, e, t))
                            ? ((e = e.substring(l.raw.length)), t.push(l), !0)
                            : !1
                    )
                )
                    continue
                if ((l = this.tokenizer.space(e))) {
                    e = e.substring(l.raw.length)
                    let i = t.at(-1)
                    l.raw.length === 1 && i !== void 0
                        ? (i.raw += `
`)
                        : t.push(l)
                    continue
                }
                if ((l = this.tokenizer.code(e))) {
                    e = e.substring(l.raw.length)
                    let i = t.at(-1)
                    i?.type === 'paragraph' || i?.type === 'text'
                        ? ((i.raw +=
                              (i.raw.endsWith(`
`)
                                  ? ''
                                  : `
`) + l.raw),
                          (i.text +=
                              `
` + l.text),
                          (this.inlineQueue.at(-1).src = i.text))
                        : t.push(l)
                    continue
                }
                if ((l = this.tokenizer.fences(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.heading(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.hr(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.blockquote(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.list(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.html(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.def(e))) {
                    e = e.substring(l.raw.length)
                    let i = t.at(-1)
                    i?.type === 'paragraph' || i?.type === 'text'
                        ? ((i.raw +=
                              (i.raw.endsWith(`
`)
                                  ? ''
                                  : `
`) + l.raw),
                          (i.text +=
                              `
` + l.raw),
                          (this.inlineQueue.at(-1).src = i.text))
                        : this.tokens.links[l.tag] ||
                          ((this.tokens.links[l.tag] = { href: l.href, title: l.title }),
                          t.push(l))
                    continue
                }
                if ((l = this.tokenizer.table(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                if ((l = this.tokenizer.lheading(e))) {
                    ;((e = e.substring(l.raw.length)), t.push(l))
                    continue
                }
                let a = e
                if (this.options.extensions?.startBlock) {
                    let i = 1 / 0,
                        o = e.slice(1),
                        c
                    ;(this.options.extensions.startBlock.forEach(p => {
                        ;((c = p.call({ lexer: this }, o)),
                            typeof c == 'number' && c >= 0 && (i = Math.min(i, c)))
                    }),
                        i < 1 / 0 && i >= 0 && (a = e.substring(0, i + 1)))
                }
                if (this.state.top && (l = this.tokenizer.paragraph(a))) {
                    let i = t.at(-1)
                    ;(s && i?.type === 'paragraph'
                        ? ((i.raw +=
                              (i.raw.endsWith(`
`)
                                  ? ''
                                  : `
`) + l.raw),
                          (i.text +=
                              `
` + l.text),
                          this.inlineQueue.pop(),
                          (this.inlineQueue.at(-1).src = i.text))
                        : t.push(l),
                        (s = a.length !== e.length),
                        (e = e.substring(l.raw.length)))
                    continue
                }
                if ((l = this.tokenizer.text(e))) {
                    e = e.substring(l.raw.length)
                    let i = t.at(-1)
                    i?.type === 'text'
                        ? ((i.raw +=
                              (i.raw.endsWith(`
`)
                                  ? ''
                                  : `
`) + l.raw),
                          (i.text +=
                              `
` + l.text),
                          this.inlineQueue.pop(),
                          (this.inlineQueue.at(-1).src = i.text))
                        : t.push(l)
                    continue
                }
                if (e) {
                    this.infiniteLoopError(e.charCodeAt(0))
                    break
                }
            }
            return ((this.state.top = !0), t)
        }
        inline(e, t = []) {
            return (this.inlineQueue.push({ src: e, tokens: t }), t)
        }
        linkInText(e) {
            if (!e.includes('[')) return !1
            let t = this.tokenizer.rules.inline.link
            for (let s of e.matchAll(this.tokenizer.rules.inline.blockSkip))
                if (t.test(s[0]) && e.charAt(s.index - 1) !== '!') return !0
            for (let s of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
                let n = s[0],
                    l = n.lastIndexOf('[')
                if (
                    !(
                        n.charAt(0) === '!' ||
                        !Object.hasOwn(this.tokens.links, n.slice(l + 1, -1))
                    ) &&
                    !(l > 1 && this.linkInText(n.slice(1, l - 1)))
                )
                    return !0
            }
            return !1
        }
        inlineTokens(e, t = []) {
            this.tokenizer.lexer = this
            let s = e
            if (this.tokens.links && e.includes('[')) {
                let i = this.tokenizer.rules.inline.reflinkSearch,
                    o = c => {
                        let p = c.lastIndexOf('[')
                        if (!Object.hasOwn(this.tokens.links, c.slice(p + 1, -1))) return c
                        if (p > 1 && c.charAt(0) !== '!') {
                            let u = c.slice(1, p - 1)
                            if (this.linkInText(u))
                                return (
                                    '[' +
                                    u.replace(i, o) +
                                    '][' +
                                    'a'.repeat(c.length - p - 2) +
                                    ']'
                                )
                        }
                        return '[' + 'a'.repeat(c.length - 2) + ']'
                    }
                s = s.replace(i, o)
            }
            ;((s = s.replace(this.tokenizer.rules.inline.anyPunctuation, i =>
                '+'.repeat(i.length)
            )),
                (s = s.replace(this.tokenizer.rules.inline.blockSkip, (i, o, c) => {
                    let p = c ? c.length : 0
                    return i.slice(0, p) + '[' + 'a'.repeat(i.length - p - 2) + ']'
                })),
                (s = this.options.hooks?.emStrongMask?.call({ lexer: this }, s) ?? s))
            let n = !1,
                l = '',
                a = 1 / 0
            for (; e; ) {
                if (e.length < a) a = e.length
                else {
                    this.infiniteLoopError(e.charCodeAt(0))
                    break
                }
                ;(n || (l = ''), (n = !1))
                let i
                if (
                    this.options.extensions?.inline?.some(c =>
                        (i = c.call({ lexer: this }, e, t))
                            ? ((e = e.substring(i.raw.length)), t.push(i), !0)
                            : !1
                    )
                )
                    continue
                if ((i = this.tokenizer.escape(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.tag(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.link(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.reflink(e, this.tokens.links))) {
                    e = e.substring(i.raw.length)
                    let c = t.at(-1)
                    i.type === 'text' && c?.type === 'text'
                        ? ((c.raw += i.raw), (c.text += i.text))
                        : t.push(i)
                    continue
                }
                if ((i = this.tokenizer.emStrong(e, s, l))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.codespan(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.br(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.del(e, s, l))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if ((i = this.tokenizer.autolink(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                if (!this.state.inLink && (i = this.tokenizer.url(e))) {
                    ;((e = e.substring(i.raw.length)), t.push(i))
                    continue
                }
                let o = e
                if (this.options.extensions?.startInline) {
                    let c = 1 / 0,
                        p = e.slice(1),
                        u
                    ;(this.options.extensions.startInline.forEach(x => {
                        ;((u = x.call({ lexer: this }, p)),
                            typeof u == 'number' && u >= 0 && (c = Math.min(c, u)))
                    }),
                        c < 1 / 0 && c >= 0 && (o = e.substring(0, c + 1)))
                }
                if ((i = this.tokenizer.inlineText(o))) {
                    ;((e = e.substring(i.raw.length)),
                        i.raw.slice(-1) !== '_' && (l = i.raw.slice(-1)),
                        (n = !0))
                    let c = t.at(-1)
                    c?.type === 'text' ? ((c.raw += i.raw), (c.text += i.text)) : t.push(i)
                    continue
                }
                if (e) {
                    this.infiniteLoopError(e.charCodeAt(0))
                    break
                }
            }
            return t
        }
        infiniteLoopError(e) {
            let t = 'Infinite loop on byte: ' + e
            if (this.options.silent) console.error(t)
            else throw new Error(t)
        }
    },
    se = class {
        options
        parser
        constructor(r) {
            this.options = r || H
        }
        space(r) {
            return ''
        }
        code({ text: r, lang: e, escaped: t }) {
            let s = (e || '').match(R.notSpaceStart)?.[0],
                n =
                    r.replace(R.endingNewline, '') +
                    `
`
            return s
                ? '<pre><code class="language-' +
                      L(s) +
                      '">' +
                      (t ? n : L(n, !0)) +
                      `</code></pre>
`
                : '<pre><code>' +
                      (t ? n : L(n, !0)) +
                      `</code></pre>
`
        }
        blockquote({ tokens: r }) {
            return `<blockquote>
${this.parser.parse(r)}</blockquote>
`
        }
        html({ text: r }) {
            return r
        }
        def(r) {
            return ''
        }
        heading({ tokens: r, depth: e }) {
            return `<h${e}>${this.parser.parseInline(r)}</h${e}>
`
        }
        hr(r) {
            return `<hr>
`
        }
        list(r) {
            let e = r.ordered,
                t = r.start,
                s = ''
            for (let a = 0; a < r.items.length; a++) {
                let i = r.items[a]
                s += this.listitem(i)
            }
            let n = e ? 'ol' : 'ul',
                l = e && t !== 1 ? ' start="' + t + '"' : ''
            return (
                '<' +
                n +
                l +
                `>
` +
                s +
                '</' +
                n +
                `>
`
            )
        }
        listitem(r) {
            return `<li>${this.parser.parse(r.tokens)}</li>
`
        }
        checkbox({ checked: r }) {
            return '<input ' + (r ? 'checked="" ' : '') + 'disabled="" type="checkbox"> '
        }
        paragraph({ tokens: r }) {
            return `<p>${this.parser.parseInline(r)}</p>
`
        }
        table(r) {
            let e = '',
                t = ''
            for (let n = 0; n < r.header.length; n++) t += this.tablecell(r.header[n])
            e += this.tablerow({ text: t })
            let s = ''
            for (let n = 0; n < r.rows.length; n++) {
                let l = r.rows[n]
                t = ''
                for (let a = 0; a < l.length; a++) t += this.tablecell(l[a])
                s += this.tablerow({ text: t })
            }
            return (
                s && (s = `<tbody>${s}</tbody>`),
                `<table>
<thead>
` +
                    e +
                    `</thead>
` +
                    s +
                    `</table>
`
            )
        }
        tablerow({ text: r }) {
            return `<tr>
${r}</tr>
`
        }
        tablecell(r) {
            let e = this.parser.parseInline(r.tokens),
                t = r.header ? 'th' : 'td'
            return (
                (r.align ? `<${t} align="${r.align}">` : `<${t}>`) +
                e +
                `</${t}>
`
            )
        }
        strong({ tokens: r }) {
            return `<strong>${this.parser.parseInline(r)}</strong>`
        }
        em({ tokens: r }) {
            return `<em>${this.parser.parseInline(r)}</em>`
        }
        codespan({ text: r }) {
            return `<code>${L(r, !0)}</code>`
        }
        br(r) {
            return '<br>'
        }
        del({ tokens: r }) {
            return `<del>${this.parser.parseInline(r)}</del>`
        }
        link({ href: r, title: e, tokens: t }) {
            let s = this.parser.parseInline(t),
                n = ze(r)
            if (n === null) return s
            r = n
            let l = '<a href="' + r + '"'
            return (e && (l += ' title="' + L(e) + '"'), (l += '>' + s + '</a>'), l)
        }
        image({ href: r, title: e, text: t, tokens: s }) {
            s && (t = this.parser.parseInline(s, this.parser.textRenderer))
            let n = ze(r)
            if (n === null) return L(t)
            r = n
            let l = `<img src="${r}" alt="${L(t)}"`
            return (e && (l += ` title="${L(e)}"`), (l += '>'), l)
        }
        text(r) {
            return 'tokens' in r && r.tokens
                ? this.parser.parseInline(r.tokens)
                : 'escaped' in r && r.escaped
                  ? r.text
                  : L(r.text)
        }
    },
    Se = class {
        strong({ text: r }) {
            return r
        }
        em({ text: r }) {
            return r
        }
        codespan({ text: r }) {
            return r
        }
        del({ text: r }) {
            return r
        }
        html({ text: r }) {
            return r
        }
        text({ text: r }) {
            return r
        }
        link({ text: r }) {
            return '' + r
        }
        image({ text: r }) {
            return '' + r
        }
        br() {
            return ''
        }
        checkbox({ raw: r }) {
            return r
        }
    },
    A = class ke {
        options
        renderer
        textRenderer
        constructor(e) {
            ;((this.options = e || H),
                (this.options.renderer = this.options.renderer || new se()),
                (this.renderer = this.options.renderer),
                (this.renderer.options = this.options),
                (this.renderer.parser = this),
                (this.textRenderer = new Se()))
        }
        static parse(e, t) {
            return new ke(t).parse(e)
        }
        static parseInline(e, t) {
            return new ke(t).parseInline(e)
        }
        parse(e) {
            this.renderer.parser = this
            let t = ''
            for (let s = 0; s < e.length; s++) {
                let n = e[s]
                if (this.options.extensions?.renderers?.[n.type]) {
                    let a = n,
                        i = this.options.extensions.renderers[a.type].call({ parser: this }, a)
                    if (
                        i !== !1 ||
                        ![
                            'space',
                            'hr',
                            'heading',
                            'code',
                            'table',
                            'blockquote',
                            'list',
                            'checkbox',
                            'html',
                            'def',
                            'paragraph',
                            'text',
                        ].includes(a.type)
                    ) {
                        t += i || ''
                        continue
                    }
                }
                let l = n
                switch (l.type) {
                    case 'space': {
                        t += this.renderer.space(l)
                        break
                    }
                    case 'hr': {
                        t += this.renderer.hr(l)
                        break
                    }
                    case 'heading': {
                        t += this.renderer.heading(l)
                        break
                    }
                    case 'code': {
                        t += this.renderer.code(l)
                        break
                    }
                    case 'table': {
                        t += this.renderer.table(l)
                        break
                    }
                    case 'blockquote': {
                        t += this.renderer.blockquote(l)
                        break
                    }
                    case 'list': {
                        t += this.renderer.list(l)
                        break
                    }
                    case 'checkbox': {
                        t += this.renderer.checkbox(l)
                        break
                    }
                    case 'html': {
                        t += this.renderer.html(l)
                        break
                    }
                    case 'def': {
                        t += this.renderer.def(l)
                        break
                    }
                    case 'paragraph': {
                        t += this.renderer.paragraph(l)
                        break
                    }
                    case 'text': {
                        t += this.renderer.text(l)
                        break
                    }
                    default: {
                        let a = 'Token with "' + l.type + '" type was not found.'
                        if (this.options.silent) return (console.error(a), '')
                        throw new Error(a)
                    }
                }
            }
            return t
        }
        parseInline(e, t = this.renderer) {
            this.renderer.parser = this
            let s = ''
            for (let n = 0; n < e.length; n++) {
                let l = e[n]
                if (this.options.extensions?.renderers?.[l.type]) {
                    let i = this.options.extensions.renderers[l.type].call({ parser: this }, l)
                    if (
                        i !== !1 ||
                        ![
                            'escape',
                            'html',
                            'link',
                            'image',
                            'checkbox',
                            'strong',
                            'em',
                            'codespan',
                            'br',
                            'del',
                            'text',
                        ].includes(l.type)
                    ) {
                        s += i || ''
                        continue
                    }
                }
                let a = l
                switch (a.type) {
                    case 'escape': {
                        s += t.text(a)
                        break
                    }
                    case 'html': {
                        s += t.html(a)
                        break
                    }
                    case 'link': {
                        s += t.link(a)
                        break
                    }
                    case 'image': {
                        s += t.image(a)
                        break
                    }
                    case 'checkbox': {
                        s += t.checkbox(a)
                        break
                    }
                    case 'strong': {
                        s += t.strong(a)
                        break
                    }
                    case 'em': {
                        s += t.em(a)
                        break
                    }
                    case 'codespan': {
                        s += t.codespan(a)
                        break
                    }
                    case 'br': {
                        s += t.br(a)
                        break
                    }
                    case 'del': {
                        s += t.del(a)
                        break
                    }
                    case 'text': {
                        s += t.text(a)
                        break
                    }
                    default: {
                        let i = 'Token with "' + a.type + '" type was not found.'
                        if (this.options.silent) return (console.error(i), '')
                        throw new Error(i)
                    }
                }
            }
            return s
        }
    },
    F = class {
        options
        block
        constructor(r) {
            this.options = r || H
        }
        static passThroughHooks = new Set([
            'preprocess',
            'postprocess',
            'processAllTokens',
            'emStrongMask',
        ])
        static passThroughHooksRespectAsync = new Set([
            'preprocess',
            'postprocess',
            'processAllTokens',
        ])
        preprocess(r) {
            return r
        }
        postprocess(r) {
            return r
        }
        processAllTokens(r) {
            return r
        }
        emStrongMask(r) {
            return r
        }
        provideLexer(r = this.block) {
            return r ? z.lex : z.lexInline
        }
        provideParser(r = this.block) {
            return r ? A.parse : A.parseInline
        }
    },
    nr = class {
        defaults = fe()
        options = this.setOptions
        parse = this.parseMarkdown(!0)
        parseInline = this.parseMarkdown(!1)
        Parser = A
        Renderer = se
        TextRenderer = Se
        Lexer = z
        Tokenizer = ne
        Hooks = F
        constructor(...r) {
            this.use(...r)
        }
        walkTokens(r, e) {
            let t = []
            for (let s of r)
                switch (((t = t.concat(e.call(this, s))), s.type)) {
                    case 'table': {
                        let n = s
                        for (let l of n.header) t = t.concat(this.walkTokens(l.tokens, e))
                        for (let l of n.rows)
                            for (let a of l) t = t.concat(this.walkTokens(a.tokens, e))
                        break
                    }
                    case 'list': {
                        let n = s
                        t = t.concat(this.walkTokens(n.items, e))
                        break
                    }
                    default: {
                        let n = s
                        this.defaults.extensions?.childTokens?.[n.type]
                            ? this.defaults.extensions.childTokens[n.type].forEach(l => {
                                  let a = n[l].flat(1 / 0)
                                  t = t.concat(this.walkTokens(a, e))
                              })
                            : n.tokens && (t = t.concat(this.walkTokens(n.tokens, e)))
                    }
                }
            return t
        }
        use(...r) {
            let e = this.defaults.extensions || { renderers: {}, childTokens: {} }
            return (
                r.forEach(t => {
                    let s = { ...t }
                    if (
                        ((s.async = this.defaults.async || s.async || !1),
                        t.extensions &&
                            (t.extensions.forEach(n => {
                                if (!n.name) throw new Error('extension name required')
                                if ('renderer' in n) {
                                    let l = e.renderers[n.name]
                                    l
                                        ? (e.renderers[n.name] = function (...a) {
                                              let i = n.renderer.apply(this, a)
                                              return (i === !1 && (i = l.apply(this, a)), i)
                                          })
                                        : (e.renderers[n.name] = n.renderer)
                                }
                                if ('tokenizer' in n) {
                                    if (
                                        !n.level ||
                                        (n.level !== 'block' && n.level !== 'inline')
                                    )
                                        throw new Error(
                                            "extension level must be 'block' or 'inline'"
                                        )
                                    let l = e[n.level]
                                    ;(l
                                        ? l.unshift(n.tokenizer)
                                        : (e[n.level] = [n.tokenizer]),
                                        n.start &&
                                            (n.level === 'block'
                                                ? e.startBlock
                                                    ? e.startBlock.push(n.start)
                                                    : (e.startBlock = [n.start])
                                                : n.level === 'inline' &&
                                                  (e.startInline
                                                      ? e.startInline.push(n.start)
                                                      : (e.startInline = [n.start]))))
                                }
                                'childTokens' in n &&
                                    n.childTokens &&
                                    (e.childTokens[n.name] = n.childTokens)
                            }),
                            (s.extensions = e)),
                        t.renderer)
                    ) {
                        let n = this.defaults.renderer || new se(this.defaults)
                        for (let l in t.renderer) {
                            if (!(l in n)) throw new Error(`renderer '${l}' does not exist`)
                            if (['options', 'parser'].includes(l)) continue
                            let a = l,
                                i = t.renderer[a],
                                o = n[a]
                            n[a] = (...c) => {
                                let p = i.apply(n, c)
                                return (p === !1 && (p = o.apply(n, c)), p || '')
                            }
                        }
                        s.renderer = n
                    }
                    if (t.tokenizer) {
                        let n = this.defaults.tokenizer || new ne(this.defaults)
                        for (let l in t.tokenizer) {
                            if (!(l in n)) throw new Error(`tokenizer '${l}' does not exist`)
                            if (['options', 'rules', 'lexer'].includes(l)) continue
                            let a = l,
                                i = t.tokenizer[a],
                                o = n[a]
                            n[a] = (...c) => {
                                let p = i.apply(n, c)
                                return (p === !1 && (p = o.apply(n, c)), p)
                            }
                        }
                        s.tokenizer = n
                    }
                    if (t.hooks) {
                        let n = this.defaults.hooks || new F()
                        for (let l in t.hooks) {
                            if (!(l in n)) throw new Error(`hook '${l}' does not exist`)
                            if (['options', 'block'].includes(l)) continue
                            let a = l,
                                i = t.hooks[a],
                                o = n[a]
                            F.passThroughHooks.has(l)
                                ? (n[a] = c => {
                                      if (
                                          this.defaults.async &&
                                          F.passThroughHooksRespectAsync.has(l)
                                      )
                                          return (async () => {
                                              let u = await i.call(n, c)
                                              return o.call(n, u)
                                          })()
                                      let p = i.call(n, c)
                                      return o.call(n, p)
                                  })
                                : (n[a] = (...c) => {
                                      if (this.defaults.async)
                                          return (async () => {
                                              let u = await i.apply(n, c)
                                              return (u === !1 && (u = await o.apply(n, c)), u)
                                          })()
                                      let p = i.apply(n, c)
                                      return (p === !1 && (p = o.apply(n, c)), p)
                                  })
                        }
                        s.hooks = n
                    }
                    if (t.walkTokens) {
                        let n = this.defaults.walkTokens,
                            l = t.walkTokens
                        s.walkTokens = function (a) {
                            let i = []
                            return (
                                i.push(l.call(this, a)),
                                n && (i = i.concat(n.call(this, a))),
                                i
                            )
                        }
                    }
                    this.defaults = { ...this.defaults, ...s }
                }),
                this
            )
        }
        setOptions(r) {
            return ((this.defaults = { ...this.defaults, ...r }), this)
        }
        lexer(r, e) {
            return z.lex(r, e ?? this.defaults)
        }
        parser(r, e) {
            return A.parse(r, e ?? this.defaults)
        }
        parseMarkdown(r) {
            return (e, t) => {
                let s = { ...t },
                    n = { ...this.defaults, ...s },
                    l = this.onError(!!n.silent, !!n.async)
                if (this.defaults.async === !0 && s.async === !1)
                    return l(
                        new Error(
                            'marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.'
                        )
                    )
                if (typeof e > 'u' || e === null)
                    return l(new Error('marked(): input parameter is undefined or null'))
                if (typeof e != 'string')
                    return l(
                        new Error(
                            'marked(): input parameter is of type ' +
                                Object.prototype.toString.call(e) +
                                ', string expected'
                        )
                    )
                if ((n.hooks && ((n.hooks.options = n), (n.hooks.block = r)), n.async))
                    return (async () => {
                        let a = n.hooks ? await n.hooks.preprocess(e) : e,
                            i = await (
                                n.hooks
                                    ? await n.hooks.provideLexer(r)
                                    : r
                                      ? z.lex
                                      : z.lexInline
                            )(a, n),
                            o = n.hooks ? await n.hooks.processAllTokens(i) : i
                        n.walkTokens && (await Promise.all(this.walkTokens(o, n.walkTokens)))
                        let c = await (
                            n.hooks
                                ? await n.hooks.provideParser(r)
                                : r
                                  ? A.parse
                                  : A.parseInline
                        )(o, n)
                        return n.hooks ? await n.hooks.postprocess(c) : c
                    })().catch(l)
                try {
                    n.hooks && (e = n.hooks.preprocess(e))
                    let a = (n.hooks ? n.hooks.provideLexer(r) : r ? z.lex : z.lexInline)(e, n)
                    ;(n.hooks && (a = n.hooks.processAllTokens(a)),
                        n.walkTokens && this.walkTokens(a, n.walkTokens))
                    let i = (n.hooks ? n.hooks.provideParser(r) : r ? A.parse : A.parseInline)(
                        a,
                        n
                    )
                    return (n.hooks && (i = n.hooks.postprocess(i)), i)
                } catch (a) {
                    return l(a)
                }
            }
        }
        onError(r, e) {
            return t => {
                if (
                    ((t.message += `
Please report this to https://github.com/markedjs/marked.`),
                    r)
                ) {
                    let s = '<p>An error occurred:</p><pre>' + L(t.message + '', !0) + '</pre>'
                    return e ? Promise.resolve(s) : s
                }
                if (e) return Promise.reject(t)
                throw t
            }
        }
    },
    j = new nr()
function y(r, e) {
    return j.parse(r, e)
}
y.options = y.setOptions = function (r) {
    return (j.setOptions(r), (y.defaults = j.defaults), Be(y.defaults), y)
}
y.getDefaults = fe
y.defaults = H
function sr(...r) {
    return (j.use(...r), (y.defaults = j.defaults), Be(y.defaults), y)
}
y.use = sr
y.walkTokens = function (r, e) {
    return j.walkTokens(r, e)
}
y.parseInline = j.parseInline
y.Parser = A
y.parser = A.parse
y.Renderer = se
y.TextRenderer = Se
y.Lexer = z
y.lexer = z.lex
y.Tokenizer = ne
y.Hooks = F
y.parse = y
y.options
y.setOptions
y.walkTokens
y.parseInline
A.parse
z.lex
function ge(r) {
    return it.sanitize(y.parse(Fe(r) ?? '', { async: !1 }))
}
function lr(r, { delay: e = 150 } = {}) {
    const t = q(ge(r))
    let s = null
    return (
        pe(r, n => {
            ;(clearTimeout(s),
                (s = setTimeout(() => {
                    ;((s = null), (t.value = ge(n)))
                }, e)))
        }),
        Ve(() => {
            clearTimeout(s)
        }),
        { html: t }
    )
}
const ir = { class: 'flex items-center gap-2' },
    ar = { class: 'min-w-0 flex-1' },
    or = { key: 0, class: 'truncate text-xs text-neutral-500 dark:text-neutral-500' },
    cr = { class: 'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pl-10' },
    ur = { key: 0, class: 'truncate text-xs text-neutral-500 dark:text-neutral-400' },
    pr = ['disabled'],
    hr = { value: '', disabled: '' },
    dr = ['value'],
    kr = { key: 2, class: 'shrink-0 text-[10px] text-neutral-400 dark:text-neutral-600' },
    gr = {
        key: 3,
        class: 'flex min-w-0 items-center gap-1 text-xs text-amber-600 dark:text-amber-500',
    },
    fr = { class: 'mx-auto w-full max-w-2xl space-y-4 px-4 py-4' },
    xr = { key: 0, class: 'flex flex-col items-center justify-center py-16 text-center' },
    br = { key: 0, class: 'flex justify-end' },
    mr = {
        class: 'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-blue-600 px-3.5 py-2 text-sm text-white',
    },
    wr = { key: 1, class: 'flex justify-start' },
    yr = {
        key: 0,
        class: 'mb-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400',
    },
    vr = { key: 1, class: 'mb-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/60' },
    Sr = ['aria-expanded'],
    $r = {
        key: 0,
        class: 'max-h-48 overflow-y-auto whitespace-pre-wrap border-t border-neutral-200 px-2.5 py-2 text-xs leading-relaxed text-neutral-500 dark:border-neutral-700/60 dark:text-neutral-400',
    },
    Rr = { key: 2, class: 'mb-2 space-y-1' },
    _r = {
        key: 0,
        class: 'h-3.5 w-3.5 shrink-0 animate-spin',
        fill: 'none',
        viewBox: '0 0 24 24',
    },
    Tr = {
        key: 1,
        class: 'h-3.5 w-3.5 shrink-0 text-green-500',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '2',
        stroke: 'currentColor',
    },
    zr = {
        key: 2,
        class: 'h-3.5 w-3.5 shrink-0 text-red-500',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '2',
        stroke: 'currentColor',
    },
    Ar = { class: 'truncate font-mono' },
    Cr = { key: 3, class: 'text-red-500 dark:text-red-400' },
    Pr = { key: 3, class: 'text-sm' },
    Lr = ['innerHTML'],
    Br = { key: 1, class: 'flex items-center gap-1 py-1.5' },
    Er = ['innerHTML'],
    Ir = ['disabled', 'placeholder'],
    Mr = ['disabled', 'aria-label'],
    Le =
        'prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-headings:text-neutral-800 dark:prose-headings:text-neutral-200 prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-800 dark:prose-strong:text-neutral-200 prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-white dark:prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-800 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700',
    qr = {
        __name: 'ChatPanel',
        props: { inline: { type: Boolean, default: !1 } },
        emits: ['close'],
        setup(r, { emit: e }) {
            const t = e,
                s = Xe(),
                n = nt(),
                { isOnline: l } = st(),
                { success: a, error: i } = lt(),
                o = O(() => n.currentConversation),
                c = O(() => {
                    const d = []
                    for (const [h, w] of Object.entries(n.providers))
                        for (const C of w.models ?? []) d.push({ provider: h, model: C })
                    return d
                }),
                p = q(!1),
                u = O({
                    get() {
                        const d = o.value
                        if (!d) return ''
                        const h = c.value.findIndex(
                            w => w.provider === d.provider && w.model === d.model
                        )
                        return h === -1 ? '' : String(h)
                    },
                    async set(d) {
                        const h = o.value,
                            w = c.value[Number(d)]
                        if (!(!h || !w)) {
                            p.value = !0
                            try {
                                ;(await n.switchRouting(h.id, w.provider, w.model),
                                    a('Switched — applies from your next message.'))
                            } catch (C) {
                                i(C.response?.data?.message || 'Could not switch model.')
                            } finally {
                                p.value = !1
                            }
                        }
                    },
                }),
                x = O(() => n.messages.find(d => d.status === 'streaming') ?? null),
                { html: v } = lr(O(() => x.value?.content ?? ''))
            function m(d) {
                return d === n.messages.length - 1
            }
            const S = q(!1),
                _ = q(''),
                G = q(null),
                K = O(() => _.value.trim() !== '' && !n.streaming && l.value)
            function Y() {
                const d = _.value.trim()
                !d || n.streaming || !l.value || ((_.value = ''), J(Z), n.sendTurn(d))
            }
            function ie(d) {
                d.key === 'Enter' && !d.shiftKey && (d.preventDefault(), Y())
            }
            function Z() {
                const d = G.value
                d &&
                    ((d.style.height = 'auto'),
                    (d.style.height = `${Math.min(d.scrollHeight, 160)}px`))
            }
            const B = q(null),
                ae = q(!0)
            function Qe() {
                const d = B.value
                d && (ae.value = d.scrollHeight - d.scrollTop - d.clientHeight < 48)
            }
            function oe() {
                const d = B.value
                d && ae.value && (d.scrollTop = d.scrollHeight)
            }
            ;(pe(
                () => [
                    n.messages.length,
                    v.value,
                    n.reasoningBuffer,
                    n.toolActivity.map(d => d.status).join(),
                ],
                () => J(oe),
                { flush: 'post' }
            ),
                pe(
                    () => o.value?.id,
                    () => {
                        ;((ae.value = !0), J(oe))
                    }
                ),
                We(() => J(oe)))
            function Ne() {
                s.push({ name: 'chat.index' })
            }
            function Ge() {
                const d = o.value?.article_id
                d && s.push({ name: 'articles.show', params: { id: d } })
            }
            return (d, h) => (
                f(),
                b(
                    'div',
                    {
                        class: E([
                            'flex min-h-0 flex-col bg-white dark:bg-neutral-950',
                            r.inline
                                ? 'rounded-xl border border-neutral-200 dark:border-neutral-800'
                                : 'h-full',
                        ]),
                    },
                    [
                        k(
                            'header',
                            {
                                class: E([
                                    'flex shrink-0 flex-col gap-1 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2.5',
                                    r.inline ? '' : 'pt-safe',
                                ]),
                            },
                            [
                                k('div', ir, [
                                    r.inline
                                        ? (f(),
                                          b(
                                              'button',
                                              {
                                                  key: 1,
                                                  onClick: h[0] || (h[0] = w => t('close')),
                                                  class: '-ml-2 rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                  'aria-label': 'Close chat',
                                              },
                                              [
                                                  ...(h[7] ||
                                                      (h[7] = [
                                                          k(
                                                              'svg',
                                                              {
                                                                  class: 'h-5 w-5',
                                                                  fill: 'none',
                                                                  viewBox: '0 0 24 24',
                                                                  'stroke-width': '1.5',
                                                                  stroke: 'currentColor',
                                                              },
                                                              [
                                                                  k('path', {
                                                                      'stroke-linecap':
                                                                          'round',
                                                                      'stroke-linejoin':
                                                                          'round',
                                                                      d: 'M4.5 15.75l7.5-7.5 7.5 7.5',
                                                                  }),
                                                              ],
                                                              -1
                                                          ),
                                                      ])),
                                              ]
                                          ))
                                        : (f(),
                                          b(
                                              'button',
                                              {
                                                  key: 0,
                                                  onClick: Ne,
                                                  class: '-ml-2 rounded-lg p-2 text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200',
                                                  'aria-label': 'Back to conversations',
                                              },
                                              [
                                                  ...(h[6] ||
                                                      (h[6] = [
                                                          k(
                                                              'svg',
                                                              {
                                                                  class: 'h-5 w-5',
                                                                  fill: 'none',
                                                                  viewBox: '0 0 24 24',
                                                                  'stroke-width': '1.5',
                                                                  stroke: 'currentColor',
                                                              },
                                                              [
                                                                  k('path', {
                                                                      'stroke-linecap':
                                                                          'round',
                                                                      'stroke-linejoin':
                                                                          'round',
                                                                      d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                                                                  }),
                                                              ],
                                                              -1
                                                          ),
                                                      ])),
                                              ]
                                          )),
                                    k('div', ar, [
                                        (f(),
                                        Ke(
                                            Je(o.value?.article_id ? 'button' : 'p'),
                                            {
                                                class: E([
                                                    'block max-w-full truncate text-left text-sm font-semibold text-neutral-800 dark:text-neutral-200',
                                                    o.value?.article_id
                                                        ? 'hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
                                                        : '',
                                                ]),
                                                title:
                                                    o.value?.article_title ||
                                                    'Untitled article',
                                                onClick:
                                                    h[1] ||
                                                    (h[1] = w => o.value?.article_id && Ge()),
                                            },
                                            {
                                                default: Ye(() => [
                                                    ce(
                                                        T(
                                                            o.value?.article_title ||
                                                                'Untitled article'
                                                        ),
                                                        1
                                                    ),
                                                ]),
                                                _: 1,
                                            },
                                            8,
                                            ['class', 'title']
                                        )),
                                        o.value?.feed_title
                                            ? (f(), b('p', or, T(o.value.feed_title), 1))
                                            : P('', !0),
                                    ]),
                                ]),
                                k('div', cr, [
                                    c.value.length <= 1
                                        ? (f(),
                                          b(
                                              'span',
                                              ur,
                                              T(o.value?.provider) + ' · ' + T(o.value?.model),
                                              1
                                          ))
                                        : $e(
                                              (f(),
                                              b(
                                                  'select',
                                                  {
                                                      key: 1,
                                                      'onUpdate:modelValue':
                                                          h[2] || (h[2] = w => (u.value = w)),
                                                      disabled: $(n).streaming || p.value,
                                                      title: 'Switch model — applies from your next message',
                                                      class: 'max-w-[16rem] truncate rounded-md border border-neutral-300 bg-white px-1.5 py-1 text-xs text-neutral-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                                                  },
                                                  [
                                                      k(
                                                          'option',
                                                          hr,
                                                          T(o.value?.provider) +
                                                              ' · ' +
                                                              T(o.value?.model),
                                                          1
                                                      ),
                                                      (f(!0),
                                                      b(
                                                          ee,
                                                          null,
                                                          ue(
                                                              c.value,
                                                              (w, C) => (
                                                                  f(),
                                                                  b(
                                                                      'option',
                                                                      {
                                                                          key: C,
                                                                          value: String(C),
                                                                      },
                                                                      T(w.provider) +
                                                                          ' · ' +
                                                                          T(w.model),
                                                                      9,
                                                                      dr
                                                                  )
                                                              )
                                                          ),
                                                          128
                                                      )),
                                                  ],
                                                  8,
                                                  pr
                                              )),
                                              [[et, u.value]]
                                          ),
                                    c.value.length > 1
                                        ? (f(), b('span', kr, ' next message '))
                                        : P('', !0),
                                    o.value && !o.value.provider_available
                                        ? (f(),
                                          b('span', gr, [
                                              ...(h[8] ||
                                                  (h[8] = [
                                                      k(
                                                          'svg',
                                                          {
                                                              class: 'h-3.5 w-3.5 shrink-0',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1.5',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              k('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      k(
                                                          'span',
                                                          { class: 'truncate' },
                                                          'Model unavailable — switch for your next message.',
                                                          -1
                                                      ),
                                                  ])),
                                          ]))
                                        : P('', !0),
                                ]),
                            ],
                            2
                        ),
                        k(
                            'div',
                            {
                                ref_key: 'messagesEl',
                                ref: B,
                                onScrollPassive: Qe,
                                class: E([
                                    'min-h-0 flex-1 overflow-y-auto overscroll-contain',
                                    r.inline ? 'max-h-[28rem]' : '',
                                ]),
                            },
                            [
                                k('div', fr, [
                                    $(n).messages.length === 0
                                        ? (f(),
                                          b('div', xr, [
                                              ...(h[9] ||
                                                  (h[9] = [
                                                      k(
                                                          'svg',
                                                          {
                                                              class: 'h-16 w-16 text-neutral-300 dark:text-neutral-700',
                                                              fill: 'none',
                                                              viewBox: '0 0 24 24',
                                                              'stroke-width': '1',
                                                              stroke: 'currentColor',
                                                          },
                                                          [
                                                              k('path', {
                                                                  'stroke-linecap': 'round',
                                                                  'stroke-linejoin': 'round',
                                                                  d: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
                                                              }),
                                                          ],
                                                          -1
                                                      ),
                                                      k(
                                                          'h3',
                                                          {
                                                              class: 'mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300',
                                                          },
                                                          ' Ask something about this article ',
                                                          -1
                                                      ),
                                                      k(
                                                          'p',
                                                          {
                                                              class: 'mt-2 text-sm text-neutral-600 dark:text-neutral-500',
                                                          },
                                                          ' The assistant can read the article, search your feeds, highlights and past chats, and fetch pages. ',
                                                          -1
                                                      ),
                                                  ])),
                                          ]))
                                        : P('', !0),
                                    (f(!0),
                                    b(
                                        ee,
                                        null,
                                        ue(
                                            $(n).messages,
                                            (w, C) => (
                                                f(),
                                                b(
                                                    ee,
                                                    { key: w.id ?? C },
                                                    [
                                                        w.role === 'user'
                                                            ? (f(),
                                                              b('div', br, [
                                                                  k(
                                                                      'div',
                                                                      mr,
                                                                      T(w.content),
                                                                      1
                                                                  ),
                                                              ]))
                                                            : (f(),
                                                              b('div', wr, [
                                                                  k(
                                                                      'div',
                                                                      {
                                                                          class: E([
                                                                              'w-full max-w-[95%] rounded-2xl rounded-bl-sm border bg-neutral-50 px-3.5 py-2.5 dark:bg-neutral-900',
                                                                              w.status ===
                                                                              'failed'
                                                                                  ? 'border-red-300 dark:border-red-900/60'
                                                                                  : 'border-neutral-200 dark:border-neutral-800',
                                                                          ]),
                                                                      },
                                                                      [
                                                                          w.status === 'failed'
                                                                              ? (f(),
                                                                                b('p', yr, [
                                                                                    ...(h[10] ||
                                                                                        (h[10] =
                                                                                            [
                                                                                                k(
                                                                                                    'svg',
                                                                                                    {
                                                                                                        class: 'h-3.5 w-3.5 shrink-0',
                                                                                                        fill: 'none',
                                                                                                        viewBox:
                                                                                                            '0 0 24 24',
                                                                                                        'stroke-width':
                                                                                                            '1.5',
                                                                                                        stroke: 'currentColor',
                                                                                                    },
                                                                                                    [
                                                                                                        k(
                                                                                                            'path',
                                                                                                            {
                                                                                                                'stroke-linecap':
                                                                                                                    'round',
                                                                                                                'stroke-linejoin':
                                                                                                                    'round',
                                                                                                                d: 'M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l8.354 14.598zM12 15.75h.007v.008H12v-.008z',
                                                                                                            }
                                                                                                        ),
                                                                                                    ],
                                                                                                    -1
                                                                                                ),
                                                                                                ce(
                                                                                                    ' Response failed ',
                                                                                                    -1
                                                                                                ),
                                                                                            ])),
                                                                                ]))
                                                                              : P('', !0),
                                                                          m(C) &&
                                                                          $(n).reasoningBuffer
                                                                              ? (f(),
                                                                                b('div', vr, [
                                                                                    k(
                                                                                        'button',
                                                                                        {
                                                                                            onClick:
                                                                                                h[3] ||
                                                                                                (h[3] =
                                                                                                    U =>
                                                                                                        (S.value =
                                                                                                            !S.value)),
                                                                                            class: 'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200',
                                                                                            'aria-expanded':
                                                                                                S.value,
                                                                                        },
                                                                                        [
                                                                                            (f(),
                                                                                            b(
                                                                                                'svg',
                                                                                                {
                                                                                                    class: E(
                                                                                                        [
                                                                                                            'h-3.5 w-3.5 transition-transform duration-200',
                                                                                                            {
                                                                                                                'rotate-90':
                                                                                                                    S.value,
                                                                                                            },
                                                                                                        ]
                                                                                                    ),
                                                                                                    fill: 'none',
                                                                                                    viewBox:
                                                                                                        '0 0 24 24',
                                                                                                    'stroke-width':
                                                                                                        '2',
                                                                                                    stroke: 'currentColor',
                                                                                                },
                                                                                                [
                                                                                                    ...(h[11] ||
                                                                                                        (h[11] =
                                                                                                            [
                                                                                                                k(
                                                                                                                    'path',
                                                                                                                    {
                                                                                                                        'stroke-linecap':
                                                                                                                            'round',
                                                                                                                        'stroke-linejoin':
                                                                                                                            'round',
                                                                                                                        d: 'M8.25 4.5l7.5 7.5-7.5 7.5',
                                                                                                                    },
                                                                                                                    null,
                                                                                                                    -1
                                                                                                                ),
                                                                                                            ])),
                                                                                                ],
                                                                                                2
                                                                                            )),
                                                                                            h[12] ||
                                                                                                (h[12] =
                                                                                                    ce(
                                                                                                        ' Thinking ',
                                                                                                        -1
                                                                                                    )),
                                                                                        ],
                                                                                        8,
                                                                                        Sr
                                                                                    ),
                                                                                    S.value
                                                                                        ? (f(),
                                                                                          b(
                                                                                              'div',
                                                                                              $r,
                                                                                              T(
                                                                                                  $(
                                                                                                      n
                                                                                                  )
                                                                                                      .reasoningBuffer
                                                                                              ),
                                                                                              1
                                                                                          ))
                                                                                        : P(
                                                                                              '',
                                                                                              !0
                                                                                          ),
                                                                                ]))
                                                                              : P('', !0),
                                                                          m(C) &&
                                                                          $(n).toolActivity
                                                                              .length
                                                                              ? (f(),
                                                                                b('div', Rr, [
                                                                                    (f(!0),
                                                                                    b(
                                                                                        ee,
                                                                                        null,
                                                                                        ue(
                                                                                            $(
                                                                                                n
                                                                                            )
                                                                                                .toolActivity,
                                                                                            (
                                                                                                U,
                                                                                                Ue
                                                                                            ) => (
                                                                                                f(),
                                                                                                b(
                                                                                                    'div',
                                                                                                    {
                                                                                                        key: Ue,
                                                                                                        class: 'flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400',
                                                                                                    },
                                                                                                    [
                                                                                                        U.status ===
                                                                                                        'running'
                                                                                                            ? (f(),
                                                                                                              b(
                                                                                                                  'svg',
                                                                                                                  _r,
                                                                                                                  [
                                                                                                                      ...(h[13] ||
                                                                                                                          (h[13] =
                                                                                                                              [
                                                                                                                                  k(
                                                                                                                                      'circle',
                                                                                                                                      {
                                                                                                                                          class: 'opacity-25',
                                                                                                                                          cx: '12',
                                                                                                                                          cy: '12',
                                                                                                                                          r: '10',
                                                                                                                                          stroke: 'currentColor',
                                                                                                                                          'stroke-width':
                                                                                                                                              '4',
                                                                                                                                      },
                                                                                                                                      null,
                                                                                                                                      -1
                                                                                                                                  ),
                                                                                                                                  k(
                                                                                                                                      'path',
                                                                                                                                      {
                                                                                                                                          class: 'opacity-75',
                                                                                                                                          fill: 'currentColor',
                                                                                                                                          d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                                                                                                                      },
                                                                                                                                      null,
                                                                                                                                      -1
                                                                                                                                  ),
                                                                                                                              ])),
                                                                                                                  ]
                                                                                                              ))
                                                                                                            : U.status ===
                                                                                                                'completed'
                                                                                                              ? (f(),
                                                                                                                b(
                                                                                                                    'svg',
                                                                                                                    Tr,
                                                                                                                    [
                                                                                                                        ...(h[14] ||
                                                                                                                            (h[14] =
                                                                                                                                [
                                                                                                                                    k(
                                                                                                                                        'path',
                                                                                                                                        {
                                                                                                                                            'stroke-linecap':
                                                                                                                                                'round',
                                                                                                                                            'stroke-linejoin':
                                                                                                                                                'round',
                                                                                                                                            d: 'M4.5 12.75l6 6 9-13.5',
                                                                                                                                        },
                                                                                                                                        null,
                                                                                                                                        -1
                                                                                                                                    ),
                                                                                                                                ])),
                                                                                                                    ]
                                                                                                                ))
                                                                                                              : (f(),
                                                                                                                b(
                                                                                                                    'svg',
                                                                                                                    zr,
                                                                                                                    [
                                                                                                                        ...(h[15] ||
                                                                                                                            (h[15] =
                                                                                                                                [
                                                                                                                                    k(
                                                                                                                                        'path',
                                                                                                                                        {
                                                                                                                                            'stroke-linecap':
                                                                                                                                                'round',
                                                                                                                                            'stroke-linejoin':
                                                                                                                                                'round',
                                                                                                                                            d: 'M6 18L18 6M6 6l12 12',
                                                                                                                                        },
                                                                                                                                        null,
                                                                                                                                        -1
                                                                                                                                    ),
                                                                                                                                ])),
                                                                                                                    ]
                                                                                                                )),
                                                                                                        k(
                                                                                                            'span',
                                                                                                            Ar,
                                                                                                            T(
                                                                                                                U.name
                                                                                                            ),
                                                                                                            1
                                                                                                        ),
                                                                                                        U.status ===
                                                                                                        'failed'
                                                                                                            ? (f(),
                                                                                                              b(
                                                                                                                  'span',
                                                                                                                  Cr,
                                                                                                                  ' failed '
                                                                                                              ))
                                                                                                            : P(
                                                                                                                  '',
                                                                                                                  !0
                                                                                                              ),
                                                                                                    ]
                                                                                                )
                                                                                            )
                                                                                        ),
                                                                                        128
                                                                                    )),
                                                                                ]))
                                                                              : P('', !0),
                                                                          w.status ===
                                                                          'streaming'
                                                                              ? (f(),
                                                                                b('div', Pr, [
                                                                                    w.content
                                                                                        ? (f(),
                                                                                          b(
                                                                                              'div',
                                                                                              {
                                                                                                  key: 0,
                                                                                                  class: E(
                                                                                                      Le
                                                                                                  ),
                                                                                                  innerHTML:
                                                                                                      $(
                                                                                                          v
                                                                                                      ),
                                                                                              },
                                                                                              null,
                                                                                              8,
                                                                                              Lr
                                                                                          ))
                                                                                        : (f(),
                                                                                          b(
                                                                                              'div',
                                                                                              Br,
                                                                                              [
                                                                                                  ...(h[16] ||
                                                                                                      (h[16] =
                                                                                                          [
                                                                                                              k(
                                                                                                                  'span',
                                                                                                                  {
                                                                                                                      class: 'h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400',
                                                                                                                  },
                                                                                                                  null,
                                                                                                                  -1
                                                                                                              ),
                                                                                                              k(
                                                                                                                  'span',
                                                                                                                  {
                                                                                                                      class: 'h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]',
                                                                                                                  },
                                                                                                                  null,
                                                                                                                  -1
                                                                                                              ),
                                                                                                              k(
                                                                                                                  'span',
                                                                                                                  {
                                                                                                                      class: 'h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]',
                                                                                                                  },
                                                                                                                  null,
                                                                                                                  -1
                                                                                                              ),
                                                                                                          ])),
                                                                                              ]
                                                                                          )),
                                                                                ]))
                                                                              : w.content
                                                                                ? (f(),
                                                                                  b(
                                                                                      'div',
                                                                                      {
                                                                                          key: 4,
                                                                                          class: E(
                                                                                              Le
                                                                                          ),
                                                                                          innerHTML:
                                                                                              $(
                                                                                                  ge
                                                                                              )(
                                                                                                  w.content
                                                                                              ),
                                                                                      },
                                                                                      null,
                                                                                      8,
                                                                                      Er
                                                                                  ))
                                                                                : P('', !0),
                                                                      ],
                                                                      2
                                                                  ),
                                                              ])),
                                                    ],
                                                    64
                                                )
                                            )
                                        ),
                                        128
                                    )),
                                ]),
                            ],
                            34
                        ),
                        k(
                            'div',
                            {
                                class: E([
                                    'shrink-0 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
                                    r.inline ? '' : 'pb-safe',
                                ]),
                            },
                            [
                                k(
                                    'form',
                                    {
                                        class: 'mx-auto flex w-full max-w-2xl items-end gap-2 px-4 py-3',
                                        onSubmit: tt(Y, ['prevent']),
                                    },
                                    [
                                        $e(
                                            k(
                                                'textarea',
                                                {
                                                    ref_key: 'composerEl',
                                                    ref: G,
                                                    'onUpdate:modelValue':
                                                        h[4] || (h[4] = w => (_.value = w)),
                                                    rows: '1',
                                                    disabled: $(n).streaming || !$(l),
                                                    placeholder: $(n).streaming
                                                        ? 'Generating…'
                                                        : $(l)
                                                          ? 'Ask about this article…'
                                                          : 'You are offline',
                                                    class: 'max-h-40 min-h-9 flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500',
                                                    'aria-label': 'Message',
                                                    onKeydown: ie,
                                                    onInput: Z,
                                                },
                                                null,
                                                40,
                                                Ir
                                            ),
                                            [[rt, _.value]]
                                        ),
                                        $(n).streaming
                                            ? (f(),
                                              b(
                                                  'button',
                                                  {
                                                      key: 0,
                                                      type: 'button',
                                                      onClick:
                                                          h[5] ||
                                                          (h[5] = w => $(n).abortTurn()),
                                                      class: 'shrink-0 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800',
                                                      title: 'Stop generating',
                                                  },
                                                  [
                                                      ...(h[17] ||
                                                          (h[17] = [
                                                              k(
                                                                  'svg',
                                                                  {
                                                                      class: 'h-4 w-4',
                                                                      fill: 'currentColor',
                                                                      viewBox: '0 0 24 24',
                                                                  },
                                                                  [
                                                                      k('rect', {
                                                                          x: '6',
                                                                          y: '6',
                                                                          width: '12',
                                                                          height: '12',
                                                                          rx: '2',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                          ])),
                                                  ]
                                              ))
                                            : (f(),
                                              b(
                                                  'button',
                                                  {
                                                      key: 1,
                                                      type: 'submit',
                                                      disabled: !K.value,
                                                      class: 'shrink-0 rounded-xl bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-default disabled:opacity-40',
                                                      'aria-label': $(l)
                                                          ? 'Send message'
                                                          : 'Chat needs a connection',
                                                      title: 'Send',
                                                  },
                                                  [
                                                      ...(h[18] ||
                                                          (h[18] = [
                                                              k(
                                                                  'svg',
                                                                  {
                                                                      class: 'h-4 w-4',
                                                                      fill: 'none',
                                                                      viewBox: '0 0 24 24',
                                                                      'stroke-width': '2',
                                                                      stroke: 'currentColor',
                                                                  },
                                                                  [
                                                                      k('path', {
                                                                          'stroke-linecap':
                                                                              'round',
                                                                          'stroke-linejoin':
                                                                              'round',
                                                                          d: 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18',
                                                                      }),
                                                                  ],
                                                                  -1
                                                              ),
                                                          ])),
                                                  ],
                                                  8,
                                                  Mr
                                              )),
                                    ],
                                    32
                                ),
                            ],
                            2
                        ),
                    ],
                    2
                )
            )
        },
    },
    Qr = at(qr, [['__scopeId', 'data-v-b8f31491']])
export { Qr as C }
