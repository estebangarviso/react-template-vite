import { Link } from '#libs/router';
import { useEffect } from 'react';
import Logo from '../../assets/logo.svg';
import viteLogoUrl from '../../assets/vite.png';
import { useSampleStore } from '../../stores/sample.store.ts';
import styles from './Main.page.module.scss';

export const MainPage: React.FC = (): React.ReactElement => {
	const { message, setStatus } = useSampleStore();

	// effects
	useEffect(() => {
		setStatus(200);
	}, [setStatus]);

	// jsx
	return (
		<section className={styles.page}>
			<title>Main Page</title>

			<Link to='/detail'>Go To Detail</Link>
			<Link to='/detail/123'>Go To Detail 123</Link>

			<h1 className='text-center text-primary font-bold underline'>
				hello world
				<i className='i-mdi-alarm text-size-4xl text-orange-400' />
			</h1>

			<h2 className='text-center'>{import.meta.env.APP_ENV}</h2>
			<h3 className='text-center text-green-700 font-bold'>{message}</h3>
			<div className={styles.logos}>
				<img
					alt='logo'
					className={styles.react}
					src={Logo}
					width='10%'
				/>
				<img alt='vite logo' src={viteLogoUrl} width='10%' />
			</div>
		</section>
	);
};

export default MainPage;
