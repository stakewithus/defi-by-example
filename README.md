### Install

```shell
# install vyper
virtualenv -p python3 venv
source venv/bin/activate
pip install vyper

cp .env.sample .env
```

### For windows 
```
virtualenv -p python3 venv
venv\Scripts\activate
pip install vyper

```
### To run 
```
venv\Scripts\activate
truffle compile

```



### Test

```shell
source .env

# using infura.io
ganache-cli \
--fork https://mainnet.infura.io/v3/$WEB3_INFURA_PROJECT_ID \
--unlock $WETH_WHALE \
--unlock $DAI_WHALE \
--unlock $USDC_WHALE \
--unlock $USDT_WHALE \
--unlock $WBTC_WHALE \
--networkId 999

# using archivenode.io (limit 10 req / sec)
## fork at block
BLOCK=11597142
ARCHIVE_NODE_URL=https://api.archivenode.io/$ARCHIVE_NODE_API_KEY@$BLOCK
## latest block
ARCHIVE_NODE_URL=https://api.archivenode.io/$ARCHIVE_NODE_API_KEY

ganache-cli \
--fork $ARCHIVE_NODE_URL \
--unlock $WETH_WHALE \
--unlock $DAI_WHALE \
--unlock $USDC_WHALE \
--unlock $USDT_WHALE \
--unlock $WBTC_WHALE \
--networkId 999

npx truffle test --network mainnet_fork test/test-erc20.js
npx truffle test --network mainnet_fork test/test-dydx.js

```
