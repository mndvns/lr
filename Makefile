
test:
	@./node_modules/.bin/mocha \
		--require should

watch:
	@./node_modules/.bin/mocha \
		--require should \
		--watch

.PHONY: test watch
