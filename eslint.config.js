import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/contract.d.ts",
			"**/contract.json",
			"apps/api/.claude",
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...vue.configs["flat/recommended"],
	{
		files: ["**/*.vue"],
		languageOptions: {parserOptions: {parser: tseslint.parser}},
	},
	{languageOptions: {globals: {...globals.node, ...globals.browser}}},
	prettier,
);
