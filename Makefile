STAGING_URL=https://digitaltibet.stage.ccnmtl.columbia.edu/
PROD_URL=https://digitaltibet.ccnmtl.columbia.edu/
STAGING_BUCKET=digitaltibet.stage.ccnmtl.columbia.edu
PROD_BUCKET=digitaltibet.ccnmtl.columbia.edu

include *.mk

$(PUBLIC)/js/all.json: $(PUBLIC)/json/all/index.html
	mv $< $@ \
	&& ./checkjson.py
