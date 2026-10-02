const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;

  const appPath = fs.readdirSync(context.appOutDir)
    .find(name => name.endsWith('.app'));
  if (!appPath) throw new Error('electron-builder did not create a macOS app bundle.');

  // Ad-hoc signing seals the app bundle so LaunchServices can validate its
  // executable and resources. Public distribution still requires Developer ID
  // signing and notarization.
  execFileSync('codesign', [
    '--force',
    '--deep',
    '--sign',
    '-',
    path.join(context.appOutDir, appPath),
  ], { stdio: 'inherit' });
};
