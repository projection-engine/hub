import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import image from "@rollup/plugin-image";
import css from "rollup-plugin-css-only";
import json from "@rollup/plugin-json";
import {uglify} from "rollup-plugin-uglify";

const PRODUCTION = !process.env.ROLLUP_WATCH;

export default [
    {
        input: "public/backend/main.js",
        output: {
            strict: false,
            sourcemap: false,
            file: "public/build/electron.js",
            format: 'cjs'
        },
        plugins: [
            resolve({
                dedupe: ["electron", "decompress"]
            }),
            commonjs({ignore: ["electron", "decompress"]}),
            json(),
            uglify()
        ]
    },
    {

        input: `src/root.js`,
        output: {
            strict: false,
            sourcemap: false,
            format: 'iife',
            name: 'app',
            file: `public/build/root.js`,
        },
        plugins: [
            svelte({
                compilerOptions: {
                    dev: !PRODUCTION,
                    css: css => css.write(`public/build/root.css`)
                }
            }),
            css({output: `root.css`}),
            resolve({browser: true, dedupe: ['svelte']}),
            commonjs(),
            !PRODUCTION && serve(),
            !PRODUCTION && livereload('public'),
            PRODUCTION && uglify(),
            image(),
            json()
        ],
        watch: {clearScreen: false}
    }
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