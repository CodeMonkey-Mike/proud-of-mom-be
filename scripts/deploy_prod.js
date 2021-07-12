const util = require('util');
const fs = require('fs');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec); 
const { existsSync } = fs;

// const PORT = 9011;
const SERVED_FOLDER = '/home/dominitech/workspace/proudofmom.com/proudofmom-be';
const SITE_ORIGIN_DOMAIN = 'proudofmom.com';
const CLIENT_ROOT = '/api';

const main = async () => {
  try {
    const args = Object.values(process.argv);
    const SUDO_PASSWORD = args[2];
    const CIRCLE_TAG = args[3]; 

    const SITE_URL = `${SITE_ORIGIN_DOMAIN}${CLIENT_ROOT.length > 0 ? CLIENT_ROOT : ''}`;
    if(!existsSync(`/var/www/${SITE_URL}`)) {
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir /var/www/${SITE_URL}`);
      console.log('Created folder:', `${SITE_URL}`);
    }

    // extract nodes
    await exec('unzip -qq node_modules.zip');
    await exec('unzip -qq dist.zip');

    // copy resource to serve folder
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/package.json /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/dist /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/node_modules /var/www/${SITE_URL}`);
    
    // Reload staging site
    await exec('/home/dominitech/.npm-global/bin/pm2 reload api-pom');

    // remove resource after copy
    await exec(`rm -rf ./**`);
 
    console.log('Tag version:', CIRCLE_TAG);
    console.log('Production deploy successful.');
    await exec(`exit`);

  } catch (e) {
    // remove resource after copy
    await exec(`rm -rf ./**`);
    throw new Error(e.message);
  }
}

main();   