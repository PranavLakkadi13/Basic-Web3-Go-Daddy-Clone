import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const Domain = ({ domain, ethDaddy, provider, id }) => {

  const [Owner, setOwner] = useState(null);
  const [hasSold, setHasSold] = useState(false);

   const getOwner = async () => {
     if (domain.isOwned || hasSold) {
       const Owner = await ethDaddy.ownerOf(id);
       setOwner(Owner);
     }
   };

  const buyHandler = async () => {
    const signer = await provider.getSigner();
    const trx = await ethDaddy
      .connect(signer)
      .Mint(id, { value: domain.cost, gasLimit: 3e7 });
    await trx.wait();

    setHasSold(true);
  }

  useEffect(() => {
    getOwner();
  }, [hasSold]);

  return (
    <div className="card">
      <div className="card__info">
        <h3>
          {domain.isOwned || Owner ? (
            <del>{domain.name}</del>
          ) : (
            <>{domain.name}</>
          )}
        </h3>
        <p>
          {domain.isOwned || Owner ? (
            <>
              <small>
                Owned by:
                <br />
                <span>
                  {Owner && Owner.slice(0, 6) + "..." + Owner.slice(38, 42)}
                </span>
              </small>
            </>
          ) : (
            <>
              <strong>
                {ethers.formatUnits(domain.cost.toString(), "ether")}
              </strong>
              ETH
            </>
          )}
        </p>
      </div>
      {!domain.isOwned && !Owner && (
        <button
          type="button"
          className="card__button"
          onClick={() => buyHandler()}
        >
          Buy It
        </button>
      )}
    </div>
  );
}

export default Domain;