#!/usr/bin/env node

const client = require('../index.js')
const argvs = process.argv;
client.connectDB(argvs[2])