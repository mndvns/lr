
# lr

Livereload is an [amazing](http://livereload.com) tool comprised of [many](https://github.com/livereload/livereload-core) [somewhat](https://github.com/livereload/livereload-cli) [half-baked](https://github.com/livereload/livereload-protocol) components. This project provides a high-level abstaction of livereload so developers can accomplish much more with it.

## Installation

    npm install -g lr

## Features

- reload static assets without refreshing
- watch files and directories, triggering tasks on changes
- make-like configurations with `.lr.yml`
- control task execution styles with configurable delimiters (see `mute`)

## Usage

  From `--help`:

    Usage: lr [options] [path]:[command] ...

    Options:

      -h, --help         output usage information
      -V, --version      output the version number
      -p, --port <port>  listen on port
      -m, --mute <char>  character to suppress reloading
      -f, --file <path>  path to configuration file
      -v, --verbose      more detailed log messages
      -s, --silent       suppress all log messages

## Tasks

#### [path]

Watch the path and reload on changes. All watches are recursive.

Examples:

```bash
$ lr            # this is the same as passing `.`
$ lr foo bar    # pass as many paths as you like
$ lr foo/*.js   # globs are resolved
```

#### [path]:[command]

If given a command, lr will execute it before reloading. This is
particularly useful for builds.

Examples:

```bash
$ lr baz:make   # when baz changes, make, then reload
```

#### [path]:[[mute]command]

Mute commands are prefixed by the mute delimiter, `@`, by default.

A mute command does not trigger a reload. This is handy for
builds with multiple compile steps. For instance, you may want to
compile your stylus files quietly, instead waiting for changes in
`build` before reloading.

Examples:

```bash
$ lr public/*/*.styl:'@make stylus' build  # compile CSS when necessary, but only reload for changes in build
```

## Todo

- tests
- docs on config files

## License

MIT
