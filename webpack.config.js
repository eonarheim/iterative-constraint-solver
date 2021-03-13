const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        port: 9000,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
    },
    entry: './main.ts',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          {
            test: /\.tsx?$/,
            loader: 'ts-loader'
          }
        ]
    }
}