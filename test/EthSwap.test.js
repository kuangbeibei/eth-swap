/* eslint-disable no-undef */
const Token = artifacts.require('Token');
const EthSwap = artifacts.require("EthSwap");

require('chai').use(require('chai-as-promised')).should();

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap;
    before(async () => {
        token = await Token.new();
        ethSwap = await EthSwap.new(token.address);
        await token.transfer(ethSwap.address, tokens('1000000'));
    })

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name();
            assert.equal(name, 'DApp Token');
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name();
            assert.equal(name, 'EthSwap Instanct Exchange');
        })
    })

    describe('transfer tokens to ethSwap', async () => {
        it('ethSwap has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address);
            assert.equal(balance.toString(), tokens('1000000'));
        })
    })

    describe('buy tokens', async () => {
        let result;
        before(async () => {
            result = await ethSwap.buyTokens({ // 在测试的时候，这里有传参数，但是EthSwap.sol中的buyTokens并没有，这里是模拟blockchain传入的参数
                from: investor, // 谁（account）调用buyTokens，该account的eth减少，但是Dapp Tokens通过buyTokens方法内部的transfer方法而增加
                // from在这里指buyTokens里面的msg.sender
                value: tokens('1')
            })
        })
        it('Allows user to instantly purchase tokens from EthSwap for a fixed price', async () => {
            // check investor balance after purchase
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(), tokens('100'));

            // check ethSwap balance after purchase
            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens('999900'));

            // check ethSwap ethereum balance as for eth unit
            let ethSwapEthBalance = await web3.eth.getBalance(ethSwap.address);
            assert.equal(ethSwapEthBalance.toString(), tokens('1'))

            // check logs to ensure event was emitted with correct data
            let event = result.logs[0].args;
            assert.equal(event.account, investor);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100'));
            assert.equal(event.rate.toString(), '100');
        })
    })

    describe('sell tokens', async () => {
        let result;
        before(async () => {
            await token.approve(ethSwap.address, tokens('100'), {
                from: investor
            })
            result = await ethSwap.sellTokens(tokens('100'), {
                from: investor
            })
        })

        it('Allows user to instantly sell tokens to EthSwap for a fixed price', async () => {
            let investorBalance = await token.balanceOf(investor);
            assert.equal(investorBalance.toString(), tokens('0'));

            // check ethSwap balance after user sell tokens
            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens('1000000'));

            // check ethSwap ethereum balance as for eth unit
            let ethSwapEthBalance = await web3.eth.getBalance(ethSwap.address);
            assert.equal(ethSwapEthBalance.toString(), tokens('0'))


            // check logs to ensure event was emitted with correct data
            let event = result.logs[0].args;
            assert.equal(event.account, investor);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens('100'));
            assert.equal(event.rate.toString(), '100');

            // FAILURE: investor can't sell more tokens than they have
            await ethSwap.sellTokens(tokens('500'), {
                from: investor
            }).should.be.rejected
        })
    })
})