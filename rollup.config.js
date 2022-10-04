import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import image from "@rollup/plugin-image";
import css from "rollup-plugin-css-only";
import json from "@rollup/plugin-json";
import {uglify} from "rollup-plugin-uglify";

const PRODUCTION = !process.env.ROLLUP_WATCH;
const common = (inputFile, outputFile) => ({

	input: `src/${inputFile}.js`,
	output: {
		strict: false,
		sourcemap: false,
		format: 'iife',
		name: 'app',
		file: `public/build/${outputFile}.js`,
	},
	plugins: [
		svelte({
			compilerOptions: {
				dev: !PRODUCTION,
				css: css => {
					css.write(`public/build/${outputFile}.css`);
				}
			}
		}),
		css({output: `${outputFile}.css`}),
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		!PRODUCTION && serve(),
		!PRODUCTION && livereload('public'),
		PRODUCTION && uglify(),
		image(),
		json()
	],
	watch: {
		clearScreen: false
	}
})

export default [
	common("home/root", "home")
]

function serve() {
	let started = false;
	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'svelte-start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}