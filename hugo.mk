HUGO ?= `which hugo`
S3CMD ?= s3cmd
PUBLIC ?= public
DRAFT_FLAGS ?= --buildDrafts --verboseLog=true -v
PROD_FLAGS ?= -s .
S3_FLAGS ?= --acl-public --delete-removed --no-progress --no-mime-magic --guess-mime-type

runserver:
	$(HUGO) $(DRAFT_FLAGS) \
	&& $(HUGO) server --watch $(DRAFT_FLAGS)

deploy-stage:
	rm -rf $(PUBLIC)/*
	$(HUGO) $(PROD_FLAGS) -b '$(STAGING_URL)' \
	&& $(S3CMD) $(S3_FLAGS) sync $(PUBLIC)/* s3://$(STAGING_BUCKET)/

deploy-prod:
	rm -rf $(PUBLIC)/*
	$(HUGO) $(PROD_FLAGS) -b '$(PROD_URL)' \
	&& $(S3CMD) $(S3_FLAGS) sync $(PUBLIC)/* s3://$(PROD_BUCKET)/

.PHONY: runserver deploy-stage deploy-prod
