import Vue from 'vue'
import Vuex, { Commit } from 'vuex'
import { isOwnKey, NonNeverState, GetState, GetMutationKeyParamMap, GetActionKeyParamMap } from "vuex-with-type";

Vue.use(Vuex)

const state = {
  token: "",
  openId: "",
  name: "",
  appId: "1"
}

/** modules测试 */
const modOneState = {
  name: "z",
  age: 24,
  job: 'frontier-engineer'
}

const modOneMutation = {
  SET_STATE(state: typeof modOneState, obj: Partial<typeof modOneState>) {
    for (const key in obj) {
      if (isOwnKey(key, obj)) {
        state[key] = obj[key];
      }
    }
  },
  SET_NAME(state: { name: string }, v: string) {
    state.name = v;
  }
}

const modTwoState = {
  name: "q",
  age: 25,
  job: 'back-end-engineer',
  996: true
}

const modTwoMutation = {
  SET_STATE(state: typeof modTwoState, obj: Partial<typeof modTwoState>) {
    for (const key in obj) {
      if (isOwnKey(key, obj)) {
        state[key] = obj[key];
      }
    }
  },
  SET_AGE(state: { age: number }, v: number) {
    state.age = v;
  },
  SET_996(state: { 996: boolean }, v: boolean) {
    state[996] = v;
  }
}

// 将vuex store独立出来
const storeOptions = {
  state,
  mutations: {
    SET_STATE(s: NonNeverState<typeof state>, obj: Partial<NonNeverState<typeof state>>) {
      for (const key in obj) {
        if (isOwnKey(key, obj)) {
          s[key] = obj[key];
        }
      }
    },
    SET_NAME(s: NonNeverState<typeof state>, v: string) {
      s.name = v;
    }
  },
  actions: {
    SET_ASYNC_STATE({ commit }: { commit: Commit }, obj: Partial<NonNeverState<typeof state>>) {
      return new Promise(resolve=> {
        setTimeout(()=> {
          commit("SET_STATE", obj);
          resolve(obj);
        });
      });
    }
  },
  modules: {
    modOne: {
      namespaced: true,
      state: modOneState,
      mutations: modOneMutation,
      actions: {
        SET_ASYNC_NAME({ commit }: { commit: Commit }, name: string) {
          return new Promise(resolve=> {
            setTimeout(()=> {
              commit("modOne/SET_NAME", name);
              resolve(name);
            });
          });
        }
      },
      modules: {
        modOneSon: {
          namespaced: true,
          state: {
            jk: true
          },
          mutations: {
            SET_JK(state: { jk: boolean }, v: boolean) {
              state.jk = v;
            }
          },
          actions: {
            SET_ASYNC_JK({ commit }: { commit: Commit }, v: boolean) {
              return new Promise(resolve=> {
                setTimeout(()=> {
                  commit("modOne/modOneSon/SET_JK", v);
                  resolve(v);
                });
              });
            }
          },
          modules: {
            modOneSonSon: {
              namespaced: true,
              state: {
                kpi: true
              },
              mutations: {
                SET_KPI(state: { kpi: boolean }, v: boolean) {
                  state.kpi = v;
                }
              },
              actions: {
                SET_ASYNC_KPI({ commit }: { commit: Commit }, v: boolean) {
                  return new Promise(resolve=> {
                    setTimeout(()=> {
                      commit("modOne/modOneSon/modOneSonSon/SET_KPI", v);
                      resolve(v);
                    });
                  });
                }
              },
            }
          }
        }
      }
    },
    modTwo: {
      namespaced: true,
      state: modTwoState,
      mutations: modTwoMutation,
      actions: {
        SET_ASYNC_AGE({ commit }: { commit: Commit }, v: number) {
          return new Promise(resolve=> {
            setTimeout(()=> {
              commit("modTwo/SET_AGE", v);
              resolve(v);
            });
          });
        },
        SET_ASYNC_996({ commit }: { commit: Commit }, v: boolean) {
          return new Promise(resolve=> {
            setTimeout(()=> {
              commit("modTwo/SET_996", v);
              resolve(v);
            });
          });
        }
      }
    }
  }
};

/**
 * Below, these types must be exported 
 */

// state的类型
export type TState = NonNeverState<GetState<typeof storeOptions>>

/**
 * @description mutation类型，能够推断出嵌套的modules：
 * {
 *    SET_XXX: typeof second param;
 *    module/SET_XX: typeof second param;
 *    module/moduleSon/SET_X: typeof second param
 * }
 */
export type TMutation = GetMutationKeyParamMap<typeof storeOptions>;

export type TAction = GetActionKeyParamMap<typeof storeOptions>;

const store = new Vuex.Store<TState>(storeOptions);

export default store;
// store.commit<"modOne/SET_STATE">("modOne/SET_STATE", )