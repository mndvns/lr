
test:
	@DEBUG=lr:config \
	./node_modules/.bin/mocha \
		--require should \
		--timeout 5000 \
		--bail \
			test/*.test.js

watch:
	@DEBUG=lr:config \
	./node_modules/.bin/mocha \
		--require should \
		--timeout 5000 \
		--watch \
		--bail \
			test/*.test.js

.PHONY: test watch
