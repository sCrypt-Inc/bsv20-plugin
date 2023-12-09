import * as dotenv from "dotenv";
import express from "express";
import pretty from "express-prettify";
import txRouter from "./tx.js";
import path from "path";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();



const app = express();
app.use(pretty({ query: "pretty" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'build')));



//root path for tx type plugin examples
app.use("/api/tx-decode", txRouter);

app.get('/api/health', function (req, res) {
    console.log('health...')
    res.json({
        status: "ok"
    });
})

app.get('/tx-decode/:network/1sats/:tx', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

let port = process.env.SERVER_PORT || "3333"
app.listen(port);
console.log(`listen on port: ${port}...`)
