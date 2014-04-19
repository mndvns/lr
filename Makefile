
test:
	@./node_modules/.bin/mocha \
		--require should \
	        test/*.test.js

watch:
	@./node_modules/.bin/mocha \
		--require should \
		--watch

.PHONY: test watch
