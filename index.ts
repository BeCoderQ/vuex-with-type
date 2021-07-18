/**
 * vuex-with-type
 */
 export function isOwnKey(
  key: string | number | symbol,
  object: object
): key is keyof typeof object {
  return key in object;
};

/**
 * 将联合类型转为交叉类型 convert union to intersection
 * multiple candidates for the same type variable in contra-variant positions 
 * causes an intersection type to be inferred
 */
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

// 推断出函数的参数类型 infer param type of function
type ParamsType<T extends (...args: any[]) => any> = T extends (...args: infer R) => any ? R : any;

/**
 * never是一个特殊类型，比如你让 any extends never ? 1 : 2，这个结果会是1 | 2，另外，never extends never[]是true
 * 解决这些特殊情况可以把它转为元祖类型后进行对比 
 * to prevent T being distributive, wrap it with []
 * ref. https://github.com/microsoft/TypeScript/issues/23182
 */
export type DealNeverType<T> = [T] extends [never] ? any : ([T] extends [never[]] ? any[] : T);

/**
 * state =  {
 *    arr: []
 * };
 * 这种会被推断为never[]
 * this one will be infered to never[]
 */
export type NonNeverState<R extends object> = {
  [K in keyof R]: R[K] extends (any[] | never) ? 
  DealNeverType<R[K]> : (R[K] extends object ? 
  NonNeverState<R[K]> : DealNeverType<R[K]>);
}

// 定义键类型
type KeyType = string | number;

// 获取值 get value of an object
type GetValue<T> = T[keyof T];

/**
 * 仅支持TypeScript4.1+ only support for 4.1+ 将有命名空间的模块拼装
 * Below, a keyof T & string intersection is required because keyof T could contain symbol types
 * that cannot be transformed using template string types.
 */
 type AddPrefix<Prefix extends KeyType, Keys extends KeyType> = `${Prefix}/${Keys}`;

 // 修复app内活动无法返回的bug | 评论增加点赞数量，调整布局 | 项目模板声明文件修改
 
 // 判断是否添加/
 type AddSlashe<T> = T extends "" ? T : `${T & string}/`;

 // 支持联合类型的字符串模板拼接 support string splicing of union type 
type AddPrefixKeys<P, S extends string> = GetValue<{
  [K in S]: P extends "" ? K : AddPrefix<P & string, K & string>;
}>

// 模块Store的类型，用于继承判断 type of modules's store
type ModuleStoreOptions = { 
  [k: string]: { 
    mutations: { [x: string]: (...args: any[])=> any }; 
    state: any; 
    actions?: { [x: string]: (...args: any[])=> any }; 
    modules?: ModuleStoreOptions 
  } 
};

// 获取mutation或action函数第二个参数的类型 get second param type of function which named K
type GetSecondParamType<M, MK extends string, K extends string, KEY = "mutations", E = never> = M extends { 
  [X in MK]: { 
    [X1 in KEY & string]: { 
      [X2 in K]: (s: any, v: infer N)=> any 
    } 
  } 
} ? N | E : never;

// 获取modules中的mutation key与第二个参数类型
type GetModuleMutationKeyParamMap<M extends ModuleStoreOptions, P = ""> = UnionToIntersection<GetValue<{
  [R in keyof M]: 
    M[R] extends { modules: ModuleStoreOptions } ? 
    GetValue<{ 
      [K in keyof M[R]["mutations"]]: {
        [K1 in AddPrefixKeys<`${AddSlashe<P>}${R & string}`, K & string>]: GetSecondParamType<M, R & string, K & string>
      } 
    }> & GetMutationKeyParamMap<M[R]["modules"], P extends "" ? R : AddPrefix<P & string, R & string>> : 
    GetValue<{
      [K in keyof M[R]["mutations"]]: {
        [K1 in AddPrefix<`${AddSlashe<P>}${R & string}`, K & string>]: GetSecondParamType<M, R & string, K & string>
      }
    }>
}>>;

