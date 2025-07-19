import {
	FeatureHandler,
	linkStorageToFeatureHandler,
	// the `withFeatures` type is imported for JSDoc cross-referencing.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type withFeatures,
} from '#libs/feature';

/**
 * Initializes and configures the central feature flag handler for the application.
 *
 * This instance defines the default state for all feature flags. These defaults
 * serve as the baseline for the application, but can be overridden by hoc `linkStorageToFeatureHandler`.
 *
 * @see {withFeatures} The HOC that consumes this handler to conditionally render UI.
 * @see {linkStorageToFeatureHandler} The function that links browser storage to the feature handler.
 */
export const featureHandler = new FeatureHandler({
	FEATURE_FETCHBOX_V2ALPHA: true,
});

// connects the handler to browser storage, enabling runtime overrides.
linkStorageToFeatureHandler(featureHandler);
