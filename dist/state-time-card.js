/*! state-time-card 1.0.0 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r6.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/const.ts
var CARD_VERSION = "1.0.0";

// src/data.ts
var MINUTE = 6e4;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var formatters = /* @__PURE__ */ new Map();
function formatter(timeZone, options) {
  const key = `${timeZone ?? ""}|${JSON.stringify(options)}`;
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat("en-CA", { timeZone, hourCycle: "h23", ...options });
    formatters.set(key, format);
  }
  return format;
}
function part(parts, type) {
  return parts.find((entry) => entry.type === type)?.value ?? "";
}
function dayFormatter(timeZone) {
  const format = formatter(timeZone, { year: "numeric", month: "2-digit", day: "2-digit" });
  return (time) => {
    const parts = format.formatToParts(new Date(time));
    return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
  };
}
function startOfDay(time, timeZone) {
  const format = formatter(timeZone, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const parts = format.formatToParts(new Date(time));
  const since = (Number(part(parts, "hour")) * 3600 + Number(part(parts, "minute")) * 60 + Number(part(parts, "second"))) * 1e3;
  const guess = time - since - time % 1e3;
  const dayOf = dayFormatter(timeZone);
  const day = dayOf(time);
  if (dayOf(guess) !== day) {
    return guess + HOUR;
  }
  return dayOf(guess - HOUR) === day ? guess - HOUR : guess;
}
function endOfDay(start, timeZone) {
  return startOfDay(start + DAY + 2 * HOUR, timeZone);
}
function covers(changes, start) {
  return Boolean(changes?.length) && changes[0].time <= start;
}
function nextSelection(current, clicked, today) {
  return clicked === today || clicked === current ? void 0 : clicked;
}
function lastDays(count, now, timeZone) {
  const dayOf = dayFormatter(timeZone);
  const days = [];
  for (let time = now; days.length < count; time -= 6 * HOUR) {
    const day = dayOf(time);
    if (days[0]?.day !== day) {
      days.unshift({ day, time });
    }
  }
  return days;
}
function changesOf(answer, id) {
  const changes = [];
  for (const row of answer?.[id] ?? []) {
    const seconds = Number(row.lc ?? row.lu);
    if (typeof row.s === "string" && Number.isFinite(seconds)) {
      changes.push({ time: seconds * 1e3, state: row.s });
    }
  }
  return changes.sort((one, other) => one.time - other.time);
}
function segmentsOf(changes, from, to, counted) {
  const segments = [];
  changes.forEach((change, index) => {
    const start = Math.max(change.time, from);
    const end = Math.min(changes[index + 1]?.time ?? to, to);
    if (end <= start) {
      return;
    }
    const state = counted.includes(change.state) ? change.state : null;
    const last = segments[segments.length - 1];
    if (last && last.state === state && last.end === start) {
      last.end = end;
    } else {
      segments.push({ start, end, state });
    }
  });
  return segments;
}
function hoursFromHistory(changes, state, days, now, timeZone) {
  const first = changes[0]?.time;
  return days.map(({ time }) => {
    const start = startOfDay(time, timeZone);
    const end = Math.min(endOfDay(start, timeZone), now);
    if (first === void 0 || first >= end) {
      return null;
    }
    const spent = segmentsOf(changes, start, end, [state]).filter((segment) => segment.state === state).reduce((sum, segment) => sum + segment.end - segment.start, 0);
    return spent / HOUR;
  });
}
function hoursFromCounter(rows, days, live, timeZone) {
  const dayOf = dayFormatter(timeZone);
  const totals = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const day = dayOf(row.start);
    if (typeof row.max !== "number" || dayOf(row.start - HOUR) !== day) {
      continue;
    }
    totals.set(day, Math.max(totals.get(day) ?? row.max, row.max));
  }
  return days.map(({ day }, index) => {
    if (index === days.length - 1 && live !== null) {
      return live;
    }
    return totals.get(day) ?? null;
  });
}
function filled(counter, history) {
  return counter.map((value, index) => value ?? history[index] ?? null);
}
function needsFetch(asked, wanted) {
  return !asked || asked.key !== wanted.key || asked.day !== wanted.day || wanted.from < asked.from;
}
function historyStart(counters, days, timeZone) {
  const past = days.slice(0, -1);
  const first = past.findIndex((_2, index) => counters.some((hours) => hours === null || hours[index] === null));
  return startOfDay(first === -1 ? days[days.length - 1].time : past[first].time, timeZone);
}
function mergeChanges(fetched, current) {
  const last = fetched[fetched.length - 1]?.time ?? -Infinity;
  return [...fetched, ...current.filter((change) => change.time > last)];
}
function toHours(value, unit) {
  switch (unit) {
    case "d":
      return value * 24;
    case "min":
      return value / 60;
    case "s":
      return value / 3600;
    default:
      return value;
  }
}
function counterNow(hass, id) {
  const entity = hass.states[id];
  const value = Number.parseFloat(entity?.state ?? "");
  return entity && Number.isFinite(value) ? toHours(value, entity.attributes.unit_of_measurement) : null;
}
async function fetchChanges(hass, id, from, now) {
  if (!hass.callWS) {
    return [];
  }
  const answer = await hass.callWS({
    type: "history/history_during_period",
    start_time: new Date(from).toISOString(),
    end_time: new Date(now).toISOString(),
    entity_ids: [id],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false
  });
  return changesOf(answer, id);
}
async function fetchCounters(hass, ids, from, now) {
  if (!hass.callWS || ids.length === 0) {
    return {};
  }
  const answer = await hass.callWS({
    type: "recorder/statistics_during_period",
    start_time: new Date(from).toISOString(),
    end_time: new Date(now).toISOString(),
    statistic_ids: ids,
    period: "hour",
    types: ["max"],
    units: { duration: "h" }
  });
  return answer ?? {};
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "State time card",
    description: "How much of each day an entity spent in each state, today's timeline and daily bars.",
    no_entity: "Choose an entity.",
    no_states: "Choose at least one state to count.",
    invalid_days: "The range must be 14, 30, 60 or 90 days.",
    invalid_row_step: "The rounding must be full or half.",
    unknown_entity: "Entity not found"
  },
  card: {
    hours: "h",
    minutes: "min",
    days: "{count} d",
    average: "Average",
    other: "Other or no data",
    no_data: "No data",
    no_history: "No history left for this day",
    range: "Range"
  },
  editor: {
    title: "Title",
    entity: "Entity",
    states: "States to count",
    states_helper: "Every other state counts as other. A counter keeps days for longer than the recorder keeps history.",
    state: "State",
    state_helper: "As Home Assistant stores it, such as on or playing.",
    name: "Name",
    color: "Colour",
    color_helper: "Any CSS colour. Left empty, the theme decides.",
    counter: "Counter",
    counter_helper: "A History Stats sensor of type time for this state, from midnight to now.",
    days: "Range shown first",
    row_step: "Rounding in a sections view",
    row_step_helper: "With automatic row height, the card's height is rounded up to whole rows, or to half rows to save space.",
    row_step_full: "Whole rows",
    row_step_half: "Half rows"
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "Tilojen aikakortti",
    description: "Kuinka suuren osan kustakin p\xE4iv\xE4st\xE4 entiteetti vietti kussakin tilassa, t\xE4m\xE4n p\xE4iv\xE4n aikajana ja p\xE4iv\xE4pylv\xE4\xE4t.",
    no_entity: "Valitse entiteetti.",
    no_states: "Valitse v\xE4hint\xE4\xE4n yksi laskettava tila.",
    invalid_days: "Jakson pit\xE4\xE4 olla 14, 30, 60 tai 90 p\xE4iv\xE4\xE4.",
    invalid_row_step: "Py\xF6ristyksen pit\xE4\xE4 olla full tai half.",
    unknown_entity: "Entiteetti\xE4 ei l\xF6ydy"
  },
  card: {
    hours: "h",
    minutes: "min",
    days: "{count} pv",
    average: "Keskim\xE4\xE4rin",
    other: "Muu tila tai ei tietoa",
    no_data: "Ei tietoa",
    no_history: "T\xE4m\xE4n p\xE4iv\xE4n historiaa ei ole en\xE4\xE4 tallessa",
    range: "Jakso"
  },
  editor: {
    title: "Otsikko",
    entity: "Entiteetti",
    states: "Laskettavat tilat",
    states_helper: "Muut tilat lasketaan muuksi. Laskuri s\xE4ilytt\xE4\xE4 p\xE4iv\xE4t pidemp\xE4\xE4n kuin tallennin s\xE4ilytt\xE4\xE4 historian.",
    state: "Tila",
    state_helper: "Kuten Home Assistant sen tallentaa, esimerkiksi on tai playing.",
    name: "Nimi",
    color: "V\xE4ri",
    color_helper: "Mik\xE4 tahansa CSS-v\xE4ri. Tyhj\xE4n\xE4 teema p\xE4\xE4tt\xE4\xE4.",
    counter: "Laskuri",
    counter_helper: "T\xE4m\xE4n tilan History Stats -anturi, tyyppi\xE4 aika, keskiy\xF6st\xE4 t\xE4h\xE4n hetkeen.",
    days: "Ensin n\xE4ytett\xE4v\xE4 jakso",
    row_step: "Py\xF6ristys osioihin jaetussa n\xE4kym\xE4ss\xE4",
    row_step_helper: "Automaattisella rivikorkeudella kortin korkeus py\xF6ristet\xE4\xE4n yl\xF6sp\xE4in kokonaisiin riveihin, tai tilan s\xE4\xE4st\xE4miseksi puolikkaisiin riveihin.",
    row_step_full: "Kokonaisiin riveihin",
    row_step_half: "Puolikkaisiin riveihin"
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  for (const code of languageCodes(language)) {
    const text = read(LANGUAGES[code], key);
    if (text !== void 0) {
      return text;
    }
  }
  return read(LANGUAGES.en, key) ?? key;
}
function languageCodes(language) {
  const tag = (language ?? "en").trim().toLowerCase().replace(/_/g, "-");
  const base = tag.split("-")[0];
  return tag === base ? [base] : [tag, base];
}
function read(table, key) {
  let value = table;
  for (const part2 of key.split(".")) {
    if (value === null || typeof value !== "object") {
      return void 0;
    }
    value = value[part2];
  }
  return typeof value === "string" ? value : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/height.ts
function heightMode(config) {
  return config.height_mode ?? (config.height ? "fixed" : config.max_height ? "max" : "auto");
}
var ROW_HEIGHT = 56;
var ROW_GAP = 8;
function gridMinRows(minimum) {
  return Math.max(1, Math.ceil((minimum + ROW_GAP) / (ROW_HEIGHT + ROW_GAP)));
}

// src/rows.ts
var ROW_STEPS = ["full", "half"];
var ROW_PX = 64;
var ROW_GAP_PX = 8;
function validRowStep(config) {
  return config.row_step === void 0 || config.row_step === null || ROW_STEPS.includes(config.row_step);
}
var step = (config) => config.row_step === "half" ? ROW_PX / 2 : ROW_PX;
var SLACK_PX = 0.01;
function drawnScale(card) {
  const layout = Number.parseFloat(getComputedStyle(card).width) || 0;
  const drawn = card.getBoundingClientRect().width;
  return layout > 0 && drawn > 0 ? drawn / layout : 1;
}
function filledHeight(content, config, limit = Infinity) {
  return Math.min(Math.max(1, Math.ceil((content - SLACK_PX + ROW_GAP_PX) / step(config))) * step(config) - ROW_GAP_PX, limit);
}
function spareRoom(filled2, content) {
  return Math.max(0, Math.floor(filled2 - content + SLACK_PX));
}
function heldSpare(held, content) {
  const spare = spareRoom(held, content);
  return spare < ROW_PX ? spare : 0;
}
function fillLimit(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout !== "grid" || typeof rows === "number") {
    return 0;
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return 0;
  }
  if (mode !== "max" || !config.max_height) {
    return Infinity;
  }
  const down = Math.floor((config.max_height + ROW_GAP_PX) / step(config)) * step(config) - ROW_GAP_PX;
  return Math.max(down, filledHeight(minimum, config));
}
function rowStepSchema(config, text) {
  if (heightMode(config) === "fixed" && config.height) {
    return [];
  }
  return [
    {
      name: "row_step",
      selector: {
        select: { mode: "dropdown", options: ROW_STEPS.map((value) => ({ value, label: text(`editor.row_step_${value}`) })) }
      }
    }
  ];
}
function rowStepData(config) {
  return { ...config, row_step: config.row_step ?? "full" };
}
function tidyRowStep(config) {
  const tidied = { ...config };
  if (tidied.row_step !== "half" || heightMode(tidied) === "fixed" && tidied.height) {
    delete tidied.row_step;
  }
  return tidied;
}

