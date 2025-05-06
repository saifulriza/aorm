class n {
  _data;
  _subs;
  constructor(t = []) {
    this._data = t, this._subs = /* @__PURE__ */ new Set();
  }
  // Reactive core
  subscribe(t) {
    return this._subs.add(t), t(this._data), () => this._subs.delete(t);
  }
  _emit() {
    for (const t of this._subs) t(this._data);
  }
  get() {
    return this._data;
  }
  set(t) {
    this._data = t, this._emit();
  }
  update(t) {
    this._data = t(this._data), this._emit();
  }
  push(t) {
    this._data.push(t), this._emit();
  }
  remove(t) {
    this._data = this._data.filter((s) => !t(s)), this._emit();
  }
  // Query methods
  where(t, s) {
    const e = typeof s == "function" ? (r) => s(r[t]) : (r) => r[t] === s;
    return new n(this._data.filter(e));
  }
  select(...t) {
    return new n(
      this._data.map((s) => {
        const e = {};
        for (const r of t) e[r] = s[r];
        return e;
      })
    );
  }
  orderBy(t, s = "asc") {
    return new n(
      [...this._data].sort((e, r) => e[t] < r[t] ? s === "asc" ? -1 : 1 : e[t] > r[t] ? s === "asc" ? 1 : -1 : 0)
    );
  }
  distinct(t) {
    const s = /* @__PURE__ */ new Set(), e = this._data.filter((r) => {
      const a = r[t];
      return s.has(a) ? !1 : (s.add(a), !0);
    });
    return new n(e);
  }
  hasMany(t, s, e, r = "items") {
    const a = /* @__PURE__ */ new Map();
    for (const i of t) {
      const h = i[e];
      a.has(h) || a.set(h, []), a.get(h).push(i);
    }
    const u = this._data.map((i) => ({
      ...i,
      [r]: a.get(i[s]) || []
    }));
    return new n(u);
  }
  eager(t) {
    let s = this;
    for (const e of t)
      s = s.hasMany(...e);
    return s;
  }
}
typeof window < "u" && (window.AORM = n);
export {
  n as AORM,
  n as default
};
//# sourceMappingURL=array-orm.js.map
