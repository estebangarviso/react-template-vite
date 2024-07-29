import { Page, isRouteErrorResponse, useRouteError } from '#libs/router';
import styles from './error.page.module.scss';

/**
 * Error page.
 */
export const ErrorPage: React.FC = (): React.ReactElement => {
	const error = useRouteError();

	// jsx
	return (
		<Page className={styles.page} title='Error'>
			{isRouteErrorResponse(error) ? (
				<h1>
					{error.status} - {error.statusText}
				</h1>
			) : (
				<h1>Unknown Error</h1>
			)}
		</Page>
	);
};

export default ErrorPage;
