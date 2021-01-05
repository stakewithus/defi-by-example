const BN = require("bn.js");

function sendEther(web3, from, to, amount) {
  return web3.eth.sendTransaction({
    from,
    to,
    value: web3.utils.toWei(amount.toString(), "ether"),
  });
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function cast(x) {
  if (x instanceof BN) {
    return x;
  }
  return new BN(x);
}

function eq(x, y) {
  x = cast(x);
  y = cast(y);
  return x.eq(y);
}

function pow(x, y) {
  x = cast(x);
  y = cast(y);
  return x.pow(y);
}

function frac(x, n, d) {
  x = cast(x);
  n = cast(n);
  d = cast(d);
  return x.mul(n).div(d);
}

module.exports = {
  sendEther,
  ZERO_ADDRESS,
  eq,
  pow,
  frac,
};
