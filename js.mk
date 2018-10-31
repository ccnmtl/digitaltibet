# expect JS_FILES to be set from the main Makefile, but default
# to everything in media/js otherwise.
JS_FILES ?= static/js/src static/js/tests

NODE_MODULES ?= ./node_modules
JS_SENTINAL ?= $(NODE_MODULES)/sentinal
ESLINT ?= $(NODE_MODULES)/.bin/eslint

$(JS_SENTINAL): package.json
	rm -rf $(NODE_MODULES) package-lock.json
	npm install
	touch $(JS_SENTINAL)

eslint: $(JS_SENTINAL)
	$(ESLINT) $(JS_FILES)

jstest: $(JS_SENTINAL)
	npm test

.PHONY: eslint jstest
