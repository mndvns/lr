
MOCHA      = ./node_modules/.bin/mocha
MOCHA_OPTS = --require should --timeout 5000 --bail test/*.test.js
DEBUG_OPTS = lr:config

test:
	@DEBUG=$(DEBUG_OPTS) $(MOCHA) $(MOCHA_OPTS)

watch:
	@DEBUG=$(DEBUG_OPTS) $(MOCHA) $(MOCHA_OPTS) --watch

.PHONY: test watch
