declare const _exports: ReadData;
export = _exports;

declare type ObjectQuery = {
    getTables: (callback: (d:Callback) => void) => void;
    find:(filter:Filter, callback:(d:Callback) => void) => void;
    insertOne: (obj:{table?:string, data:any}, callback:(d:Callback) => void) => void;
    update: (filter:Filter, obj:any, callback:(d:Callback) => void) => void;
    delete: (filter:Filter, callback:(d:Callback) => void) => void;

};

declare type CallbackConnect = {
    result: boolean;
    msg?: string | null,
    client: ObjectQuery
};
declare type Callback = {
    result: boolean,
    data:any|null|undefined,
    msg?:string|null|undefined
}
declare type FilterRule = {
    filterRule?: FilterRule[],
    field?: string,
    value?:any,
    op?: string
}
declare type Filter ={
    table?:string,
    fields?: string[],
    fields2?: string[],
    page?:number,
    rows?:number,
    filterRules: FilterRule,
    type?: string | "and"|"or"

}

declare class ReadData {
    connectDB(urlConnect: string, callback: (result: CallbackConnect ) => void ) : void;
    #private;
}
