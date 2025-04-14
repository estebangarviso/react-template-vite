import {
	transformerDirectives,
	transformerVariantGroup,
	type UserConfig,
} from 'unocss';
import icons from 'unocss/preset-icons';
import typography from 'unocss/preset-typography';
import wind from 'unocss/preset-wind';

const FONT_FAMILY = process.env.FONT_FAMILY;

export default {
	presets: [typography(), wind({ preflight: true }), icons({ prefix: '' })],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	theme: {
		fontFamily: {
			sans: [FONT_FAMILY, 'sans-serif'],
			serif: [FONT_FAMILY, 'serif'],
		},
	},
} satisfies UserConfig;
