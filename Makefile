runserver:
	hugo --buildDrafts --verboseLog=true -v
	hugo server --watch --buildDrafts --verboseLog=true -v
