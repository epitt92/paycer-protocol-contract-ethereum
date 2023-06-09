'use strict'

const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
const {shouldBehaveLikeStrategy} = require('./behavior/maker-strategy')
const {deposit} = require('./utils/poolOps')
const {setupVPool} = require('./utils/setupHelper')
const {expect} = require('chai')

describe('PETH Pool', function () {
  let vDai, dai, vEth, strategy, weth, user1
  const vDaiPoolObj = {}

  beforeEach(async function () {
    this.accounts = await ethers.getSigners()
    vDaiPoolObj.accounts = this.accounts
    ;[, user1] = this.accounts
    await setupVPool(vDaiPoolObj, {
      pool: 'pDAI',
      strategy: 'CompoundStrategyDAI',
      strategyType: 'compound',
      feeCollector: this.accounts[9],
    })
    vDai = vDaiPoolObj.pool
    dai = await vDaiPoolObj.collateralToken
    await deposit(vDai, dai, 200, user1)
    await vDai.rebalance()
    await setupVPool(this, {
      pool: 'PETH',
      strategy: 'VesperMakerStrategyETH',
      collateralManager: 'CollateralManager',
      feeCollector: this.accounts[9],
      strategyType: 'vesperMaker',
      underlayStrategy: 'compound',
      vPool: vDai,
      contracts: {controller: vDaiPoolObj.controller},
    })
    vDai = this.providerToken
    this.newStrategy = 'AaveV2StrategyETH'
    vEth = this.pool
    strategy = this.strategy
    weth = this.collateralToken
  })

  shouldBehaveLikePool('pETH', 'WETH', 'vDai')

  shouldBehaveLikeStrategy('pETH', 'WETH', 'vDai')

  it('Should not allow to sweep vToken from strategy', async function () {
    await deposit(vEth, weth, 10, user1)
    await vEth.rebalance()
    let tx = strategy.sweepErc20(vDai.address)
    await expect(tx).to.be.revertedWith('not-allowed-to-sweep')
    tx = vEth.sweepErc20(vDai.address)
    await expect(tx).to.be.revertedWith('Not allowed to sweep')
  })

  it('Should not allow non keeper to rebalance or sweep', async function () {
    await deposit(vEth, weth, 10, user1)
    let tx =  strategy.connect(this.accounts[1]).rebalance()
    await expect(tx).to.be.revertedWith('caller-is-not-keeper')
    tx = strategy.connect(this.accounts[1]).sweepErc20(vDai.address)
    await expect(tx).to.be.revertedWith('caller-is-not-keeper')
  })
})
