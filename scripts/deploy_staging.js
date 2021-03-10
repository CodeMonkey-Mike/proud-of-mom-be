const util = require('util');
const fs = require('fs');
const child_process = require('child_process'); 

const exec = util.promisify(child_process.exec); 
const { existsSync } = fs;

const PORT = 9011;
const SERVED_FOLDER = '/home/dominitech/workspace/proudofmom.com/proud-of-mom-be';
const DOMAIN = 'proudofmom.com';
const STAGING_DOMAIN = `staging.${DOMAIN}`;
const CLIENT_ROOT = '/api';

const main = async () => {
  try {
    const args = Object.values(process.argv);
    const SUDO_PASSWORD = args[2];

    await exec('npm install');

    const SITE_URL = `${STAGING_DOMAIN}${CLIENT_ROOT.length > 0 ? CLIENT_ROOT : ''}`;
    if(!existsSync(`/var/www/${SITE_URL}`)) {
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir /var/www/${SITE_URL}`);
      console.log('Created folder:', `${SITE_URL}`);
    }
    await exec('npm run build');
    
    console.log('Build successful');

    // read/process package.json
    const packageJson = 'package.json';
    const pkg = JSON.parse(fs.readFileSync(packageJson).toString()); 

    // at this point you should have access to your ENV vars
    pkg.scripts.start = `next start -p ${PORT}`;

    // the 2 enables pretty-printing and defines the number of spaces to use
    fs.writeFileSync(packageJson, JSON.stringify(pkg, null, 2));

    // copy resource to serve folder
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/package.json /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/dist /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/node_modules /var/www/${SITE_URL}`);
    
    console.log('Deploy successful.');
    await exec(`exit`);

  } catch (e) {
    throw new Error(e.message);
  }
}

main();