const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBandServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//ADD GET players API
app.get("/players", async (request, response) => {
  const getBooksQuery = `
        SELECT 
            * 
        FROM 
            cricket_team 
    `;

  const booksArray = await db.all(getBooksQuery);
  let newBookArray = [];

  for (let bookObj of booksArray) {
    newBookArray.push(convertDbObjectToResponseObject(bookObj));
  }

  response.send(newBookArray);
});

//ADD CREATE player API

app.post("/players/", async (request, response) => {
  const playerData = request.body;
  const newPlayerData = {
    player_name: playerData.playerName,
    jersey_number: playerData.jerseyNumber,
    role: playerData.role,
  };
  const addPlayerQuery = `
      INSERT INTO
          cricket_team (player_name, jersey_number, role)
      VALUES
          (
              "${newPlayerData.player_name}",
              "${newPlayerData.jersey_number}",
              "${newPlayerData.role}"
          )
    `;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//ADD GET Player API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId}
    `;
  const playerArray = await db.get(getPlayerQuery);
  const player = convertDbObjectToResponseObject(playerArray);
  response.send(player);
});

//ADD UPDATE player API

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerData = request.body;
  const { playerName, jerseyNumber, role } = playerData;

  const updatePlayerQuery = `
        UPDATE 
            cricket_team
        SET 
            player_name = "${playerName}",
            jersey_number = "${jerseyNumber}",
            role = "${role}"
             
        WHERE 
            player_id = ${playerId}
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//ADD DELETE player API

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDeleteQuery = `
        DELETE FROM 
            cricket_team 
        WHERE 
            player_id =  ${playerId}
    `;
  await db.run(playerDeleteQuery);
  response.send("Player Removed");
});

module.exports = app;
