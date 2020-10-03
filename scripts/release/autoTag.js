const util = require('util');
const readline = require('readline');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);

const getNewTag = (currentVersion) => {
  let prefixVersion = 'v';
  const version = currentVersion.replace(prefixVersion, '');
  const partialVersion = version.split('.');
  const major = parseInt(partialVersion[0], 10);
  let minor = parseInt(partialVersion[1], 10);
  let patch = parseInt(partialVersion[2], 10) + 1;
  if (patch === 100) {
    minor += 1;
    patch = 0;
  }
  return `v${major}.${minor}.${patch}`;
};

const escapeTagName = (str) => str.replace(/\'/g, "\\'");

const main = async () => {
  try {
    const isAutoTag = Object.values(process.argv).includes('-auto');

    if (!isAutoTag && process.argv.length <= 2) throw new Error('Tag name does not specified');

    let res = await exec('git status');

    if (!res.stdout) throw new Error('Invalid git command.');

    if (!res.stdout.includes('On branch master')) throw new Error('Not on master branch.');

    if (res.stdout.includes('modified:'))
      throw new Error(
        'There are uncommitted changes. Please commit or stash the changes before continue.'
      );

    console.log('Pulling latest on master branch and create tags...');

    await exec('git pull origin master');

    await exec('git fetch --tags');

    res = await exec('git describe --always --tags --abbrev=0');

    let tagName = '';

    if (isAutoTag) {
      const commitMsg = await exec(`git log --merges --format=%b ${res.stdout.trim()}...`);
      tagName = commitMsg.stdout;
    } else {
      tagName = process.argv[2];
    }

    const newTagVersion = getNewTag(res.stdout);
    const gitTagCommand = `git tag -a ${newTagVersion} -m '${escapeTagName(tagName)}'`;
    console.log(`Creating and push a new tag ${gitTagCommand}`);

    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.question('Are you ready to proceed? [yes]/no: ', async (answer) => {
      if (answer !== 'no') {
        res = await exec(gitTagCommand);

        if (res.stderr) throw new Error('Create tag failed.');

        console.log(`Pusding tag ${newTagVersion}`);

        await exec(`git push origin ${newTagVersion}`);
        await exec(`echo "${gitTagCommand}" | pbcopy`);

        console.log('Push complete. Git command copied to clipboard.');
      }
      process.exit();
    });
  } catch (e) {
    throw new Error(e.message);
  }
};

main();
