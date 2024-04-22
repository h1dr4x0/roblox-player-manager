const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const port = 3000;

const servers = {};
const kickRequests = {};

app.get("/servers", (req, res) => {
  return res.json(servers);
});

app.post("/servers/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ error: "No server id provided." });
  const server = req.body;
  if (!server) return res.json({ error: "No server provided." });
  servers[id] = server;
  return res.json({
    success: true,
    message: "Server has been added/updated successfully.",
  });
});

app.post("/servers/:id/disconnect", (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ error: "No server id provided." });
  if (!servers[id]) return res.json({ error: "Server not found." });
  if (servers[id]) {
    delete servers[id];
    delete kickRequests[id];
  }
  return res.json({
    success: true,
    message: "Server has been disconnected successfully.",
  });
});

app.get("/servers/:id/players", (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ error: "No server id provided." });
  const server = servers[id];
  if (!server) return res.json({ error: "Server not found." });
  return res.json(server);
});

app.get("/servers/:id/players/:username/kick", (req, res) => {
  const id = req.params.id;
  const username = req.params.username;
  if (!id) return res.json({ error: "No server id provided." });
  if (!servers[id]) return res.json({ error: "Server not found." });
  if (!username) return res.json({ error: "No username provided." });
  const reason = req.body?.reason || "No reason provided.";
  if (!kickRequests[id]) {
    kickRequests[id] = {};
  }

  kickRequests[id][username] = reason;
  return res.json({
    success: true,
    message: "Kick request has been sent successfully.",
  });
});

app.post("/servers/:id/players/:username/kick/accept", (req, res) => {
  const id = req.params.id;
  const username = req.params.username;
  if (!id) return res.json({ error: "No server id provided." });
  if (!servers[id]) return res.json({ error: "Server not found." });
  if (!username) return res.json({ error: "No username provided." });
  if (kickRequests[id]) {
    delete kickRequests[id][username];
  }
  return res.json({
    success: true,
    message: "Player has been kicked successfully.",
  });
});

app.get("/servers/:id/kick-requests", (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ error: "No server id provided." });
  if (!servers[id]) return res.json({ error: "Server not found." });
  const requests = kickRequests[id];
  if (!requests) return res.json({ error: "No kick requests found." });
  return res.json(requests);
});

app.get("/servers/:id", (req, res) => {
  const id = req.params.id;
  if (!id) return res.json({ error: "No server id provided." });
  const server = servers[id];
  if (!server) return res.json({ error: "Server not found." });
  return res.json(server);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
