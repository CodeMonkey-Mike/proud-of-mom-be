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

### Quick start 

- Make sure you already install postgres under your local. Check out the .env.example in server repo.
- Create .env from .env.example 

#### Install node modules

`npm install` or `yarn`

#### Start development

`npm run dev` or `yarn dev`

#### Test

`npm run test` or `yarn test`

#### Production build

`npm run build` or `yarn build`

## Working processes

This one explains the process step to step from picking task and go to finish the ticket.

### Step 01:

- After checked out the repository, go to the source folder and create a branch for development.

Example: At master branch, we do

```
git pull

git checkout -b <Name_of_branch> // for example f/abc

git push origin f/abc
```

### Step 02:

Code something, do what you need to do.

Example

```
git add ./src/path/files.(ts,tsx)

...

git commit -m 'f/abc: [POM] create new abc'
```

Commit message follow the format: `BRANCH_NAME: [REPO_NAME] MESSAGE TEXT` 

### Step 03:

Create/Review pull request:

- Create pull request from your branch to master.
- Pull request needs approved before merge to master.
- If everything is ok, click merge the pull request and delete old branch.

### Step 04:

When the PR is created, the build process will be executed. If the process successful, one new domain base on PR number will be created.

Example:
PR number is #1, the sub domain to preview is `stage1.proudofmom.com` with format `stage{PR_NUMBER}.proudofmom.com`