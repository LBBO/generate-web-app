# generate-web-app - A CLI to help you get started

## Usage

### Via `npm`

You can either install the CLI globally or use it via `npx`. The latter is recommended as you'll always be using the
latest version without having to constantly re-install `generate-web-app`.

```
npx generate-web-app
```

In order to install the package globally, run

```
npm i -g generate-web-app
```

You'll then be able to execute `generate-web-app` as a normal command in your terminal.

### Via a local setup

It's a bit more work, but you can also run the CLI completely locally. This is definitely recommended for development.
To get started, clone this repository:

```
git clone https://github.com/LBBO/generate-web-app.git
cd generate-web-app
npm install
```

⚠ Due to [an issue with an npm package](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/54885), you will
need to delete the `./node_modules/@types/inquirer/node_modules`
folder.

Next, you'll need to build the current version by running

```
npm run build
```

You can now either run the script directly via

```
node dist/index.js`
```

or you link the package. This tells npm to look for `generate-web-app` on your computer instead of in its registry. This
will allow you to use the normal `npx generate-web-app` command for testing. To do this, simply run

```
npm link
```

⚠️ Attention: you'll have to undo this if you want to use the registry's version again! This can be done via

```
npm unlink
```

## Testing, linting etc.

This project uees jest for testing. To start jest in its interactive mode, simply run

```
npm test
```

Linting and Code style enforcement is taken care of by eslint and prettier. Both should be executed automatically before
each commit, but you can also run them manually:

```
npm run lint # Doesn't overwrite files
npm run prettier # ⚠️ Overwrites files!
```
