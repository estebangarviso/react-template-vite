export { Page } from './components/Page.tsx';
export * from './hoc/create-router.hoc.tsx';
export * from './router.hook.ts';
export type * from './types/route.d.ts';
export * from 'react-router';

declare module 'react-router' {
	function useLoaderData<T = unknown>(): T;
}
