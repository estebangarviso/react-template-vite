import type { FetchBoxProps } from './FetchBox.tsx';
import styles from './FetchBox.module.scss';

export const FetchBox_v1: React.FC<FetchBoxProps> = ({ logoSrc }) => {
	return (
		<div className={styles.box}>
			<h3 className='text-center'>FetchBox v1</h3>
			<img alt='logo' className={styles.logo} src={logoSrc} />
		</div>
	);
};
