/**
 * AORM - Active Object Relational Mapping
 * A lightweight reactive data management library
 */
declare class AORM<T = any> {
    private _data;
    private _subs;
    constructor(data?: T[]);
    subscribe(callback: (data: T[]) => void): () => boolean;
    private _emit;
    get(): T[];
    set(newData: T[]): void;
    update(updaterFn: (data: T[]) => T[]): void;
    push(item: T): void;
    remove(predicateFn: (item: T) => boolean): void;
    where(field: keyof T, condition: any): AORM<T>;
    select<K extends keyof T>(...fields: K[]): AORM<Pick<T, K>>;
    orderBy(field: keyof T, direction?: "asc" | "desc"): AORM<T>;
    distinct(field: keyof T): AORM<T>;
    hasMany<R>(relationData: R[], localKey: keyof T, foreignKey: keyof R, alias?: string): AORM<T & {
        [x: string]: any;
    }>;
    eager<R>(relations: [R[], keyof T, keyof R, string?][]): AORM<T>;
}
export default AORM;
export { AORM };
