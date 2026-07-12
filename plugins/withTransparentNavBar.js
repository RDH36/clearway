const { withAndroidStyles } = require('expo/config-plugins');

module.exports = function withTransparentNavBar(config) {
  return withAndroidStyles(config, (cfg) => {
    const appTheme = cfg.modResults.resources.style.find((s) => s.$.name === 'AppTheme');
    if (appTheme) {
      const drop = ['android:navigationBarColor', 'android:enforceNavigationBarContrast'];
      appTheme.item = appTheme.item.filter((i) => !drop.includes(i.$.name));
      appTheme.item.push({ $: { name: 'android:navigationBarColor' }, _: '@android:color/transparent' });
      appTheme.item.push({ $: { name: 'android:enforceNavigationBarContrast' }, _: 'false' });
    }
    return cfg;
  });
};
