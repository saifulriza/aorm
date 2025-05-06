/**
 * AORM - Active Object Relational Mapping
 * A lightweight reactive data management library
 */

class AORM<T = any> {
  private _data: T[];
  private _subs: Set<Function>;

  constructor(data: T[] = [] as T[]) {
    this._data = data;
    this._subs = new Set();
  }

  // Reactive core
  subscribe(callback: (data: T[]) => void) {
    this._subs.add(callback);
    callback(this._data); // emit immediately
    return () => this._subs.delete(callback);
  }

  private _emit() {
    for (const cb of this._subs) cb(this._data);
  }

  get() {
    return this._data;
  }

  set(newData: T[]) {
    this._data = newData;
    this._emit();
  }

  update(updaterFn: (data: T[]) => T[]) {
    this._data = updaterFn(this._data);
    this._emit();
  }

  push(item: T) {
    this._data.push(item);
    this._emit();
  }

  remove(predicateFn: (item: T) => boolean) {
    this._data = this._data.filter((item) => !predicateFn(item));
    this._emit();
  }

  // Query methods
  where(field: keyof T, condition: any) {
    const predicate =
      typeof condition === "function"
        ? (obj: T) => condition(obj[field])
        : (obj: T) => obj[field] === condition;
    return new AORM<T>(this._data.filter(predicate));
  }

  select<K extends keyof T>(...fields: K[]) {
    return new AORM(
      this._data.map((obj) => {
        const selected = {} as Pick<T, K>;
        for (const f of fields) selected[f] = obj[f];
        return selected;
      })
    );
  }

  orderBy(field: keyof T, direction: "asc" | "desc" = "asc") {
    return new AORM<T>(
      [...this._data].sort((a, b) => {
        if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
        if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  }

  distinct(field: keyof T) {
    const seen = new Set();
    const filtered = this._data.filter((item) => {
      const val = item[field];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
    return new AORM<T>(filtered);
  }

  hasMany<R>(
    relationData: R[],
    localKey: keyof T,
    foreignKey: keyof R,
    alias: string = "items"
  ) {
    const relationMap = new Map();
    for (const rel of relationData) {
      const key = rel[foreignKey];
      if (!relationMap.has(key)) relationMap.set(key, []);
      relationMap.get(key).push(rel);
    }

    const merged = this._data.map((item) => ({
      ...item,
      [alias]: relationMap.get(item[localKey]) || [],
    }));

    return new AORM(merged);
  }

  eager<R>(relations: [R[], keyof T, keyof R, string?][]) {
    let result: AORM<T> = this;
    for (const rel of relations) {
      result = result.hasMany<R>(...rel);
    }
    return result;
  }
}

// ESM export
export default AORM;

// For browser/UMD
if (typeof window !== "undefined") {
  (window as any).AORM = AORM;
}

// For Node.js (when imported via require) - this will be correctly handled by Vite
export { AORM };
