import {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { createStore, useStore } from 'zustand';

// define the shape of our IoC store's state and actions
interface IocState {
	dependencies: Map<unknown, unknown>;
	bind: (key: unknown, value: unknown) => void;
	unbind: (key: unknown) => void;
}

// define the type for the store created by Zustand
// This is a combination of the state and the API to interact with it
type IocStore = ReturnType<typeof createIocStore>;

/**
 * A factory function to create a new IoC store instance.
 * This is the core of our Zustand implementation.
 * @param initialDependencies - An optional map to initialize the store with.
 */
const createIocStore = (initialDependencies = new Map<unknown, unknown>()) => {
	return createStore<IocState>((set) => ({
		dependencies: initialDependencies,
		bind: (key, value) =>
			set((state) => ({
				dependencies: new Map(state.dependencies).set(key, value),
			})),
		unbind: (key) =>
			set((state) => {
				const newDependencies = new Map(state.dependencies);
				newDependencies.delete(key);
				return { dependencies: newDependencies };
			}),
	}));
};

/**
 * Creates a new Inversion of Control container using Zustand.
 *
 * @example
 * ```ts
 * // app.ioc.ts
 * import { createContainer } from './ioc.builder.tsx';
 *
 * // Create the container and hook
 * export const { container, useInjection, InversionOfControlProvider } = createContainer();
 *
 * // Define tokens (can be classes or strings)
 * export class ApiService { ... }
 * export const CONFIG_TOKEN = 'config_token';
 *
 * // Bind services to the container (imperative API)
 * container.bind(ApiService, new ApiService());
 * container.bind(CONFIG_TOKEN, { theme: 'dark' });
 *
 * // App.tsx (Wrap your app with the provider)
 * <InversionOfControlProvider>
 * <YourApp />
 * </InversionOfControlProvider>
 *
 * // AnyComponent.tsx
 * import { useInjection, ApiService, CONFIG_TOKEN } from './app.ioc.ts';
 *
 * export const AnyComponent: React.FC = (): React.ReactElement => {
 * const apiService = useInjection(ApiService);
 * const config = useInjection<{ theme: string }>(CONFIG_TOKEN);
 *
 * // ... use the injected services
 * };
 * ```
 */
export const createContainer = () => {
	// 1. Create a default store instance for global/imperative use.
	const defaultStore = createIocStore();

	// 2. Create a React Context to hold the store for provider-based isolation.
	const IocContext = createContext<IocStore | null>(null);

	return {
		/**
		 * A React Provider component to create an isolated IoC scope.
		 * Any dependencies provided via the `values` prop will exist only for child components.
		 */
		InversionOfControlProvider: ({
			children,
			values,
		}: InversionOfControlProviderProps) => {
			// create a new store instance only once. If `values` are provided,
			// it creates an isolated store; otherwise, it defaults to the global one.
			const [store] = useState(() =>
				values ? createIocStore(values) : defaultStore,
			);

			return (
				<IocContext.Provider value={store}>
					{children}
				</IocContext.Provider>
			);
		},

		/**
		 * An imperative API for interacting with the container outside of React components.
		 * Note: This API interacts with the *default global* store, not isolated provider scopes.
		 */
		container: {
			bind: (key: any, value: any) => {
				// use the store's `set` method via the `bind` action
				defaultStore.getState().bind(key, value);
			},
			resolve: <
				T,
				K = unknown,
				R = K extends new (...args: any) => infer C ? C : T,
			>(
				key: K,
			): R => {
				// get the value directly from the store's state
				return defaultStore.getState().dependencies.get(key) as R;
			},
			unbind: (key: any) => {
				defaultStore.getState().unbind(key);
			},
		},

		/**
		 * A React hook to resolve a dependency from the container within a component.
		 * It will use an isolated provider's store if it exists, otherwise it falls back to the global store.
		 */
		useInjection: <
			T,
			K = unknown,
			R = K extends new (...args: any) => infer C ? C : T,
		>(
			key: K,
		): R => {
			// get the store from context, or fall back to the default global store.
			const store = useContext(IocContext) ?? defaultStore;

			// use a selector to subscribe to only the relevant part of the store.
			// The component will only re-render if this specific dependency changes.
			return useStore(store, (state) => state.dependencies.get(key)) as R;
		},
	};
};

export interface InversionOfControlProviderProps extends PropsWithChildren {
	/**
	 * An initial map of dependencies to create an isolated container scope.
	 */
	values?: Map<unknown, unknown>;
}
