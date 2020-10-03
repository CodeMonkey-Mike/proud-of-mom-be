#!/bin/sh
DB_DEFAULT_NAME='pom'
USER_DEFAULT_NAME='pomusr'
USER_DEFAULT_PWD='pom1234'

create_helper_db () {
  WHOAMI=$(id -un)
  if psql -lqt | cut -d \| -f 1 | grep -qw $WHOAMI; then
    echo 'Creating role...'
  else
    createdb -h localhost
    echo 'Creating role...' 
  fi 
}

cloud_ps_sync () {
  echo "To sync the staging data from GGP. You must download and install the SDK on your system and initialize it before you can use the gcloud command-line tool."
  echo "[yes]/no"
  read YES_NO
  if [ "$YES_NO" == "yes" ]; then
    echo "Backup starting..."
    # dump data to storage bucket
    # gcloud sql export sql proudofmomps \
    #   gs://bk_proud_of_mom/proudofmomps_dev.sql \
    #   --database proudofmomps_dev
    gsutil cp gs://bk_proud_of_mom/proudofmomps_dev.sql proudofmomps_dev.sql
    # restore backup into local db
    psql -U $1 -d $2 < proudofmomps_dev.sql
    # remove local sql file
    rm proudofmomps_dev.sql
  else
    echo "Please install gcloud SDK to use gcloud cli"
    echo "See: https://cloud.google.com/sdk/downloads"
    exit
  fi 
}

auto() {
    create_helper_db
    echo "DROP DATABASE $DB_DEFAULT_NAME;" | psql -U postgres -w
    echo "DROP USER $USER_DEFAULT_NAME;" | psql -U postgres -w
    echo "CREATE USER $USER_DEFAULT_NAME WITH PASSWORD '$USER_DEFAULT_PWD'" | psql -U postgres -w
    echo "CREATE DATABASE $DB_DEFAULT_NAME ENCODING = 'UTF8';" | psql -U postgres -w
    echo "GRANT ALL PRIVILEGES ON DATABASE $DB_DEFAULT_NAME TO $USER_DEFAULT_NAME;" | psql -U postgres -w
    echo "REVOKE ALL PRIVILEGES ON DATABASE $DB_DEFAULT_NAME FROM public;" | psql -U postgres -w
    echo " Your database info. Please copy and replace this info in .env file"
    echo "
    TYPEORM_DATABASE = $DB_DEFAULT_NAME
    TYPEORM_USERNAME = $USER_DEFAULT_NAME
    TYPEORM_PASSWORD = $USER_DEFAULT_PWD
    "
}

manual() { 
  # create the user
  echo What is username? your answer:
  read USER_NAME
  echo What is password? your answer:
  read USER_PWD
  if psql -t -c '\du' | cut -d \| -f 1 | grep -qw $USER_NAME; then
    # database exists
    # $? is 0
    echo "The user $USER_NAME already exists."
    echo "Do you want to create a new user [yes]/no"
    read YES_NO
    if [ $YES_NO == 'yes' ] || [ $YES_NO == 'y' ]; then
      echo Please give a new name:
      read USER_NAME_EL
      echo "CREATE USER $USER_NAME_EL WITH PASSWORD '$USER_PWD'" | psql -U postgres -w
    else
      # ruh-roh
      echo "DROP USER $USER_NAME;" | psql -U postgres -w
      echo "CREATE USER $USER_NAME WITH PASSWORD '$USER_PWD'" | psql -U postgres -w
    
    fi
  else
      # ruh-roh
      # $? is 1
      create_helper_db
      echo "CREATE USER $USER_NAME WITH PASSWORD '$USER_PWD'" | psql -d postgres -w
  fi
   
  # create the DB
  echo What is your DB name? your answer:
  read DB_NAME
  if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    # database exists
    # $? is 0
    echo "The database $DB_NAME already exists."
    echo "Do you want to overwrite it? It will be overwritten with staging data [ok]/no:"
    read YES_NO
    if [ $YES_NO == 'ok' ]; then
      echo "DROP DATABASE [IF EXISTS] $DB_NAME;" | psql -U postgres -w
      echo "CREATE DATABASE $DB_NAME ENCODING = 'UTF8';" | psql -U postgres -w
    else
      # ruh-roh
      echo "Whoops, i don't want to do that now."
      exit
    fi 
  else
      # ruh-roh
      # $? is 1
      echo "CREATE DATABASE $DB_NAME ENCODING = 'UTF8';" | psql -U postgres -w
  fi
  echo "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $USER_NAME;" | psql -U postgres -w
  echo "REVOKE ALL PRIVILEGES ON DATABASE $DB_NAME FROM public;" | psql -U postgres -w
  
  # cloud_ps_sync $USER_NAME $DB_NAME

  echo " Your database info:"
  echo "
    TYPEORM_DATABASE = $DB_NAME
    TYPEORM_USERNAME = $USER_NAME
    TYPEORM_PASSWORD = $USER_PWD
    "

}
# execute script
echo "Creating new user and database..."
IS_AUTO=$1
if [ "$IS_AUTO" == "-auto" ]; then
  auto
else
  manual
fi 