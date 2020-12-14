# harvest-hack

0x7eb9651a0d8afc3dcec913e889a64a35ef69a94fb82bd84adeb8d738a4208383

```
uni usdt -> eve (18.67M USDT)
uni usdc -> eve (50M USDC)
---------------------------------------------
eve 18.67M USDT   50M USDC
---------------------------------------------

### swap USDT to USDC ###
eve -> curve y swap (17.58M USDT)
       curve y swap -> y usdt (17.58M USDT)
       0 -> curve y swap (17.06M yUSDT)
       curve y swap -> 0 (15.10M yUSDC)
       y usdc -> curve y swap (17.58M USDC)
       curve y swap -> eve (17.58M USDC)
---------------------------------------------
curve y swap +17.58M USDT -17.58M USDC
eve            1.09M USDT   67.58M USDC
---------------------------------------------

### deposit USDC into Harvest ###
0 -> eve (60.18M fUSDC)
     eve -> f usdc (55.13M USDC)
---------------------------------------------
eve   1.09M USDT   12.45M USDC   60M fUSDC
---------------------------------------------

### swap USDC to USDC ###
eve -> curve y swap (17.60M USDC) TODO: where 17.60M USDC from ?
       curve y swap -> y usdc (17.60M USDC)
       0 -> curve y swap (15.12M yUSDC)
       curve y swap -> 0 (17.07M yUSDT)
       y usdt -> curve y swap (17.59M USDT)
       curve y swap -> eve (17.59M USDT)
---------------------------------------------
curve y swap -17.59M USDT   +17.60M USDC
eve          +17.59M USDT   -17.60M USDC
---------------------------------------------

## withdraw fUSDC from Harvest ###
eve -> 0 (60.18M fUSDC)
eve -> f usdc (55.80M USDC)
f usdc -> eve (55.49 USDC)


...

eve -> uni usdc (50.16M USDC)
eve -> uni usdt (18.69M USDT)
eve -> uni usdc ( 0.38M USDC)
uni usdc -> eve (93 WETH ($55455))
eve -> uni usdt (73 WETH ($43,599))








```
