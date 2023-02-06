const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDb();

//API 1

app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM player_details`;
  const data = await db.all(query);
  let list = [];
  for (let i of data) {
    list.push({
      playerId: i.player_id,
      playerName: i.player_name,
    });
  }
  response.send(list);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM player_details WHERE player_id=${playerId}`;
  const data = await db.all(query);
  response.send({
    playerId: data[0].player_id,
    playerName: data[0].player_name,
  });
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { player_name } = request.body;
  const query = `UPDATE player_details 
      SET 
      player_name='${player_name}' 
      WHERE player_id=${playerId}`;
  await db.run(query);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `SELECT * FROM match_details WHERE match_id=${matchId}`;
  const data = await db.get(query);
  console.log(data);
  response.send({
    matchId: data.match_id,
    match: data.match,
    year: data.year,
  });
});

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT match_id AS matchId,match,year FROM player_match_score
         NATURAL JOIN match_details WHERE player_id=${playerId}`;
  const data = await db.all(query);
  response.send(data);
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `SELECT player_id AS playerId,player_name AS playerName FROM player_match_score
         NATURAL JOIN player_details WHERE match_id=${matchId}`;
  const data = await db.all(query);
  response.send(data);
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const data = db.get(query);
  response.send(data);
});
module.exports = app;
