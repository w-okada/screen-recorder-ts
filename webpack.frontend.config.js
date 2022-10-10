/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
    // mode: "development",
    mode: "production",
    entry: path.resolve(__dirname, "frontend/src/index.tsx"),
    output: {
        path: path.resolve(__dirname, "docs"),
        filename: "index.js",
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")],
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: [/\.ts$/, /\.tsx$/],
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            configFile: "tsconfig.frontend.json",
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ["style-loader", { loader: "css-loader", options: { importLoaders: 1 } }, "postcss-loader"],
            },
            {
                test: /\.html$/,
                loader: "html-loader",
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "frontend/public/index.html"),
            filename: "./index.html",
        }),
        new CopyPlugin({
            patterns: [{ from: "frontend/public/assets", to: "assets" }],
        }),
    ],
    optimization: {
        // workaround for the issue on bundling js from html with html-loader (coi-serviceworker.js)
        // https://stackoverflow.com/questions/67361319/htmlwebpackplugin-wrong-hash-for-script-file-is-injected-into-html-file
        // https://webpack.js.org/configuration/optimization/#optimizationrealcontenthash
        realContentHash: false,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "docs"),
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
        client: {
            overlay: {
                errors: false,
                warnings: false,
            },
        },
        host: "0.0.0.0",
        https: true,
    },
};
