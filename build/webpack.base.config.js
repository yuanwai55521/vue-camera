const fs = require('fs');
const gracefulFs = require('graceful-fs');
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

gracefulFs.gracefulify(fs);
const resolve = dir => path.join(__dirname, '..', dir);
const production = process.env.NODE_ENV === 'production';
const extractCSS = new ExtractTextPlugin({
  filename: 'css/style-[contenthash:8].css',
  disable: !production
});
const vueExtractCSS = new ExtractTextPlugin({
  filename: 'css/style-[contenthash:8].css',
  disable: !production
});

const cssLoader = {
  loader: 'css-loader',
  options: {
    minimize: production && {
      discardComments: {
        removeAll: true
      }
    }
  }
}
const lessLoader = {
  use: [cssLoader, 'postcss-loader', 'less-loader'],
  fallback: 'vue-style-loader',
  publicPath: '../'
};

/**
 * @param {} env  配置对象
 * 函数体：合并几个对象的值  从后到前依次覆盖，如果为生产环境则引入config.prod.js，否则引入config.js
 * 返回 Obj
 */
const env_vars = (env) => {
  return Object.assign({
    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
  }, production ? require('./config.prod') : require('./config'), env)
}

module.exports = env => ({
  entry: [resolve('src/main.js')],
  output: {
    path: resolve('dist'),
    filename: 'js/[name]-[hash:8].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /node_modules/
      },
      {
        test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
        loader: 'url-loader?limit=50000&name=assets/[name].[ext]'
      },
      { test: /\.json$/, loader: "json-loader" },
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            loaders: {
              less: vueExtractCSS.extract(lessLoader)
            }
          }
        }]
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: "vue-style-loader",
          use: [cssLoader, 'postcss-loader'],
          publicPath: '../'
        })
      },
      {
        test: /\.less$/,
        use: extractCSS.extract(lessLoader)
      }
    ]
  },

  devtool: production ? false : 'cheap-eval-source-map',
  resolve: {
    extensions: ['.vue', '.js', '.json', '.css', '.less'],
    alias: {
      vue: 'vue/dist/vue.js',
      "@": resolve('src'),
    },
    modules: ['node_modules', "src/styles"]
  },

  plugins: [
    new CleanWebpackPlugin(['dist'],
      {
        root: resolve('.'),
        verbose: true,
        dry: false
      }),
    new webpack.DefinePlugin({
      "process.env": env_vars(env)
    }),
    extractCSS,
    vueExtractCSS,
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      inject: true
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
});