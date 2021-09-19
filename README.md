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

This project uses jest for testing. To start jest in its interactive mode, simply run

```
npm test
```

Linting and Code style enforcement is taken care of by eslint and prettier. Both should be executed automatically before
each commit, but you can also run them manually:

```
npm run lint # Doesn't overwrite files
npm run prettier # ⚠️ Overwrites files!
```

### E2E tests

There are also some end-to-end tests. In order to not install a ton of garbage projects on your computer, they are
executed inside Docker containers. Thus, in order to run these tests, you will need to install Docker.

Once Docker is installed, just run `npm run test:e2e`. This script will automatically build a Docker image
containing the current version of GWA and then create containers based on that image. One container will be created
per setup that is supposed to be tested. To adjust which configurations are tested, simply edit
`e2e/ConfigurationsToTest.ts`. Please make sure that all project names are unique.

All these tests do automatically, is to run GWA with the given parameters. If the installation is successful, the
script attempts to build the project. If the build succeeds as well, the setup is considered to have been successful.
After all setups have been executed, a summary is printed for the user to see which setups ran into issues.

Each container is also saved to a new Docker image within the `gwa-test` repository. This feature can currently only
be disabled by switching the `saveContainersToImages` flag in `e2e/runE2eTests.ts:34` (as of 09454b5). Since all
images are saved to the same repository, they can all be deleted at once by running `docker image rm gwa-test`. To
find out what images were created, you can run `docker image ls | grep gwa-test`. This command will print a table
containing all images with their names. Please note that the below table entry would result in an image named
`gwa-test:react-no-ts`

```
gwa-test                                   react-no-ts                      21e3a6abcb35        19 minutes ago      875MB
```

Saving these images allows you to perform manual tests with these configurations without having to install them
again. To do so, simply run `docker run -it --rm <image-name>`, where `<image-name>` should be replaced
with the exact name of the image you would like to test (in the above example, you would replace `<image-name>` with
`gwa-test:react-no-ts`).
