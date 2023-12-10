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
import Chip from "@mui/material/Chip";

function getTextByStatus(status: number) {
  return status === 1 ? "validated" : (status === 0 ? "pending" : "invalid")
}

const renderBsv20 = (bsv20: any) => {
  if (typeof bsv20 === "object") {

    const statusText = getTextByStatus(bsv20.status);

    console.log('statusText',statusText, bsv20)
    return (
      <Box>
        <div className="bsv20">
          <Chip className={statusText} label={statusText} />
        </div>
        {bsv20.id ? (
          <div className="bsv20">
            <Chip label='id:' />
            &nbsp;<Chip label={bsv20.id}  size="small" variant="outlined" />
          </div>
        ) : (
          <></>
        )}
        {bsv20.tick ? (
          <div className="bsv20">
            <Chip label='Tick:' />
            &nbsp;<Chip label={bsv20.tick}  size="small" variant="outlined" />
          </div>
        ) : (
          <></>
        )}
        <div className="bsv20">
          <Chip label='Op:' />
          &nbsp;<Chip label={bsv20.op}  size="small" variant="outlined" />
        </div>
        <div className="bsv20">
          <Chip label='Amt:' />
          &nbsp;<Chip label={bsv20.amt}  size="small" variant="outlined" />
        </div>
        {bsv20.sym ? (
          <div className="bsv20">
            <Chip label='Sym:' />
            &nbsp;<Chip label={bsv20.sym}  size="small" variant="outlined" />
          </div>
        ) : (
          <></>
        )}
        {bsv20.dec ? (
          <div className="bsv20">
            <Chip label='Dec:' />
            &nbsp;<Chip label={bsv20.dec}  size="small" variant="outlined" />
          </div>
        ) : (
          <></>
        )}
      </Box>
    );
  }
  return <Box>-</Box>;
};

const columns: TableProps<any>["columns"] = [
  {
    title: "Inputs",
    dataIndex: "input",
    key: "input",
    render: renderBsv20,
    width: 580,
  },
  {
    title: "Outputs",
    dataIndex: "output",
    key: "output",
    render: renderBsv20,
    width: 580,
  },
];


function HomePage() {
  // Get the userId param from the URL.
  let { network, tx } = useParams();

  const [data, setData] = useState<Array<any>>([]);

  useEffect(() => {
    fetch(`/api/tx-decode/${network}/1sats/${tx}`)
      .then((res) => res.json())
      .then((details) => {

        const tmpData: any[] = [];
        let nRows = Math.max(details.inputs.length, details.outputs.length);

        for (let i = 0; i < nRows; i++) {
          const input = details.inputs[i];
          const output = details.outputs[i];
          tmpData.push({
            input: input?.bsv20?.data?.bsv20 ? input.bsv20.data.bsv20 : "-",
            output: output?.bsv20?.data?.bsv20 ? output.bsv20.data.bsv20 : "-",
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
