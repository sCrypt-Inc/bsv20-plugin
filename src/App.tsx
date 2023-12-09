import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  Routes,
  Route,
} from "react-router-dom";

import "./App.css";
import "./table.css";
import Table from "rc-table";
import type { TableProps } from "rc-table";

import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";

const renderBsv20 = (bsv20: any) => {
  if (typeof bsv20 === "object") {
    return (
      <div>
        <div className="bsv20">
          <span>op:</span>
          {bsv20.op}
        </div>
        <div className="bsv20">
          <span>amt:</span>
          {bsv20.amt}
        </div>
        {bsv20.id ? (
          <div className="bsv20">
            <span>id:</span>
            <span className="txid"> {bsv20.id}</span>
          </div>
        ) : (
          <></>
        )}
        {bsv20.sym ? (
          <div className="bsv20">
            <span>sym:</span>
            {bsv20.sym}
          </div>
        ) : (
          <></>
        )}

        {bsv20.dec ? (
          <div className="bsv20">
            <span>dec:</span>
            {bsv20.dec}
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }
  return <div>-</div>;
};

const columns: TableProps<any>["columns"] = [
  {
    title: "Inputs",
    dataIndex: "input",
    key: "input",
    render: renderBsv20,
    width: 500,
  },
  {
    title: "Outputs",
    dataIndex: "output",
    key: "output",
    render: renderBsv20,
    width: 500,
  },
];

function normalize(bsv20: any) {
  const { op, amt, id, sym, dec } = bsv20;

  if (op === "deploy+mint") {
    return { op, amt, sym, dec };
  }

  return { op, amt, id };
}

function HomePage() {
  // Get the userId param from the URL.
  let { network, tx } = useParams();

  const [data, setData] = useState<Array<any>>([]);

  console.log("network", network);
  console.log("tx", tx);

  useEffect(() => {
    fetch(`/api/tx-decode/${network}/1sats/${tx}`)
      .then((res) => res.json())
      .then((details) => {
        console.log("details", details);

        const tmpData: any[] = [];
        let nRows = Math.max(details.inputs.length, details.outputs.length);

        for (let i = 0; i < nRows; i++) {
          const input = details.inputs[i];
          const output = details.outputs[i];
          tmpData.push({
            input: input?.bsv20?.data?.bsv20
              ? normalize(input.bsv20.data.bsv20)
              : "-",
            output: output?.bsv20?.data?.bsv20
              ? normalize(output.bsv20.data.bsv20)
              : "-",
            key: input ? `${input.vin.txid}_${input.vin.vout}` : `${tx}_${i}`,
          });
        }

        setData(tmpData);
      });
  }, []);
  // ...
  return (
    <div className="App">
      <header className="App-header">
        {data.length === 0 ? (
          <Box sx={{ display: "flex" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table columns={columns} data={data} caption="BSV-20 Details" />
        )}
      </header>
    </div>
  );
}

function App() {
  // let params = useParams();

  // console.log("params", params);
  // useEffect(() => {}, []);
  return (
    <Routes>
      <Route path="tx-decode">
        <Route path=":network/1sats/:tx" element={<HomePage />} />
        <Route path="*" element={<div>Unknow Error</div>} />
      </Route>
    </Routes>
  );
}

export default App;
