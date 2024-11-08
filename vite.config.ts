import { defineConfig } from "vite";

export default defineConfig({
	root: "./",
	base: "./",
	build: {
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			input: "./index.html",
			output: {
				entryFileNames: "app.js",
				manualChunks: undefined,
			},
		},
	},
});
