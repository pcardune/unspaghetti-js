# Unspaghetti-js

Unspaghetti-js is a tool to help you understand the module dependencies in a
javascript code base and refactor them to a saner state.

## Usage

This project is currently under development and has not been published to npm
yet. As such, the first step is to clone this repository and run `npm install`.

```
git clone https://github.com/pcardune/unspaghetti-js.git
cd unspaghetti-js
npm install
```

To start up the tool, run:

```npm start```

and browse to [http://localhost:3001](http://localhost:3001)

By default, this will give you access to the current directory.

### Specifying a directory to inspect

If you want to inspect something other than the current directory, you can set
the `BASE_PATH` environment variable, i.e.

```
BASE_PATH=~/my-projects/some-project npm start
```

### Specifying a .madgerc file ###

Unspaghetti uses [madge](https://github.com/pahen/madge) to generate the
dependency tree for your code. If your code uses any fancy webpack or require.js
configuration to do non-standard module resolution, you'll need to tell madge
about it using a `.madgerc` file. By default, unspaghetti will look in the
`BASE_PATH` directory for a file named `.madgerc`, but you can also specify a
custom file path via the `MADGERC` environment variable. for example:

```
MADGERC=~/.madgerc BASE_PATH=~/my-projects/some-project npm start
```

### Changing the port ###

You can change port that unspaghetti runs on with the `PORT` environment
variable.

```
PORT=5005 npm start
```

### Turning on Debugging ###

If you aren't seeing a dependency graph that you expect, something is probably
wrong. You can turn on debugging with the `DEBUG` environment variable to find
out what is happening:

```
DEBUG=* npm start
```

## Development

If you want to develop `unspaghetti-js` and get nice things like unminified
javascript and automatic rebuilds, you'll want to run two separate commands:

```
npm run start:server
```

will start the api server that lets the browser get information about the
filesystem and

```
npm run start:client
```

which starts up a webpack dev server to serve packaged javascript files. The
latter command will automatically open your browser to the correct page.
