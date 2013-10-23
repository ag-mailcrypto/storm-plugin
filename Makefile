VERSION=`git describe --always --tag`

deploy:
	cd package && zip -r ../storm-$(VERSION).xpi * -x '*debug.js'
