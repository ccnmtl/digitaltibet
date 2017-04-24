STAGING_URL=https://digitaltibet.stage.ccnmtl.columbia.edu/
PROD_URL=https://digitaltibet.ccnmtl.columbia.edu/
STAGING_BUCKET=digitaltibet.stage.ccnmtl.columbia.edu
PROD_BUCKET=digitaltibet.ccnmtl.columbia.edu
INTERMEDIATE_STEPS ?= make $(PUBLIC)/js/all.json
HUGO=/usr/local/bin/hugo-0.19

include *.mk

$(PUBLIC)/js/all.json:
	curl http://localhost:1313/json/all/ > public/js/all.json
	./checkjson.py
