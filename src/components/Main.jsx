import React, {useState} from 'react';
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";

function Main({loading, ethBalance, tokenBalance, buyTokens, sellTokens}) {
    const [operation, setOperation] = useState('buy');

    if(loading) {
        return <p id="loader" className="text-center">Loading...</p>
      } else {
        return <div id="content" className="mt-3">

        <div className="d-flex justify-content-between mb-3">
          <button
              className="btn btn-light"
              onClick={(event) => {
                setOperation('buy')
              }}
            >
            Buy
          </button>
          <span className="text-muted">&lt; &nbsp; &gt;</span>
          <button
              className="btn btn-light"
              onClick={(event) => {
                setOperation('sell')
              }}
            >
            Sell
          </button>
        </div>

        <div className="card mb-4" >

          <div className="card-body">

            {
                operation === 'buy' ?  <BuyForm
                    ethBalance={ethBalance}
                    tokenBalance={tokenBalance}
                    buyTokens={buyTokens}
                /> : <SellForm
                    ethBalance={ethBalance}
                    tokenBalance={tokenBalance}
                    sellTokens={sellTokens}
                />
            }

          </div>

        </div>

      </div>
      }
}

export default Main;