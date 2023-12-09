import { Router } from "express";
import fetch from 'cross-fetch';
import { fetchBSV20ByOutpoint } from "./bsv20utils.js";
const router = Router();


/*
An example of returning a json dummy order based on a tx. In reality some form integration
to some other service utilising tx hash

Example http://localhost:3000/tx-decode/main/order/0000000000000000017480fc53fbcd60107d0d5e35d2ec2ed6d11ed484087b11
*/
router.get("/:network/1sats/:tx", async function (req, res, next) {
  const tx = req.params.tx;
  const network = req.params.network;
  //Select the correct api url based on network
  const wocApiUrl = process.env[`${network}_WOC_API_URL`.toUpperCase()];


  try {
    //Fetch block from information using hash
    const response = await fetch(`${wocApiUrl}/tx/hash/${tx}`);
    const data = await response.json();

    const inputs = await Promise.all(data.vin.map(async vin => {
      const bsv20 = await fetchBSV20ByOutpoint(`${vin.txid}_${vin.vout}`, network);
      return {
        bsv20,
        vin
      }
    }));

    const outputs = await Promise.all(data.vout.map(async (vout, i) => {
      const bsv20 = await fetchBSV20ByOutpoint(`${tx}_${i}`, network);
      return {
        bsv20,
        vout,
      }
    }));

    //Render ascii output of the hex using the neon light themed template
    res.json({
      inputs,
      outputs
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: "Failed to render page",
    });
  }
  
});

//Returns the html template consisting of the html, css
export const get1SatsTemplate = (data) => `
    <style>
      

      html, body {
        height: 100%;
        margin: 0;
      }

      .container {
        margin: 0 auto;
      }

      body {
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        font-family: -apple-system, 
          BlinkMacSystemFont, 
          "Segoe UI", 
          Roboto, 
          Oxygen-Sans, 
          Ubuntu, 
          Cantarell, 
          "Helvetica Neue", 
          sans-serif;
        font-size: 1rem;
      }

      h1 {
        font-weight: 400;
        text-align: center;
        text-transform: uppercase;
      }
      </style>
      <div class="container">
         <h1 class="neon">${data}</h1>
      </div>
`;


export default router;
