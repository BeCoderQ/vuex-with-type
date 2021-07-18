
import { CommitOptions, DispatchOptions, Payload, Store } from "vuex";
import { TAction, TMutation, TState } from "@/store";

type TupleTypeToUnions<T, K = any> = T extends Array<K> ? T[number] : T

// 移除指定key，可接受元祖 remove U in T accept tuple
type ExcludeKey<T, U> = T extends (U extends Array<any> ? TupleTypeToUnions<U> : U) ? never : T;

// 移除state与commit、dispatch 方便后续重写 
type CutStore = {
  [K in ExcludeKey<keyof Store<any>, ["state", "commit", "dispatch"]>]: Store<any>[K];
};

declare module "vue/types/vue" {
  interface Vue {
    $store: CutStore & {
      commit: {
        <R extends keyof TMutation>(
          type: R,
          payload?: TMutation[R],
          options?: CommitOptions
        ): void;
        <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;
      };
    } & {
      dispatch: {
        <R extends keyof TAction>(
          type: R,
          payload?: TAction[R],
          options?: DispatchOptions
        ): void;
        <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<any>;
      }
    } & {
      state: TState;
    };
  }
}

declare module "vuex/types/index" {
  interface Commit {
    <K extends keyof TMutation>(
      type: K,
      payload?: TMutation[K],
      options?: CommitOptions
    ): void;
  }

  interface Dispatch {
    <K extends keyof TAction>(
      type: K,
      payload?: TAction[K],
      options?: DispatchOptions
    ): Promise<any>;
  }
}
  