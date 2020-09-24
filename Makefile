
build:
	npx truffle build

# eg: make deploy-masterchef network=kovan
deploy-masterchef: build
	npx truffle exec --network $(network) scripts/deploy-masterchef.js

.PHONY: build deploy-masterchef
