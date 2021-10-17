# Welcome to generate-web-app 👋

[![Version](https://img.shields.io/npm/v/generate-web-app.svg)](https://www.npmjs.com/package/generate-web-app)
![Prerequisite](https://img.shields.io/badge/node-%3E%3D14.0.0-blue.svg)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/LBBO/generate-web-app#readme)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/LBBO/generate-web-app/graphs/commit-activity)
[![License: MIT](https://img.shields.io/github/license/LBBO/generate-web-app)](https://github.com/LBBO/generate-web-app/blob/main/LICENSE)
[![Twitter: LBBO_](https://img.shields.io/twitter/follow/LBBO_.svg?style=social)](https://twitter.com/LBBO_)

> A CLI to help you get started with your web project

## Prerequisites

- node >=14.0.0

## 🚀 Usage

The fastest and recommended way to use GWA is by running the following command:

```sh
npx generate-web-app
```

You can also install GWA permanently on your computer by running

```sh
npm i -g generate-web-app
```

Afterwards, GWA can be executed with one of the two following commands:

```sh
generate-web-app
# or
gwa
```

## Install

To set up GWA locally, first clone this git repository:

```sh
git clone https://github.com/LBBO/generate-web-app.git
cd generate-web-app
npm install
```

Next, you'll need to build the current version by running

```sh
npm run build
```

You can now either run the script directly via

```sh
node dist/index.js
```

or you link the package. This tells npm to look for `generate-web-app` on your computer instead of in its registry. This
will allow you to use the normal `npx generate-web-app` command for testing. To do this, simply run

```sh
npm link
```

⚠️ Attention: you'll have to undo this if you want to use the registry's version again! This can be done via

```sh
npm unlink
```

## 🧪 Run tests, linter, etc.

There are multiple different tools you can run to aid your development process. First of all, you can execute the jest
unit tests by running

```sh
npm run test
```

Linting and Code style enforcement is taken care of by eslint and prettier. Both should be executed automatically before
each commit, but you can also run them manually:

```sh
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

## ℹ More information

Originally, GWA was the product of my bachelor's thesis. Sadly, the thesis is in German, but if you would like to
read it, you can find it [here](https://lbbo.github.io/bachelor-thesis/thesis.pdf).

## Author

👤 **Michael David Kuckuk**

- Website: http://michaelkuckuk.com
- Twitter: [@LBBO\_](https://twitter.com/LBBO_)
- Github: [@LBBO](https://github.com/LBBO)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/LBBO/generate-web-app/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Michael David Kuckuk](https://github.com/LBBO).

This project is [MIT](https://github.com/LBBO/generate-web-app/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
