# Proud of Mom

## Tech Stack

- [x] [KOA](https://github.com/koajs/koa)
- [x] [koa-bodyparser](https://github.com/koajs/bodyparser)
- [x] [koa-router](https://github.com/ZijianHe/koa-router)
- [x] [kors](https://github.com/koajs/cors)
- [x] [Apollo Server](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-koa)
- [x] [Type-Graphql](https://github.com/MichalLytek/type-graphql)
- [x] [TypeORM](https://github.com/typeorm/typeorm)
- [x] [pg](https://github.com/brianc/node-postgres/tree/master/packages/pg)
- [x] [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [x] [Dotenv](https://github.com/motdotla/dotenv)

## Provisioning

- OS system: MacOS
- Typescript: 3.9.x

## I. Get started!

This is a guide aka a part of project development process under local system.

- This guide will help us set-up step by step and run backend service correctly.

## II. Init source code

- Clone this repository to local machine:

```

git clone https://github.com/CodeMonkey-Mike/proud-of-mom-be.git
cd proud-of-mom-be

```

## III. Set-up local database

>Do you familiar with Postgress? No? Don't worry, in this step. It guides you on how to set-up a PostgreSQL into the local system and gets start with the POM project.

### Initialize Postgresql

#### Install Postgres

- Make sure you already installed Postgres under your local or use the ways below:

a. BY Postgres.app

- [Download link](https://postgresapp.com/downloads.html)

b. By Homebrew

Copy the command line below pastes it into your terminal window.

```
brew cask install postgres
```

Waiting until the proccess finished and start the postgres server:

- To start manually:

```
pg_ctl -D /usr/local/var/postgres start
```

- To stop manually:

```
pg_ctl -D /usr/local/var/postgres stop
```

- To start PostgreSQL server now and relaunch at login:

```
brew services start postgresql
```

- And stop PostgreSQL:

```
brew services stop postgresql
```

### Create user and database name

- Check out the .env.example in the root of repository.
- Create .env and copy content of .env.example into .env file.

#### A. Use auto script

We prepeared  a auto script to initial database under local system with few steps.

```

//Firstly, open terminal window.
cd /project/path/script/

```

1. For an auto please use (recommended):

```
// -auto tag will be used the default database information
sh locadb.sh -auto
```

Wait until the process finished. 

```

// Copy and replcae this info inside .env file
TYPEORM_DATABASE = pom
TYPEORM_USERNAME = pomusr
TYPEORM_PASSWORD = pom1234

```

Continue with step [Initialize databse](#initialize-databse)

> Warning: if using -auto tag and the user or database already existed, this step will delete that info and we need to initial development data again.

2. Manual script set-up with step by step:

```
// This script will need your time to explore and might have many issues.
// Run the script without -auto tag
sh locadb.sh

```

After the process finished.
Continue with step [Initialize databse](#initialize-databse)

#### B. Manually

1. Create user

This is step create specific user for the database of project manually.

```

// Change <USER_NAME> with your own user name.
// Change <USER_PWD> with your own user password.

echo "CREATE USER <USER_NAME> WITH PASSWORD '<USER_PWD>'" | psql -U postgres -w

```

2. Create database

- After created the user of database, next step to create a database and assign owner of database name by the user above.

```

// Change <DB_NAME> with your own user password.
echo "CREATE DATABASE <DB_NAME> ENCODING = 'UTF8';" | psql -U postgres -w

```

> Hint: if see `"The user <USER_NAME or DB_NAME> already exists."` We need delete it and create a new one then init the develop data again.


3. Grant a permission to the specific user.

In this step, the database only wants a user able to access.

```
// Assign permission to the user
echo "GRANT ALL PRIVILEGES ON DATABASE <DB_NAME> TO <USER_NAME>;" | psql -U postgres -w

// Revoke public permission. This public default when create any database under local.
echo "REVOKE ALL PRIVILEGES ON DATABASE <DB_NAME> FROM public;" | psql -U postgres -w

```

When finished the steps above, this time we need to initial data from the development environment that provided by the project owner.

Continue with step [Initialize databse](#initialize-databse)

### Initialize databse

1. Download sample data

Go to Gcloud UI to download the development data:

- [Download link](https://console.cloud.google.com/storage/browser/bk_proud_of_mom;tab=objects?forceOnBucketsSortingFiltering=false&cloudshell=false&project=rock-fountain-288922&prefix=&forceOnObjectsSortingFiltering=false)

2. Import into local database

Place the backup file above into `scripts` folder inside the repository folder, now run the script to sync the data have just downloaded int local database.

```

// overwrite <USER_NAME> and <DB_NAME>
psql -U <USER_NAME> -d <DB_NAME> < proudofmomps_dev.sql

// remove the backup file after sync successful
rm proudofmomps_dev.sql

```


3. TypeORM & Postgres configuration

- Based on steps above, copy the info of database and user that created into `.env` file.

Now, ready to start backend service. Use `start developement` command step below. When the server started check it out with:

``` 
http://localhost:4000/grapql

```

## V. Available Scripts

1. Install node modules

`yarn`

2. Start development

`yarn dev`

3. Production build

`yarn build`

4. Production start

`yarn start`