// src/types.ts
var RANGES = [14, 30, 60, 90];
var DEFAULT_RANGE = 14;
var COLORS = [
  "var(--primary-color)",
  "var(--state-time-card-second-color, #6b7d99)",
  "var(--info-color, #039be5)",
  "var(--warning-color, #ffa600)",
  "var(--success-color, #43a047)",
  "var(--error-color, #db4437)"
];
function statesOf(config) {
  return (config.states ?? []).map((entry) => typeof entry === "string" ? { state: entry } : entry).filter((entry) => entry?.state).map((state, index) => ({ ...state, color: state.color || COLORS[index % COLORS.length] }));
}

// src/editor.ts
function schema(config, text) {
  return [
    { name: "entity", required: true, selector: { entity: {} } },
    { name: "title", selector: { text: {} } },
    {
      name: "states",
      required: true,
      selector: {
        object: {
          multiple: true,
          label_field: "state",
          description_field: "name",
          fields: {
            state: {
              label: text("editor.state"),
              description: text("editor.state_helper"),
              required: true,
              selector: { text: {} }
            },
            name: { label: text("editor.name"), selector: { text: {} } },
            color: { label: text("editor.color"), description: text("editor.color_helper"), selector: { text: {} } },
            counter: {
              label: text("editor.counter"),
              description: text("editor.counter_helper"),
              selector: { entity: { filter: { domain: "sensor", integration: "history_stats" } } }
            }
          }
        }
      }
    },
    {
      name: "days",
      selector: {
        select: {
          mode: "dropdown",
          options: RANGES.map((days) => ({ value: String(days), label: text("card.days").replace("{count}", String(days)) }))
        }
      }
    },
    ...rowStepSchema(config, text)
  ];
}
function formData(config) {
  const states = (config.states ?? []).map((entry) => typeof entry === "string" ? { state: entry } : entry);
  return { ...rowStepData(config), states, days: String(config.days ?? DEFAULT_RANGE) };
}
function configFromForm(value) {
  const config = tidyRowStep({ ...value });
  config.states = (value.states ?? []).map((entry) => {
    const tidy = { state: entry.state };
    for (const key of ["name", "color", "counter"]) {
      if (entry[key]) {
        tidy[key] = entry[key];
      }
    }
    return Object.keys(tidy).length === 1 ? tidy.state : tidy;
  });
  const days = Number(config.days);
  if (!days || days === DEFAULT_RANGE) {
    delete config.days;
  } else {
    config.days = days;
  }
  if (!config.title) {
    delete config.title;
  }
  return config;
}
var StateTimeCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = { type: "custom:state-time-card", entity: "", states: [] };
  }
  setConfig(config) {
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    const text = (key) => translate(this.language(), key);
    const data = formData(this.config);
    const fields = schema(this.config, text);
    const form = (part2) => b2`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${part2}
                .computeLabel=${(entry) => text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
    return b2`${form(fields.slice(0, 3))}
            <p class="helper">${text("editor.states_helper")}</p>
            ${form(fields.slice(3))}`;
  }
  static get styles() {
    return i`
            .helper {
                margin: 8px 0 16px;
                padding: 0 16px;
                font-size: 12px;
                line-height: 1.4;
                color: var(--secondary-text-color);
            }
        `;
  }
  valueChanged(event) {
    const config = configFromForm(event.detail.value);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], StateTimeCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], StateTimeCardEditor.prototype, "config", 2);
StateTimeCardEditor = __decorateClass([
  t3("state-time-card-editor")
], StateTimeCardEditor);

// src/state-time-card.ts
console.info(
  `%c  STATE-TIME-CARD 
%c  ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
var registry = window;
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
  type: "state-time-card",
  name: translate(browserLanguage(), "common.name"),
  description: translate(browserLanguage(), "common.description"),
  documentationURL: "https://github.com/jesmak/state-time-card",
  preview: true
});
var REFRESH_INTERVAL = 15 * MINUTE;
var TICK_INTERVAL = MINUTE;
var LABEL_EVERY = { 14: 2, 30: 5, 60: 10, 90: 15 };
var GRID_HOURS = 4;
var ON_OFF_DOMAINS = ["switch", "input_boolean", "binary_sensor", "light", "fan"];
function durationParts(hours) {
  const minutes = Math.round(hours * 60);
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
function averageOf(hours) {
  const past = hours.slice(0, -1).filter((value) => value !== null);
  return past.length ? past.reduce((sum, value) => sum + value, 0) / past.length : null;
}
function stubConfig(hass) {
  const ids = Object.keys(hass?.states ?? {}).sort();
  const entity = ids.find((id) => ON_OFF_DOMAINS.includes(id.split(".")[0])) ?? ids[0] ?? "";
  return { entity, states: ["on"] };
}
var StateTimeCard = class extends i4 {
  constructor() {
    super(...arguments);
    this.range = DEFAULT_RANGE;
    this.counterRows = {};
    this.now = Date.now();
    this.filled = 0;
    this.held = false;
    this.grows = false;
    this.fetching = false;
    this.timers = [];
    this.resizer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(() => this.scheduleFill());
    this.fillFrame = 0;
  }
  static getConfigElement() {
    return document.createElement("state-time-card-editor");
  }
  static getStubConfig(hass) {
    return stubConfig(hass);
  }
  setConfig(config) {
    const text = (key) => translate(this.language(), key);
    if (!config?.entity) {
      throw new Error(text("common.no_entity"));
    }
    if (!Array.isArray(config.states) || statesOf(config).length === 0) {
      throw new Error(text("common.no_states"));
    }
    if (config.days != null && !RANGES.includes(config.days)) {
      throw new Error(text("common.invalid_days"));
    }
    if (!validRowStep(config)) {
      throw new Error(text("common.invalid_row_step"));
    }
    const changed = this.config?.entity !== config.entity || JSON.stringify(this.config?.states) !== JSON.stringify(config.states);
    this.config = config;
    this.range = config.days ?? DEFAULT_RANGE;
    if (changed) {
      this.changes = void 0;
      this.counterRows = {};
      this.asked = void 0;
      this.dayChanges = void 0;
    }
  }
  getCardSize() {
    return Math.ceil(this.minimumHeight() / 50);
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: gridMinRows(this.minimumHeight()) };
  }
  connectedCallback() {
    super.connectedCallback();
    this.timers = [
      window.setInterval(() => this.now = Date.now(), TICK_INTERVAL),
      window.setInterval(() => this.load(true), REFRESH_INTERVAL)
    ];
    this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.resizer?.disconnect();
    cancelAnimationFrame(this.fillFrame);
  }
  /**
   * Home Assistant hands the card a new `hass` at every state change in the house. Only the entity's, its counters' and
   * the language's or time zone's draw the card again.
   */
  shouldUpdate(changed) {
    const old = changed.get("hass");
    const hass = this.hass;
    if (changed.size !== 1 || !old || !hass || !this.config) {
      return true;
    }
    const counters = statesOf(this.config).flatMap((entry) => entry.counter ? [entry.counter] : []);
    const watched = [this.config.entity, ...counters];
    return old.language !== hass.language || old.locale?.language !== hass.locale?.language || old.config?.time_zone !== hass.config?.time_zone || watched.some((id) => old.states[id] !== hass.states[id]);
  }
  willUpdate(changed) {
    const today = dayFormatter(this.hass?.config?.time_zone)(this.now);
    if (this.selected && (changed.has("range") || changed.has("config") || this.selected.on !== today)) {
      this.selected = void 0;
    }
    if (changed.has("hass") && this.hass && this.config) {
      const entity = this.hass.states[this.config.entity];
      const old = changed.get("hass")?.states[this.config.entity];
      if (entity && old && entity.last_changed !== old.last_changed && this.changes) {
        this.changes = [...this.changes, { time: Date.parse(entity.last_changed), state: entity.state }];
        this.now = Date.now();
      }
    }
  }
  updated(changed) {
    if (changed.has("hass") || changed.has("config") || changed.has("range")) {
      this.load();
    }
    if (changed.has("selected") || changed.has("changes")) {
      this.loadDay();
    }
    const card = this.renderRoot.querySelector("ha-card");
    if (card && this.resizer) {
      this.resizer.observe(card);
    }
    this.scheduleFill();
  }
  /** Asks the recorder for the chosen day's history when the stored changes don't reach it, for its timeline. */
  async loadDay() {
    const hass = this.hass;
    const config = this.config;
    const selected = this.selected;
    const timeZone = hass?.config?.time_zone;
    const day = selected?.day.day;
    if (!hass?.callWS || !config || !selected || this.dayChanges?.day === day || this.fetchingDay === day) {
      return;
    }
    const start = startOfDay(selected.day.time, timeZone);
    if (covers(this.changes, start)) {
      return;
    }
    this.fetchingDay = day;
    try {
      const changes = await fetchChanges(hass, config.entity, start, endOfDay(start, timeZone));
      if (this.selected === selected && this.config === config) {
        this.dayChanges = { day: selected.day.day, changes };
      }
    } catch (error) {
      console.error("state-time-card: the recorder didn't answer", error);
    } finally {
      if (this.fetchingDay === day) {
        this.fetchingDay = void 0;
      }
    }
  }
  /** Asks the recorder for what the range needs, unless the last answers already cover it. Forced, it asks again. */
  async load(force = false) {
    const hass = this.hass;
    const config = this.config;
    if (!hass?.callWS || !config || !hass.states[config.entity] || this.fetching) {
      return;
    }
    const timeZone = hass.config?.time_zone;
    const states = statesOf(config);
    const counters = states.map((entry) => entry.counter).filter((id) => Boolean(id));
    const now = Date.now();
    const days = lastDays(this.range, now, timeZone);
    const wanted = {
      key: `${config.entity}|${counters.join(",")}`,
      from: startOfDay(days[0].time, timeZone),
      day: days[days.length - 1].day
    };
    if (!force && !needsFetch(this.asked, wanted)) {
      return;
    }
    this.fetching = true;
    try {
      const counterRows = await fetchCounters(hass, counters, wanted.from, now);
      const counterDays = states.map(
        (entry) => entry.counter ? hoursFromCounter(counterRows[entry.counter] ?? [], days, null, timeZone) : null
      );
      const changes = await fetchChanges(hass, config.entity, historyStart(counterDays, days, timeZone), now);
      if (this.config === config) {
        this.changes = mergeChanges(changes, this.changes ?? []);
        this.counterRows = counterRows;
        this.now = Date.now();
        this.asked = wanted;
      }
    } catch (error) {
      console.error("state-time-card: the recorder didn't answer", error);
    } finally {
      this.fetching = false;
    }
    if (this.config !== config) {
      this.load();
    }
  }
  render() {
    const hass = this.hass;
    const config = this.config;
    if (!hass || !config) {
      return A;
    }
    const entity = hass.states[config.entity];
    if (!entity) {
      return b2`<ha-card><div class="warning">${this.text("common.unknown_entity")}: ${config.entity}</div></ha-card>`;
    }
    const timeZone = hass.config?.time_zone;
    const days = lastDays(this.range, this.now, timeZone);
    const series = this.series(entity, days);
    const chosen = this.selected ? days.findIndex((day) => day.day === this.selected?.day.day) : -1;
    const shown = chosen === -1 ? days.length - 1 : chosen;
    return b2`
            <ha-card
                class=${this.grows ? "grows" : ""}
                style=${this.filled ? `min-height: ${this.filled}px` : this.held ? "height: 100%" : ""}
            >
                <div class="content">
                    <div class="head">
                        <span class="title">${config.title || this.entityName(entity)}</span>
                        <span class="date">${this.dateText(days[shown].time, { weekday: "short", day: "numeric", month: "numeric" })}</span>
                    </div>
                    ${this.renderTotals(series, shown)} ${this.renderTimeline(series, days[shown], shown === days.length - 1)}
                    <div class="ranges" role="group" aria-label=${this.text("card.range")}>
                        ${RANGES.map(
      (range) => b2`<button
                                    class=${range === this.range ? "chip on" : "chip"}
                                    aria-pressed=${range === this.range}
                                    @click=${() => this.range = range}
                                >
                                    ${this.text("card.days").replace("{count}", String(range))}
                                </button>`
    )}
                    </div>
                    ${this.renderBars(series, days, shown)} ${this.renderFoot(series)}
                </div>
            </ha-card>
        `;
  }
  /** Each counted state's hours per day: from its counter where it has one, and from the history for the days it has not. */
  series(entity, days) {
    const hass = this.hass;
    const timeZone = hass.config?.time_zone;
    return statesOf(this.config).map((entry) => {
      const history = this.changes ? hoursFromHistory(this.changes, entry.state, days, this.now, timeZone) : days.map(() => null);
      return {
        state: entry.state,
        name: this.stateName(entity, entry),
        color: entry.color,
        hours: entry.counter ? filled(
          hoursFromCounter(this.counterRows[entry.counter] ?? [], days, counterNow(hass, entry.counter), timeZone),
          history
        ) : history
      };
    });
  }
  renderTotals(series, index) {
    const day = series.map((entry) => entry.hours[index]);
    const counted = day.reduce((sum, value) => sum + (value ?? 0), 0);
    const share = series.length > 1 && counted > 0 ? Math.round(100 * (day[0] ?? 0) / counted) : null;
    return b2`
            <div class="totals">
                ${series.map((entry, index2) => {
      const value = day[index2];
      return b2`<div class="total">
                        <div class="value">${value === null ? "\u2013" : this.duration(value, true)}</div>
                        <div class="label"><span class="swatch" style="background: ${entry.color}"></span>${entry.name}</div>
                    </div>`;
    })}
                ${share === null ? A : b2`<div class="total share">
                              <div class="value" style="color: ${series[0].color}">${share}<small>%</small></div>
                              <div class="label">${series[0].name}</div>
                          </div>`}
            </div>
        `;
  }
  /**
   * The day's timeline from midnight, up to now for today. A past day's comes from the stored changes when they reach
   * it, otherwise from its own history, asked for when the day was chosen.
   */
  renderTimeline(series, day, isToday) {
    const timeZone = this.hass?.config?.time_zone;
    const start = startOfDay(day.time, timeZone);
    const end = endOfDay(start, timeZone);
    const until = isToday ? this.now : end;
    const stored = isToday || covers(this.changes, start);
    const own = this.dayChanges?.day === day.day ? this.dayChanges.changes : void 0;
    const changes = stored ? this.changes ?? [] : own ?? [];
    const gone = !stored && own?.length === 0;
    const colors = new Map(series.map((entry) => [entry.state, entry]));
    const segments = segmentsOf(
      changes,
      start,
      until,
      series.map((entry) => entry.state)
    ).filter((segment) => segment.state !== null);
    const share = (milliseconds) => `${(100 * milliseconds / (end - start)).toFixed(3)}%`;
    return b2`
            <div class="timeline">
                <div class="track">
                    <div class="past" style="width: ${share(until - start)}"></div>
                    ${gone ? b2`<span class="gone" title=${this.text("card.no_history")}>${this.text("card.no_history")}</span>` : A}
                    ${segments.map((segment) => {
      const entry = colors.get(segment.state);
      const tip = `${entry.name} ${this.clock(segment.start)}\u2013${this.clock(segment.end)}`;
      return b2`<div
                            class="segment"
                            title=${tip}
                            style="left: ${share(segment.start - start)}; width: ${share(segment.end - segment.start)}; background: ${entry.color}"
                        ></div>`;
    })}
                </div>
                <div class="ticks">${[0, 6, 12, 18, 24].map((hour) => b2`<span style="left: ${100 * hour / 24}%">${hour}</span>`)}</div>
            </div>
        `;
  }
  /** The bars, each a button that shows its day at the top, or today again when it is already shown. */
  renderBars(series, days, shown) {
    const today = days[days.length - 1].day;
    const totals = days.map((_2, index) => series.reduce((sum, entry) => sum + (entry.hours[index] ?? 0), 0));
    const top = Math.max(GRID_HOURS, Math.ceil(Math.max(...totals) / GRID_HOURS) * GRID_HOURS);
    const gap = days.length > 30 ? 1 : days.length > 14 ? 2 : 3;
    const every = LABEL_EVERY[days.length] ?? 5;
    const grid = [];
    for (let hours = GRID_HOURS; hours < top; hours += GRID_HOURS) {
      grid.push(
        b2`<div class="grid" style="bottom: ${100 * hours / top}%"><span>${hours} ${this.text("card.hours")}</span></div>`
      );
    }
    return b2`
            <div class="chart">
                <div class="bars" style="gap: ${gap}px">
                    ${grid}
                    ${days.map((day, index) => {
      const known = series.some((entry) => entry.hours[index] !== null);
      const tip = [
        this.dateText(day.time, { weekday: "short", day: "numeric", month: "numeric" }),
        ...known ? series.map(
          (entry) => `${entry.name} ${entry.hours[index] === null ? "\u2013" : this.duration(entry.hours[index] ?? 0)}`
        ) : [this.text("card.no_data")]
      ].join("\n");
      return b2`<button
                            class=${index === shown ? "day shown" : "day"}
                            title=${tip}
                            aria-label=${tip}
                            aria-pressed=${index === shown}
                            @click=${() => this.choose(day, today)}
                        >
                            ${series.map(
        (entry) => b2`<div
                                        style="height: ${100 * (entry.hours[index] ?? 0) / top}%; background: ${entry.color}"
                                    ></div>`
      )}
                        </button>`;
    })}
                </div>
                <div class="labels" style="gap: ${gap}px">
                    ${days.map(
      (day, index) => b2`<span
                                >${(days.length - 1 - index) % every === 0 ? this.dateText(day.time, { day: "numeric", month: "numeric" }) : ""}</span
                            >`
    )}
                </div>
            </div>
        `;
  }
  choose(day, today) {
    const next = nextSelection(this.selected?.day.day, day.day, today);
    this.selected = next ? { day, on: today } : void 0;
  }
  renderFoot(series) {
    const averages = series.map((entry) => averageOf(entry.hours));
    return b2`
            <div class="foot">
                ${averages.some((value) => value !== null) ? b2`<div class="averages">
                              <span>${this.text("card.average")}</span>
                              ${series.map(
      (entry, index) => averages[index] === null ? A : b2`<span>${entry.name} <b>${this.duration(averages[index] ?? 0)}</b></span>`
    )}
                          </div>` : A}
                <div class="legend">
                    ${series.map((entry) => b2`<span><i style="background: ${entry.color}"></i>${entry.name}</span>`)}
                    <span><i class="other"></i>${this.text("card.other")}</span>
                </div>
            </div>
        `;
  }
  /** Hours as hours and minutes, large figures with their units small. */
  duration(hours, large = false) {
    const { hours: whole, minutes } = durationParts(hours);
    const h3 = this.text("card.hours");
    const min = this.text("card.minutes");
    if (large) {
      return whole ? b2`${whole}<small>${h3}</small> ${String(minutes).padStart(2, "0")}<small>${min}</small>` : b2`${minutes}<small>${min}</small>`;
    }
    return whole ? `${whole} ${h3} ${String(minutes).padStart(2, "0")} ${min}` : `${minutes} ${min}`;
  }
  dateText(time, options) {
    return new Intl.DateTimeFormat(this.language(), { ...options, timeZone: this.hass?.config?.time_zone }).format(new Date(time));
  }
  clock(time) {
    return this.dateText(time, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  }
  entityName(entity) {
    const name = this.hass?.formatEntityName?.(entity, [{ type: "device" }, { type: "entity" }]);
    return name || String(entity.attributes.friendly_name ?? entity.entity_id);
  }
  stateName(entity, entry) {
    return entry.name || this.hass?.formatEntityState?.(entity, entry.state) || entry.state;
  }
  /**
   * The least height the card needs, from its states alone: the figures wrap to a line more for every three of them
   * at the narrowest. The parts' heights are the stylesheet's.
   */
  minimumHeight() {
    const count = this.config ? statesOf(this.config).length : 1;
    const figures = Math.ceil((count + (count > 1 ? 1 : 0)) / 3) * 50;
    const legend = Math.ceil((count + 1) / 3) * 18;
    return 34 + 24 + figures + 32 + 28 + 112 + 18 + legend + 6 * 12;
  }
  scheduleFill() {
    cancelAnimationFrame(this.fillFrame);
    this.fillFrame = requestAnimationFrame(() => this.fillRows());
  }
  /**
   * In a sections view on automatic rows, the card takes the whole rows its parts need (or half rows with
   * `row_step: half`), the room left over spread between them. Held to rows set in the layout tab, less than a row of
   * room is spread the same way, and more goes to the bars.
   */
  fillRows() {
    const card = this.renderRoot.querySelector("ha-card");
    const content = this.renderRoot.querySelector(".content");
    if (!card || !content || !card.clientWidth || !this.config) {
      return;
    }
    const rows = this.config.grid_options ? this.config.grid_options.rows : this.config.layout_options?.grid_rows;
    const held = this.layout === "grid" && typeof rows === "number";
    const limit = fillLimit(this.config, this.layout, this.minimumHeight());
    const scale = drawnScale(card);
    const style = getComputedStyle(card);
    const parts = [...content.children];
    const gap = parseFloat(getComputedStyle(content).rowGap) || 0;
    const needed = parts.reduce((sum, part2) => sum + part2.getBoundingClientRect().height / scale, 0) + gap * (parts.length - 1) + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
    if (held !== this.held) this.held = held;
    if (held) {
      const height = card.getBoundingClientRect().height / scale;
      const grows = height > needed + 1 && !heldSpare(height, needed);
      if (grows !== this.grows) this.grows = grows;
      if (this.filled) this.filled = 0;
      return;
    }
    if (this.grows) this.grows = false;
    const filled2 = limit ? filledHeight(needed, this.config, limit) : 0;
    if (filled2 !== this.filled) this.filled = filled2;
  }
  text(key) {
    return translate(this.language(), key);
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
  static get styles() {
    return i`
            ha-card {
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                padding: 16px;
                container-type: inline-size;
                transition: none;
            }
            .content {
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 12px;
            }
            ha-card.grows .chart {
                flex: 1 1 auto;
            }
            ha-card.grows .content {
                justify-content: flex-start;
            }
            .warning {
                color: var(--error-color);
            }
            .head {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 8px;
                line-height: 24px;
            }
            .title {
                font-size: 16px;
                font-weight: 500;
                overflow-wrap: anywhere;
            }
            .date,
            .label,
            .ticks,
            .labels,
            .averages,
            .legend,
            .grid span {
                color: var(--secondary-text-color);
            }
            .date {
                font-size: 12px;
                white-space: nowrap;
            }
            .totals {
                display: flex;
                flex-wrap: wrap;
                gap: 4px 20px;
                align-items: flex-end;
            }
            .total .value {
                font-size: 26px;
                font-weight: 600;
                line-height: 32px;
                white-space: nowrap;
            }
            .total small {
                font-size: 14px;
                font-weight: 400;
                margin-left: 2px;
                color: var(--secondary-text-color);
            }
            .total.share {
                margin-left: auto;
                text-align: right;
            }
            .label {
                font-size: 12px;
                line-height: 18px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .share .label {
                justify-content: flex-end;
            }
            .swatch {
                width: 8px;
                height: 8px;
                border-radius: 2px;
                flex: none;
            }
            .track {
                position: relative;
                height: 14px;
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid var(--divider-color);
                box-sizing: border-box;
            }
            .past {
                position: absolute;
                inset: 0 auto 0 0;
                background: repeating-linear-gradient(
                    135deg,
                    color-mix(in srgb, var(--secondary-text-color) 18%, transparent) 0 4px,
                    transparent 4px 8px
                );
            }
            .segment {
                position: absolute;
                top: 0;
                bottom: 0;
            }
            .ticks {
                position: relative;
                height: 14px;
                margin-top: 4px;
                font-size: 10px;
                line-height: 14px;
            }
            .ticks span {
                position: absolute;
                transform: translateX(-50%);
            }
            .ticks span:first-child {
                transform: none;
            }
            .ticks span:last-child {
                transform: translateX(-100%);
            }
            .ranges {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .chip {
                font: inherit;
                font-size: 12px;
                line-height: 18px;
                padding: 3px 10px;
                border-radius: 999px;
                border: 1px solid var(--divider-color);
                background: none;
                color: var(--primary-text-color);
                cursor: pointer;
            }
            .chip.on {
                border-color: var(--primary-color);
                color: var(--primary-color);
                background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            }
            .chip:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 1px;
            }
            .chart {
                display: flex;
                flex-direction: column;
                min-height: 112px;
            }
            /* The hour labels of the grid have a gutter of their own on the right, so they never sit on a bar. */
            .bars,
            .labels {
                margin-right: 30px;
            }
            .bars {
                position: relative;
                flex: 1 1 auto;
                min-height: 96px;
                display: flex;
                align-items: stretch;
                border-bottom: 1px solid var(--divider-color);
            }
            .day {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column-reverse;
                padding: 0;
                border: none;
                border-radius: 2px;
                background: none;
                font: inherit;
                cursor: pointer;
            }
            .day > div:last-child {
                border-radius: 2px 2px 0 0;
            }
            .day:hover {
                background: color-mix(in srgb, var(--secondary-text-color) 8%, transparent);
            }
            .day.shown {
                outline: 1px dashed color-mix(in srgb, var(--primary-color) 60%, transparent);
                outline-offset: 1px;
            }
            .day:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 1px;
            }
            .gone {
                position: absolute;
                inset: 0;
                padding: 0 6px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 10px;
                line-height: 12px;
                color: var(--secondary-text-color);
            }
            .grid {
                position: absolute;
                left: 0;
                right: 0;
                border-top: 1px dashed color-mix(in srgb, var(--secondary-text-color) 25%, transparent);
                pointer-events: none;
            }
            .grid span {
                position: absolute;
                left: 100%;
                width: 30px;
                top: -6px;
                text-align: right;
                white-space: nowrap;
                font-size: 9px;
                line-height: 10px;
            }
            .labels {
                display: flex;
                margin-top: 4px;
                font-size: 9px;
                line-height: 12px;
            }
            .labels span {
                flex: 1;
                min-width: 0;
                text-align: center;
                white-space: nowrap;
                overflow: visible;
                display: flex;
                justify-content: center;
            }
            .foot {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .averages,
            .legend {
                display: flex;
                flex-wrap: wrap;
                gap: 2px 14px;
                font-size: 12px;
                line-height: 18px;
            }
            .averages b {
                color: var(--primary-text-color);
                font-weight: 500;
            }
            .legend {
                font-size: 11px;
            }
            .legend i {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 2px;
                margin-right: 5px;
            }
            .legend i.other {
                background: repeating-linear-gradient(
                    135deg,
                    color-mix(in srgb, var(--secondary-text-color) 40%, transparent) 0 2px,
                    transparent 2px 4px
                );
                border: 1px solid var(--divider-color);
                box-sizing: border-box;
            }
            @container (max-width: 286px) {
                .total .value {
                    font-size: 22px;
                }
                .totals {
                    gap: 4px 14px;
                }
            }
        `;
  }
};
__decorateClass([
  n4({ attribute: false })
], StateTimeCard.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], StateTimeCard.prototype, "layout", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "config", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "range", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "changes", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "counterRows", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "now", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "selected", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "dayChanges", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "filled", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "held", 2);
__decorateClass([
  r5()
], StateTimeCard.prototype, "grows", 2);
StateTimeCard = __decorateClass([
  t3("state-time-card")
], StateTimeCard);
export {
  StateTimeCard,
  averageOf,
  durationParts,
  stubConfig
};
