const util = require('util');
const fs = require('fs');
const child_process = require('child_process');
const fetch = require('node-fetch'); 

const exec = util.promisify(child_process.exec); 
const { existsSync } = fs;

// const PORT = 9015;
const SERVED_FOLDER = '/home/dominitech/workspace/proudofmom.com/proudofmom-be/master';
const DOMAIN = 'proudofmom.com';
const STAGING_DOMAIN = `staging.${DOMAIN}`;
const CLIENT_ROOT = '/api';

const main = async () => {
  try {
    const args = Object.values(process.argv);
    const SUDO_PASSWORD = args[2];
    const AUTH_TOKEN = args[3];
    const CIRCLE_PROJECT_USERNAME = args[4];
    const CIRCLE_PROJECT_REPONAME = args[5];
    const CIRCLE_BUILD_NUM = args[6]; 

    const options = {
      method: 'GET',
      headers: {'Circle-Token': `${AUTH_TOKEN}`}
    };
    const response = await fetch(`https://circleci.com/api/v1.1/project/gh/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}`,options);
    const data = await response.json();
    console.log('CIRCLE_BUILD_NUM:', CIRCLE_BUILD_NUM);
    const pipeline = await new Promise((rs, rj) => data.some((d, i) => {
      if(d.build_num == CIRCLE_BUILD_NUM) { rs(d) } else { rj(new Error("Can't find object")) }
    }));
    const rxg = /.*#(\d+).*/g;
    const match = rxg.exec(pipeline.subject);
    const prNumber = match[1];

    const SITE_URL = `${STAGING_DOMAIN}${CLIENT_ROOT.length > 0 ? CLIENT_ROOT : ''}`;
    if(!existsSync(`/var/www/${SITE_URL}`)) {
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir /var/www/${SITE_URL}`);
      console.log('Created folder:', `${SITE_URL}`);
    }

    // extract next
    await exec('unzip -qq dist.zip');


    // copy resource to serve folder
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/package.json /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/dist /var/www/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/node_modules /var/www/${SITE_URL}`);

    // Reload staging site
    await exec('/home/dominitech/.npm-global/bin/pm2 reload api-pom-staging'); 

    // remove resource after copy
    await exec(`rm -rf ./**`);
    
    // cleanup 
    console.log('Cleanup start.');  
    const cleanup = async (prNumber) => {
      if(!prNumber) {
        return false;
      }
      // await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir ${SERVED_FOLDER}`);
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm -rf /var/www/staging.${DOMAIN}/api${prNumber}`);
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm -rf /home/dominitech/workspace/proudofmom.com/proudofmom-be/${prNumber}`);
      await exec(`/home/dominitech/.npm-global/bin/pm2 delete api-staging${prNumber}.${DOMAIN}`);
      await exec('/home/dominitech/.npm-global/bin/pm2 save');
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm /etc/nginx/sites-available/api-staging${prNumber}.${DOMAIN}`);
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm /etc/nginx/sites-enabled/api-staging${prNumber}.${DOMAIN}`);
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S systemctl restart nginx`);
    };

    await cleanup(prNumber);
    
    console.log('Deploy successful.');
    await exec(`exit`);

  } catch (e) {
    // remove resource after copy
    await exec(`rm -rf ./**`);
    throw new Error(e.message);
  }
}

main();