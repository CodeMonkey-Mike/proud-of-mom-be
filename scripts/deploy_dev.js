const util = require('util');
const fs = require('fs');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec); 
const { existsSync } = fs;

const PREFIX = 415;
const SERVED_FOLDER = '/home/dominitech/workspace/proudofmom.com/proud-of-mom-be';
const ECOSYTEM_FILE = 'scripts/ecosystem.config.js';
const SITE_ORIGIN_DOMAIN = 'proudofmom.com';

const main = async () => {
  try {
    const args = Object.values(process.argv);

    const COMMIT_SHA = args[2];
    const CIRCLE_PULL_REQUEST_URL = args[3];
    const SUDO_PASSWORD = args[4];
    const TYPEORM_DATABASE = args[5];
    const TYPEORM_USERNAME = args[6];
    const TYPEORM_PASSWORD = args[7];

    if(!COMMIT_SHA) {
      throw new Error(`Missing entry value: COMMIT_SHA`);
    }
    if(!CIRCLE_PULL_REQUEST_URL) {
      throw new Error(`Missing entry value: CIRCLE_PULL_REQUEST`);
    }
    await exec('git fetch');
    await exec(`git checkout master`);
    await exec(`git pull origin master`);
    await exec(`git checkout ${COMMIT_SHA}`);

    // parse CIRCLE_PULL_REQUEST
    const CIRCLE_PULL_REQUEST = CIRCLE_PULL_REQUEST_URL.split('/pull/')[1];
    const SITE_URL = `api`;
    if(!existsSync(`/var/www/stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`)) {
 
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir /var/www/stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
      console.log('Created folder:', `stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    }
    await exec('npm run build');
    
    console.log('Build successful');
    const port = Number([PREFIX, CIRCLE_PULL_REQUEST].join('')); 

    // copy resource to serve folder
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/package.json /var/www/stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/dist /var/www/stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/node_modules /var/www/stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    
    const _app_context = `
    module.exports = {
      apps : [{
        name        : "${SITE_URL}-stage.${SITE_ORIGIN_DOMAIN}",
        cwd         : "/var/www/stage.${SITE_ORIGIN_DOMAIN}/${SITE_URL}",
        script      : "npm",
        args        : "start",
        watch       : true,
        env: {
          TYPEORM_CONNECTION : 'postgres',
          TYPEORM_HOST : '127.0.0.1',
          TYPEORM_DATABASE : '${TYPEORM_DATABASE}',
          TYPEORM_USERNAME : '${TYPEORM_USERNAME}',
          TYPEORM_PASSWORD : '${TYPEORM_PASSWORD}',
          TYPEORM_PORT : 5432,
          TYPEORM_ENTITIES : 'dist/db/entities/*.entity{.ts,.js}',
          TYPEORM_MIGRATIONS : 'dist/db/migrations/*{.ts,.js}',
          TYPEORM_MIGRATIONS_RUN : 'dist/db/migrations',
          TYPEORM_MIGRATIONS_DIR : 'dist/db/migrations',
          TYPEORM_ENTITIES_DIR : 'dist/db/entities',
          TYPEORM_SEEDING_SEEDS : 'dist/db/seeds/*{.ts,.js}',
          HTTP_PORT : '${port}',
          DOMAIN : '${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}',
          GCL_STORAGE_PATH :  'rock-fountain-288922-9b7e8d07849d.json'
        }
      }]
    }
    `; 

    if(existsSync(`${ECOSYTEM_FILE}`)) {
      console.log('Removing existed ecosystem file.');
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm ${ECOSYTEM_FILE}`);
    }
    fs.writeFile(`${ECOSYTEM_FILE}`, _app_context, 'utf8', (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });

    await exec(`/home/dominitech/.npm-global/bin/pm2 start ${ECOSYTEM_FILE}`);
    await exec('/home/dominitech/.npm-global/bin/pm2 save');
    console.log(`Starting app via port ${port}`);

    /// create virtual host
    const vh = `
      server {
        listen  80;

        server_name ${SITE_URL}-api.${SITE_ORIGIN_DOMAIN};

        location / {
                proxy_pass http://127.0.0.1:${PREFIX}${CIRCLE_PULL_REQUEST};
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header X-Real-IP  $remote_addr;
                proxy_set_header X-Forwarded-For $remote_addr;
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
      }`;
      
      console.log(`Creating virtual host: ${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}`);
      if(existsSync(`/etc/nginx/sites-available/${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}`)) {
        console.log('Removing existed nginx file.');
        await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm /etc/nginx/sites-available/${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}`);
      } 
      if(existsSync(`/etc/nginx/sites-enabled/${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}`)) {
        console.log('Removing existed sites-enabled nginx file.');
        await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm /etc/nginx/sites-enabled/${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}`);
      } 
      const NGINX_FILE =  `${SITE_URL}-api.${SITE_ORIGIN_DOMAIN}`;
      fs.writeFile(`${NGINX_FILE}`, vh, 'utf8', (err) => {
        if (err) throw err;
        console.log('The virtual host file has been saved!');
      });
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/${NGINX_FILE} /etc/nginx/sites-available/`);
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/${NGINX_FILE} /etc/nginx/sites-enabled/`);
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S systemctl restart nginx`);
      //remove vh after cp
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm ${SERVED_FOLDER}/${NGINX_FILE}`);
      console.log('Deploy successful.');
      await exec(`exit`);

  } catch (e) {
    throw new Error(e.message);
  }
}

main();