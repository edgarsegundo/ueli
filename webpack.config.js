const path = require("path");
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack')

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


            {
                test: /\.vue$/, // Add this rule for .vue files
                loader: "vue-loader",
            },

        ],
    },
    resolve: {
        // alias: {
        //     vue$: "vue/dist/vue.esm.js",
        // },
        extensions: ['.ts', '.js', '.vue'],
        // extensions: [".ts", ".js"],
    },
    plugins: [
        // ...other plugins...
        new VueLoaderPlugin()
    ],

    mode,
    target: "electron-main",
    node: false,
    devtool,
    externals: {
        sqlite3: "commonjs sqlite3",
    },
};


const rendererConfig = {
    entry: path.join(__dirname, "src", "renderer", "renderer.ts"),
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
                test: /\.vue$/, // Add this rule for .vue files
                loader: "vue-loader",
            },

            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
            },

        ],
    },
    resolve: {
        // alias: {
        //     vue$: "vue/dist/vue.esm.js",
        // },
        extensions: ['.ts', '.js', '.vue'],
    },
    plugins: [
        // ...other plugins...
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: false,
            __VUE_PROD_DEVTOOLS__: true,
        }),        
    ],

    mode,
    target: "electron-renderer",
    node: false,
    devtool,
    externals: {
        sqlite3: "commonjs sqlite3",
    },
};

module.exports = [mainConfig, rendererConfig];
