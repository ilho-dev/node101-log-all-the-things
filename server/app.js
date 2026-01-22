const express = require('express');
const fs = require('fs');
const app = express();
if (!fs.existsSync("log.csv")) {
  fs.writeFile("log.csv", "Agent,Time,Method,Resource,Version,Status\n", (err) => {
    if (err) {
      console.log(err);
    }
  });
}


app.use((req, res, next) => {
const time = new Date().toISOString();

const line = req.get("user-agent").replace(/,/g, " ") + "," + time + "," + req.method + "," + req.url + "," + "HTTP/" + req.httpVersion + "," + 200 + "\n";
console.log(line.trim());
fs.appendFile("log.csv", line, (err) => {if (err) {
    console.log(err);
  }});
    next();

});

app.get('/', (req, res) => {
    res.send("ok");

});

app.get("/logs", (req, res) => {
  fs.readFile("log.csv", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Could not read log.csv" });
      return;
    }

    const lines = data.split("\n").filter(Boolean);
    if (lines.length === 0) {
      res.json([]);
      return;
    }

    const headers = lines[0].split(",");

    const logs = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = values[i];
      }
      return obj;
    });

    res.json(logs);
  });
});



module.exports = app;