// 支持直接传入整个vuex store树 解析出mutation的key与函数第二个参数类型
export type GetMutationKeyParamMap<M extends (ModuleStoreOptions | GetValue<ModuleStoreOptions>), P = ""> = 
    M extends ModuleStoreOptions ? 
    GetModuleMutationKeyParamMap<M, P> : 
    M extends GetValue<ModuleStoreOptions> ? 
    (
      { [K in keyof M["mutations"]]: ParamsType<M["mutations"][K & string]>[1] } &
      (
        M extends { modules: ModuleStoreOptions } ? 
        GetModuleMutationKeyParamMap<M["modules"]> : 
        {}
      )
    ) : never;

// 获取模块下的action的key与函数第二个参数map
type GetModuleActionKeyParamMap<M extends ModuleStoreOptions, P = ""> = UnionToIntersection<GetValue<{
  [R in keyof M]: 
    M[R] extends { modules: ModuleStoreOptions } ? 
    GetValue<{ 
      [K in keyof M[R]["actions"]]: {
        [K1 in AddPrefixKeys<`${AddSlashe<P>}${R & string}`, K & string>]: GetSecondParamType<M, R & string, K & string, "actions">
      } 
    }> & GetActionKeyParamMap<M[R]["modules"], P extends "" ? R : AddPrefix<P & string, R & string>> : 
    GetValue<{
      [K in keyof M[R]["actions"]]: {
        [K1 in AddPrefix<`${AddSlashe<P>}${R & string}`, K & string>]: GetSecondParamType<M, R & string, K & string, "actions">
      }
    }>
}>>;

// 支持直接传入整个vuex store树 解析出action的key与函数第二个参数类型
export type GetActionKeyParamMap<M extends (ModuleStoreOptions | GetValue<ModuleStoreOptions>), P = ""> = 
    M extends ModuleStoreOptions ? 
    GetModuleActionKeyParamMap<M, P> : 
    M extends Required<GetValue<ModuleStoreOptions>> ? 
    (
      { [K in keyof M["actions"]]: ParamsType<M["actions"][K & string]>[1] } &
      (
        M extends { modules: ModuleStoreOptions } ? 
        GetModuleActionKeyParamMap<M["modules"]> : 
        {}
      )
    ) : never;

// 获取嵌套modules内的mutation的key，并组装成xx/xxx/xxxx
type GetSubMutationKeys<M extends ModuleStoreOptions, K extends keyof M, Prefix = ""> = M[K] extends { modules: ModuleStoreOptions } ? 
  AddPrefix<`${AddSlashe<Prefix>}${K & string}` , keyof M[K]["mutations"] & string> | 
  GetSubMutationKeys<M[K]["modules"], keyof M[K]["modules"], `${AddSlashe<Prefix>}${K & string}`> : 
  AddPrefix<`${AddSlashe<Prefix>}${K & string}` , keyof M[K]["mutations"] & string>;

// 以模块树第一层开始的树结构
export type GetMutationKeys<N extends ModuleStoreOptions, Prefix = ""> = {
  [K in keyof N]: N[K] extends { modules: ModuleStoreOptions } ? 
  (
    AddPrefix<`${AddSlashe<Prefix>}${K & string}` , keyof N[K]["mutations"] & string> | 
    GetSubMutationKeys<N[K]["modules"], keyof N[K]["modules"], `${AddSlashe<Prefix>}${K & string}`> 
  ) : 
  AddPrefix<`${AddSlashe<Prefix>}${K & string}`, keyof N[K]["mutations"] & string>;
}[keyof N];

// 模块state的类型 会递归拿到嵌套模块的state类型
type GetSubState<M extends ModuleStoreOptions> = {
  [K in keyof M]?: M[K] extends { modules: ModuleStoreOptions } ? 
    M[K]["state"] & GetSubState<M[K]["modules"]> : 
    M[K]["state"]
} 

// 获取根据传入的vuex store 获取state
export type GetState<M extends (ModuleStoreOptions | GetValue<ModuleStoreOptions>)> = M extends ModuleStoreOptions ? 
  GetSubState<M> : (
    { [K in keyof M["state"]]: M["state"][K] } & (
    M extends { modules: ModuleStoreOptions } ? 
    GetState<M["modules"]> : 
    {}
  )
);