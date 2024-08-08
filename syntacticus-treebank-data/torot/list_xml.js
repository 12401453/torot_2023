#!/usr/bin/node

const fs = require('node:fs');

fs.readdirSync(".").filter(x => x.slice(-4) == ".xml").forEach(filename => console.log(filename));
