const fs = require('fs');
const resolve = require('path').resolve;
const join = require('path').join;
const cp = require('child_process');
const os = require('os');

// get library path
const lib = resolve(__dirname, './plugins/');

fs.readdirSync(lib)
  .forEach((mod) => {
    const modPath = join(lib, mod);
    // ensure path has package.json
    if (!fs.existsSync(join(modPath, 'package.json'))) {
      return;
    }

    // npm binary based on OS
    const npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    console.log(`NPM Install: ${modPath}`);

    // install folder
    cp.spawn(npmCmd, ['i'], {
      env: process.env,
      cwd: modPath,
      stdio: 'inherit',
    });
  });
