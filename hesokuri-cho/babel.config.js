module.exports = function(api) {
  api.cache(true);

  const plugins = [];

  // 開発時（MOCK_ADMOB=true）のみ、AdMobパッケージをダミーファイルに差し替える
  if (process.env.MOCK_ADMOB === 'true') {
    plugins.push([
      'module-resolver',
      {
        root: ['./'],
        alias: {
          'react-native-google-mobile-ads': './src/mocks/AdMobMock.tsx',
        },
      },
    ]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: plugins,
  };
};