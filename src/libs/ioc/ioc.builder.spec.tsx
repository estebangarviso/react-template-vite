import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { createContainer } from './ioc.builder.tsx';

type IocContainer = ReturnType<typeof createContainer>;

describe('createContainer', () => {
	// note: The container is created once for the entire test suite.
	// While using `beforeEach` for isolation is often preferred, this structure
	// mirrors the original test setup and avoids potential scoping issues
	// with the test runner's environment.
	let ioc: IocContainer;

	// define common tokens and dependencies
	const TEST_TOKEN = 'test_token';
	const fn = () => 'test';
	class TestClass {
		test() {
			return 'test';
		}
	}

	// before each test, we reset the container to ensure a clean state.
	beforeEach(() => {
		cleanup();
		// reset the container before each test
		ioc = createContainer();
	});

	test('useInjection should resolve a dependency by token from the global container', () => {
		const { container, useInjection } = ioc;
		container.bind(TEST_TOKEN, fn);
		// test the hook's fallback to the default global store.
		const { result } = renderHook(() =>
			useInjection<typeof fn>(TEST_TOKEN),
		);

		expect(result.current).toBe(fn);
		expect(result.current()).toBe('test');
	});

	test('useInjection should resolve a dependency by class from the global container', () => {
		const { container, useInjection } = ioc;
		container.bind(TestClass, new TestClass());
		const { result } = renderHook(() => useInjection(TestClass));
		expect(result.current.test()).toBe('test');
	});

	test('InversionOfControlProvider should provide an isolated container that overrides the global one', () => {
		const { InversionOfControlProvider, container, useInjection } = ioc;
		container.bind(TestClass, new TestClass());
		const TestComponent = ({ id }: { id: string }) => {
			const provider = useInjection(TestClass);
			return <h1 data-testid={id}>{provider?.test()}</h1>;
		};

		render(
			<>
				{/* This component uses the global container */}
				<TestComponent id='outside-before' />
				{/* This provider creates an empty, isolated scope */}
				<InversionOfControlProvider values={new Map()}>
					<TestComponent id='inside-isolated' />
				</InversionOfControlProvider>
				{/* This component also uses the global container */}
				<TestComponent id='outside-after' />
			</>,
		);

		// assert that the components outside the provider resolve the global dependency
		expect(screen.getByTestId('outside-before')).toHaveTextContent('test');
		expect(screen.getByTestId('outside-after')).toHaveTextContent('test');

		// assert that the component inside the isolated provider does not find the dependency
		expect(screen.getByTestId('inside-isolated')).toHaveTextContent('');
	});

	test('InversionOfControlProvider should allow providing initial values to an isolated container', () => {
		const { InversionOfControlProvider, useInjection } = ioc;
		class OverriddenTestClass {
			test() {
				return 'overridden';
			}
		}
		// define the dependencies for the isolated scope
		const initialValues = new Map();
		initialValues.set(TestClass, new OverriddenTestClass());

		const TestComponent = () => {
			const provider = useInjection(TestClass);
			return <h1>{provider.test()}</h1>;
		};

		// render the component inside the provider with the specific initial values
		render(
			<InversionOfControlProvider values={initialValues}>
				<TestComponent />
			</InversionOfControlProvider>,
		);

		// assert that the component resolves the dependency from the isolated provider
		expect(screen.getByRole('heading')).toHaveTextContent('overridden');
	});
});
