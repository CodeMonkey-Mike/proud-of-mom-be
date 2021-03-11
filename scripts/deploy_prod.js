const util = require('util');
const fs = require('fs');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec); 
const { existsSync } = fs;

const PORT = 9013;
const SERVED_FOLDER = '/home/dominitech/workspace/proudofmom.com/proud-of-mom-be';
const SITE_ORIGIN_DOMAIN = 'proudofmom.com';
const CLIENT_ROOT = '/api';

const main = async () => {
  try {
    const args = Object.values(process.argv);
    const SUDO_PASSWORD = args[2];
    const CIRCLE_TAG = args[3];

    await exec('git fetch');
    await exec(`git checkout master`);
    await exec(`git pull origin master`);
    // const version = await exec('git describe --abbrev=0');
    // await exec(`git checkout tags/${version.stdout}`);

    await exec('npm install');

    const SITE_URL = `${SITE_ORIGIN_DOMAIN}${CLIENT_ROOT.length > 0 ? CLIENT_ROOT : ''}`;
    if(!existsSync(`/var/www/${SITE_URL}`)) {
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir /var/www/${SITE_URL}`);
      console.log('Created folder:', `${SITE_URL}`);
    }
    await exec('npm run build');
    
    console.log('Build successful'); 

    // copy resource to serve folder
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/package.json /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/dist /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/node_modules /var/www/${SITE_URL}`);
    
    await exec('git checkout package.json');
    console.log('Tag version:', CIRCLE_TAG);
    console.log('Production deploy successful.');
    await exec(`exit`);

  } catch (e) {
    throw new Error(e.message);
  }
}

main();   