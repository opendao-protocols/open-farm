
build:
	npx truffle build

# eg: make deploy-masterchef network=kovan
deploy-masterchef: build
	npx truffle exec --network $(network) scripts/deploy-masterchef.js

deploy-masterchef-impl: build
	npx truffle exec --network $(network) scripts/deploy-masterchef-impl.js

masterchef-details:
	npx truffle exec --network $(network) scripts/master-chef-details.js

.PHONY: build deploy-masterchef deploy-masterchef-impl masterchef-details
