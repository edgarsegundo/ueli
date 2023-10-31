const path = require("path");
const webpack = require('webpack');
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const devtool = process.env.NODE_ENV === "production" ? undefined : "source-map";

console.log(`Using "${mode}" mode for webpack bundles`);

const mainConfig = {
    entry: path.join(__dirname, "src", "main", "main.ts"),
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "bundle"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    mode,
    target: "electron-main",
    node: false,
    devtool,
    externals: {
        sqlite3: "commonjs sqlite3",
    },
};

const rendererConfig = {
    entry: [
        'webpack-dev-server/client?http://localhost:8080/',
        'webpack/hot/only-dev-server',
        path.join(__dirname, "src", "renderer", "renderer.ts")
    ],

    output: {
        filename: "renderer.js",
        path: path.join(__dirname, "bundle"),
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
            },
        ],
    },


    resolve: {
        alias: {
            vue$: "vue/dist/vue.esm.js",
        },
        extensions: [".ts", ".js"],
    },
    mode: "development", // Always set to development for the renderer process
    target: "electron-renderer",
    node: false,
    devtool,
    externals: {
        sqlite3: "commonjs sqlite3",
    },
    plugins: [new webpack.HotModuleReplacementPlugin(), new VueLoaderPlugin()],
    devServer: {
        hot: true,
        port: 8080, // Adjust as needed
    },    

};

module.exports = [mainConfig, rendererConfig];
