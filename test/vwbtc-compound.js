'use strict'

const {ethers} = require('hardhat')
const {shouldBehaveLikePool} = require('./behavior/vesper-pool')
const {shouldBehaveLikeStrategy} = require('./behavior/compound-strategy')
const {setupVPool} = require('./utils/setupHelper')

describe('pWBTC Pool with Compound strategy', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners()

    await setupVPool(this, {
      pool: 'PWBTC',
      strategy: 'CompoundStrategyWBTC',
      feeCollector: this.accounts[9],
      strategyType: 'compound',
    })

    this.newStrategy = 'CompoundStrategyWBTC'
  })

  shouldBehaveLikePool('PWBTC', 'WBTC', 'cWTBC')
  shouldBehaveLikeStrategy('PWBTC', 'WBTC')
})
