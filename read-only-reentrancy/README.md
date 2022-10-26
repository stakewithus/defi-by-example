```shell
# install
curl -L https://foundry.paradigm.xyz | bash
foundryup

forge install

FORK_URL=https://eth-mainnet.g.alchemy.com/v2/613t3mfjTevdrCwDl28CVvuk6wSIxRPi
forge test -vvvv --fork-url $FORK_URL
```
