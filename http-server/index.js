const http = require("http");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const port = args.port || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/home.html") {
    fs.readFile(path.join(__dirname, "home.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.url === "/registration") {
    fs.readFile(path.join(__dirname, "registration.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.url === "/registration.js") {
    fs.readFile(path.join(__dirname, "registration.js"), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(data);
    });
  } else if (req.url === "/project.html") {
    fs.readFile(path.join(__dirname, "project.html"), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
