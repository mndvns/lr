
test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 5000 \
			test/*.test.js

watch:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 5000 \
		--watch \
			test/*.test.js

.PHONY: test watch
