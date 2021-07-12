const util = require('util');
const fs = require('fs');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec); 
const { existsSync } = fs;

const PREFIX = 44;
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

    // parse CIRCLE_PULL_REQUEST
    const CIRCLE_PULL_REQUEST = CIRCLE_PULL_REQUEST_URL.split('/pull/')[1];
    const SERVED_FOLDER = `/home/dominitech/workspace/proudofmom.com/proudofmom-be/${CIRCLE_PULL_REQUEST}`;
    const SITE_URL = `api${CIRCLE_PULL_REQUEST}`;
    if(!existsSync(`/var/www/staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`)) {
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S mkdir /var/www/staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
      console.log('Created folder:', `staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    }
    const port = Number([PREFIX, CIRCLE_PULL_REQUEST].join(''));

    // extract nodes
    await exec('unzip -qq node_modules.zip');
    await exec('unzip -qq dist.zip'); 

    // copy resource to serve folder
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/package.json /var/www/staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/dist /var/www/staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp -r ${SERVED_FOLDER}/node_modules /var/www/staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}`);
    
    const _app_context = `
    module.exports = {
      apps : [{
        name        : "api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}",
        cwd         : "/var/www/staging.${SITE_ORIGIN_DOMAIN}/${SITE_URL}",
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
          DOMAIN : 'api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}',
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

    // remove resource after copy
    await exec(`rm -rf ./**`);
    
    /// create virtual host
    const vh = `
      server {
        listen  80;

        server_name api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN};

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
      
      console.log(`Creating virtual host: api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}`);
      if(existsSync(`/etc/nginx/sites-available/api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}`)) {
        await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm /etc/nginx/sites-available/api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}`);
        await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm /etc/nginx/sites-enabled/api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}`);
        console.log('Removing existed nginx file.');
      } 
      const NGINX_FILE =  `api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}`;
      fs.writeFile(`${NGINX_FILE}`, vh, 'utf8', (err) => {
        if (err) throw err;
        console.log('The virtual host file has been saved!');
      });
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S cp ${SERVED_FOLDER}/${NGINX_FILE} /etc/nginx/sites-available/`);
      try {
        await exec(`echo '${SUDO_PASSWORD}' | sudo -S ln -s /etc/nginx/sites-available/${NGINX_FILE} /etc/nginx/sites-enabled/`);
      } catch (e) {
        console.log(`File /etc/nginx/sites-enabled/${NGINX_FILE} already existed!`);
        await exec(`/home/dominitech/.npm-global/bin/pm2 reload api-staging${CIRCLE_PULL_REQUEST}.${SITE_ORIGIN_DOMAIN}`);
      }
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S systemctl restart nginx`);
      //remove vh after cp
      await exec(`echo '${SUDO_PASSWORD}' | sudo -S rm ${SERVED_FOLDER}/${NGINX_FILE}`);
      console.log('Deploy successful.');
      await exec(`exit`);

  } catch (e) {
    // remove resource after copy
    await exec(`rm -rf ./**`);
    throw new Error(e.message);
  }
}

main();