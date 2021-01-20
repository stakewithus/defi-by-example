# harvest-hack

0x7eb9651a0d8afc3dcec913e889a64a35ef69a94fb82bd84adeb8d738a4208383

- [x] uniswap swap
  - [x] get reserves (Tether WETH)
  - [x] swap (flash loan)
- [x] dydx solo margin
- [x] curve
  - [x] get virtual price
  - [x] calc_withdraw_one_coin
  - [x] exchange_underlying
- [ ] farm vault

0x6a3c14a9cdcc4844436254dfba4ab825284ed95f6a6f35954d9f583534841d4f

- [ ] aave loan
- [ ] dydx loan

### Get WETH

```
weth -> eve (20 ETH)
---------------------------------------------
eve   20 WETH
---------------------------------------------
```

### Flash loan from Uni?

```
uni usdt -> eve (18.67M USDT)
uni usdc -> eve (50M USDC)
---------------------------------------------
eve    18.67M USDT   50M USDC   20 WETH
---------------------------------------------
```

### swap USDT to USDC on Curve

```
eve -> curve y swap (17.58M USDT)
curve y swap -> y usdt (17.58M USDT)
0 -> curve y swap (17.06M yUSDT)
curve y swap -> 0 (15.10M yUSDC)
y usdc -> curve y swap (17.58M USDC)
curve y swap -> eve (17.58M USDC)
---------------------------------------------
curve y swap +17.58M USDT  -17.58M USDC
eve            1.09M USDT   67.58M USDC   20 WETH
---------------------------------------------
```

### deposit USDC into Harvest

```
0 -> eve (60.18M fUSDC)
eve -> f usdc (55.13M USDC)
---------------------------------------------
eve   1.09M USDT   12.45M USDC   60.18M fUSDC   20 WETH
---------------------------------------------
```

### swap USDC to USDT on Curve

```
eve -> curve y swap (17.60M USDC) TODO: where 17.60M USDC from ?
curve y swap -> y usdc (17.60M USDC)
0 -> curve y swap (15.12M yUSDC)
curve y swap -> 0 (17.07M yUSDT)
y usdt -> curve y swap (17.59M USDT)
curve y swap -> eve (17.59M USDT)
---------------------------------------------
curve y swap -17.59M USDT   +17.60M USDC
eve          +17.59M USDT   -17.60M USDC   60.18M fUSDC   20 WETH
---------------------------------------------
```

## withdraw USDC from Harvest

```
eve -> 0 (60.18M fUSDC)
f usdc -> eve (55.49 USDC)
---------------------------------------------
eve   ? USDT   +55.48M USDC   0 fUSDC   20 WETH?
---------------------------------------------
```

### repay loan

```
eve -> uni usdc (50.16M USDC)
eve -> uni usdt (18.69M USDT)
eve -> uni usdc ( 0.38M USDC)
uni usdc -> eve (93 WETH ($55455))
eve -> uni usdt (73 WETH ($43,599))
```

---

# math

```
# shares
f / S = d / B
f = d * S / B
```
