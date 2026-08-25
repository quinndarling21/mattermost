PLUGIN_ID ?= com.mattermost.channel-summarizer
PLUGIN_VERSION ?= 0.1.0
BUNDLE_NAME ?= $(PLUGIN_ID)-$(PLUGIN_VERSION).tar.gz

GO ?= go
PLATFORMS ?= linux-amd64 linux-arm64 darwin-amd64 darwin-arm64

.PHONY: all
all: dist

.PHONY: server
server:
	@for platform in $(PLATFORMS); do \
		os=$${platform%-*}; arch=$${platform#*-}; \
		echo "Building server/dist/plugin-$$platform"; \
		cd server && env CGO_ENABLED=0 GOOS=$$os GOARCH=$$arch $(GO) build -trimpath -o dist/plugin-$$platform . && cd ..; \
	done

.PHONY: dist
dist: server
	rm -rf dist
	mkdir -p dist/$(PLUGIN_ID)/server/dist
	cp plugin.json dist/$(PLUGIN_ID)/
	cp server/dist/plugin-* dist/$(PLUGIN_ID)/server/dist/
	cd dist && COPYFILE_DISABLE=1 tar -czf $(BUNDLE_NAME) $(PLUGIN_ID)
	@echo "Bundle: dist/$(BUNDLE_NAME)"

.PHONY: test
test:
	cd server && $(GO) test ./...

.PHONY: check
check:
	cd server && $(GO) vet ./...

.PHONY: clean
clean:
	rm -rf dist server/dist
