import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import Token from "../abis/Token.json";
import EthSwap from "../abis/EthSwap.json";
import Main from './Main';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenContract, setTokenContract] = useState(null);
  const [ethSwapContract, setEthSwapContract] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadWeb3 () {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async function loadBlockchainData () {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    const _ethBalance = await web3.eth.getBalance(accounts[0]);
    setEthBalance(_ethBalance);

    // Load Token Contract
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];
    if (tokenData) {
      const _tokenContract = new web3.eth.Contract(Token.abi, tokenData.address);
      setTokenContract(_tokenContract);
      let _tokenBalance = await _tokenContract.methods.balanceOf(accounts[0]).call();
      setTokenBalance(_tokenBalance.toString());
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    // Load EthSwap Contract
    const ethSwapData = EthSwap.networks[networkId];
    if (ethSwapData) {
      const _ethSwapContract = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);
      setEthSwapContract(_ethSwapContract);
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }

    setLoading(false);
  }

  const buyTokens = async (etherAmount) => {
    setLoading(true);
    ethSwapContract.methods.buyTokens().send({ value: etherAmount, from: account }).on('transactionHash', hash => {
      setLoading(false)
    })
  }

  const sellTokens = async (tokenAmount) => {
    setLoading(true);
    tokenContract.methods.approve(ethSwapContract.address, tokenAmount).send({
      from: account
    }).on('transactionHash', hash => {
      ethSwapContract.methods.sellTokens(tokenAmount).send({
        from: account
      }).on('transactionHash', hash => {
        setLoading(false)
      })
    })
  }
  

  useEffect(() => {
    (async function () {
      await loadWeb3();
      await loadBlockchainData()
    })()
  }, [])

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          EthSwap
        </a>

        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-secondary">
              <small id="account">{account}</small>
            </small>

            { account
              ? <img
                className="ml-2"
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(account, 30).toString()}`}
                alt=""
              />
              : <span></span>
            }

          </li>
        </ul>
      </nav>
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <Main loading={loading} ethBalance={ethBalance} tokenBalance={tokenBalance} buyTokens={buyTokens} sellTokens={sellTokens}/>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
