import React, { useEffect, useState } from "react";
import {
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
import { Backdrop, Container, Pagination } from "@mui/material";

function getTextByStatus(status: number) {
  return status === 1 ? "validated" : status === 0 ? "pending" : "invalid";
}

const renderBsv20 = (bsv20: any) => {
  if (typeof bsv20 === "object") {
    const statusText = getTextByStatus(bsv20.status);

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Chip label={"#" + bsv20.index} />
        </Box>

        {typeof bsv20.m === "string" ? (
          <Box><Chip sx={{marginLeft:2}} label={bsv20.m} /></Box>
        ) : (
          <Box>
            <div className={"bsv20"}>
              <Chip className={statusText} label={statusText} />
            </div>
            {bsv20.id ? (
              <div className="bsv20">
                <Chip className={statusText} label="id:" />
                &nbsp;
                <Chip label={bsv20.id} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            {bsv20.tick ? (
              <div className="bsv20">
                <Chip className={statusText} label="tick:" />
                &nbsp;
                <Chip label={bsv20.tick} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            <div className="bsv20">
              <Chip className={statusText} label="op:" />
              &nbsp;
              <Chip label={bsv20.op} size="small" variant="outlined" />
            </div>
            {bsv20.amt ? (
              <div className="bsv20">
                <Chip className={statusText} label="amount:" />
                &nbsp;
                <Chip label={bsv20.amt} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            {bsv20.max ? (
              <div className="bsv20">
                <Chip className={statusText} label="max:" />
                &nbsp;
                <Chip label={bsv20.max} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            {bsv20.lim ? (
              <div className="bsv20">
                <Chip className={statusText} label="lim:" />
                &nbsp;
                <Chip label={bsv20.lim} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            {bsv20.sym ? (
              <div className="bsv20">
                <Chip className={statusText} label="symbol:" />
                &nbsp;
                <Chip label={bsv20.sym} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            {bsv20.dec ? (
              <div className="bsv20">
                <Chip className={statusText} label="decimals:" />
                &nbsp;
                <Chip label={bsv20.dec} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
            {bsv20.owner ? (
              <div className="bsv20">
                <Chip className={statusText} label="owner:" />
                &nbsp;
                <Chip label={bsv20.owner} size="small" variant="outlined" />
              </div>
            ) : (
              <></>
            )}
          </Box>
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

function format(ordJson: any, isOutput: boolean) {
  if (typeof ordJson === "undefined") {
    return "-";
  }

  const json = ordJson?.bsv20?.data?.insc?.json || {};

  const { lim, max } = json;

  return ordJson?.bsv20?.data?.bsv20
    ? Object.assign({}, ordJson.bsv20.data.bsv20, {
        owner: ordJson?.bsv20?.owner,
        lim,
        max,
        index: ordJson.index,
      })
    : isOutput
    ? {
        index: ordJson.index,
        m: "Non-BSV20 output",
      }
    : {
        index: ordJson.index,
        m: "Non-BSV20 input",
      };
}

function HomePage() {
  // Get the userId param from the URL.
  let { network, tx } = useParams();

  const [data, setData] = useState<Array<any>>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [page, setPage] = React.useState(1);
  const [loadingPage, setLoadingPage] = React.useState(false);

  function fetchData(page: number) {
    console.log("fetchData", page);
    setLoadingPage(true)
    fetch(`/api/tx-decode/${network}/1sats/${tx}?page=${page}`)
      .then((res) => res.json())
      .then((details: any) => {
        setPageCount(details.pageCount || 20);
        const tmpData: any[] = [];
        let nRows = Math.max(details.inputs.length, details.outputs.length);

        for (let i = 0; i < nRows; i++) {
          const input = details.inputs[i];
          const output = details.outputs[i];

          tmpData.push({
            input: format(input, false),
            output: format(output, true),
            key: input ? `${input.vin.txid}_${input.vin.vout}` : `${tx}_${i}`,
          });
        }
        setData(tmpData);
      }).finally(() => {
        setLoadingPage(false)
      })
  }

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    fetchData(value);
  };

  useEffect(() => {
    fetchData(1);
  }, []);
  // ...
  return (
    <div className="App">
      <header className="App-header">
        {data.length === 0 ? (
          <Box sx={{ display: "flex" }}>
            <CircularProgress color="inherit"/>
          </Box>
        ) : (
          <Container>
            <Table columns={columns} data={data} caption="BSV20 Details" />
            {pageCount > 0 ? (
              <Pagination
                sx={{ backgroundColor: "white", padding: 1 }}
                count={pageCount}
                boundaryCount={2}
                size="large"
                color="primary"
                shape="rounded"
                page={page}
                onChange={handleChange}
              />
            ) : (
              <></>
            )}

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loadingPage}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          </Container>
        )}
      </header>
    </div>
  );
}

function App() {

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
