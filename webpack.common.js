const path = require("path");
const {VueLoaderPlugin} = require("vue-loader");
const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        background: path.join(__dirname, "src", "entries", "background-script.ts"),
        options: path.join(__dirname, "src", "entries", "options.ts"),
    },
    output: {
        path: path.resolve(__dirname, "dist", "js"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["vue-style-loader", "css-loader"],
            },
            {
                test: /\.s[ca]ss$/,
                use: [
                    "vue-style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                            sassOptions: {
                            //     fiber: require("fibers"),
                                indentedSyntax: true, // optional
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(woff2?|ttf|eot|svg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "../fonts/",
                            useRelativePath: true
                        },
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: [
                    "cache-loader",
                    {
                        loader: "ts-loader",
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                        },
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ["cache-loader", "babel-loader"],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new VuetifyLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: "./html/background.html",
            filename: "../html/background.html",
            minify: {
                collapseWhitespace: false,
                removeComments: true,
                removeAttributeQuotes: false,
            },
            chunks: ["background"],
        }),
        new HtmlWebpackPlugin({
            template: "./html/options.html",
            filename: "../html/options.html",
            minify: {
                collapseWhitespace: false,
                removeComments: true,
                removeAttributeQuotes: false,
            },
            chunks: ["options"],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "icon",
                    to: "../icon",
                },
                {
                    from: "manifest.json",
                    to: "../",
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        },
        extensions: ["*", ".js", ".ts", ".vue"],
    },
};
