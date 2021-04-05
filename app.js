const express = require('express');
require('./db/mongoose');
var cors = require('cors');
const testRouter = require('./routers/test.router');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1', testRouter);

module.exports = app;
