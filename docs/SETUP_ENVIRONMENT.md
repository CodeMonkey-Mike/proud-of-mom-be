# Proud of Mom
# Provisioning

- OS system: MacOS
- Typescript: 3.9.x

> Window / Ubuntu: TBD

# Development setup

This is a guide aka a part of project development process under local system.
And this guide will help us set-up step by step and run the backend service correctly.

<b>Contents:</b>

- [Step 1: Initialize source code](#step-1-initialize-source-code)
- [Step 2: Setup local database](#step-2-setup-local-database)
  - [2.1 Install PostgresQL](#21-install-postgresql)
    - [2.1.1 Use Postgres.app](#211-use-postgresapp)
    - [2.1.2 Use Homebrew](#212-use-homebrew)
  - [2.2 Create user and database name](#22-create-user-and-database-name) 
    - [2.2.1 Automatically](#221-automatically)
    - [2.2.1 Manually](#222-manually)
- [Step 3: Initialize development data](#step-3-initialize-development-data)
  - [3.1 Download sample data](#31-download-sample-data)
  - [3.2 Import data into local database](#32-import-data-into-local-database)
  - [3.3 TypeORM & PostgresQL configuration](#33-typeorm-postgresql-configuration)
- [Step 4: Start development](#step-4-start-development)

## Step 1: Initialize source code

Clone this repository to local machine:

```
git clone https://github.com/CodeMonkey-Mike/proud-of-mom-be.git
cd proud-of-mom-be
```

## Step 2: Setup local database

> Did you familiar with PostgreSQL yet? Don't worry, in this step. It guides you on how to set-up a PostgreSQL into the local system and gets start with the POM project.

### 2.1 Install PostgresQL

Make sure you already installed PostgresQL under your local, if not please refer to the ways below:

#### 2.1.1 Use Postgres.app

This one of popular GUI of Postgres. [Download](https://postgresapp.com/downloads.html)

#### 2.1.2 Use Homebrew

Copy the command line below pastes it into your terminal window.

```
brew cask install postgres
```

Waiting until the proccess finished and start the PostgreSQL server:

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

### 2.2 Create user and database name

Check out the `.env.example` file in the root of repository.
Then create a new `.env` file and copy content of `.env.example` into `.env` file.

There are 2 ways to create database information:

#### 2.2.1 Automatically

We prepared an auto script for the initial database under the local system only with a few steps.

```
// Firstly, open terminal window, then place to scripts directory
cd /project/path/scripts/
```

For automation please use (recommended):

```
sh localdb.sh -auto
```
`-auto` tag will be used the default database information that stored in `.env` [file above](#22-create-user-and-database-name).

Wait until the process finished. 

```
// this info will show when the process finished
TYPEORM_DATABASE = xxxxx
TYPEORM_USERNAME = xxxxx
TYPEORM_PASSWORD = xxxxx
```

Otherwise, if we don't input `-auto` tag, a manual process will be activated.

> Hint: if using -auto tag and the user or database already existed, this step will delete that info then we need to initial development data again.

Next step [Initialize development data](#step-3-initialize-development-data).

#### 2.2.2 Manually

<b>A. Create a new user</b>

This is step create specific user for the database of project manually.

```
// Change <USER_NAME> with your own user name.
// Change <USER_PWD> with your own user password.

echo "CREATE USER <USER_NAME> WITH PASSWORD '<USER_PWD>'" | psql -U postgres -w
```

<b>B. Create a new database</b>

After created the user of database, next step create a database and assign the owner of database name by the user above.

```
// Change <DB_NAME> with the name you wish.
echo "CREATE DATABASE <DB_NAME> ENCODING = 'UTF8';" | psql -U postgres -w
```

When see the message `"The user <USER_NAME or DB_NAME> already exists."`. We need to delete it and create a new one then initiate the development data again., refer to command below:

```
// delete a database
echo "DROP DATABASE <DB_NAME>;" | psql -U postgres -w

// delete a user
echo "DROP USER <USER_NAME>;" | psql -U postgres -w
```


<b>C. Grant privileges to the specific user</b>

In this step, the database only wants one user able to access.

```
// Assign privileges to the user
echo "GRANT ALL PRIVILEGES ON DATABASE <DB_NAME> TO <USER_NAME>;" | psql -U postgres -w

// Revoke public permission. This public default when create any database under local.
echo "REVOKE ALL PRIVILEGES ON DATABASE <DB_NAME> FROM public;" | psql -U postgres -w
```

When finished the steps above, this time we need to initiate data from the development environment that provided by the project owner.

Next step [Initialize development data](#step-3-initialize-development-data).

## Step 3: Initialize development data

### 3.1 Download sample data

Go to console google UI to download the development data: [Download link](https://console.cloud.google.com/storage/browser/bk_proud_of_mom;tab=objects?forceOnBucketsSortingFiltering=false&cloudshell=false&project=rock-fountain-288922&prefix=&forceOnObjectsSortingFiltering=false)

### 3.2 Import data into local database

Move the backup file above into `scripts` folder inside the repository directory, now run the script to sync the data have just downloaded into local database.

```
// overwrite <USER_NAME> and <DB_NAME>
psql -U <USER_NAME> -d <DB_NAME> < proudofmomps_dev.sql

// remove the backup file after sync successful
rm proudofmomps_dev.sql
```


### 3.3 TypeORM & PostgresQL configuration

Based on step above, the configuration info are auto pickup from `.env` file.

Now, ready to start backend service. Use [start development](#start-development) command below. When the server starting check it out with:

``` 
http://localhost:4000/grapql
```

## Step 4: Start development

```
yarn && yarn dev
```

> This file keep up to date.
> Latest updated: <b>2020-10-11</b>
