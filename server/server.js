const express = require("express");
const cors = require("cors");
const levenshtein = require("js-levenshtein")
const sql = require("mssql");
const app = express();
const fs = require('fs');
const filepath = './data/data.json';
const titleDataPath = './data/csvjson.json'

app.use(cors());
app.use(express.json());

const config = {
  user: 'nskalberg', // better stored in an app setting such as process.env.DB_USER
  password: 'Pps713504!', // better stored in an app setting such as process.env.DB_PASSWORD
  server: 'nskalberg.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
  port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
  database: 'scorekeeper', // better stored in an app setting such as process.env.DB_NAME
  authentication: {
      type: 'default'
  },
  options: {
      encrypt: true
  }
}

console.log("Starting...");
connectAndQuery();

async function connectAndQuery() {
    try {
        var poolConnection = await sql.connect(config);

        console.log("Reading rows from the Table...");
        var resultSet = await poolConnection.request().query(`CREATE TABLE Scores (player int, score int)`);

        console.log(resultSet)

        // close connection only when we're certain application is finished
        poolConnection.close();
    } catch (err) {
        console.error(err.message);
    }
}

app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filepath));
  res.json(data);
});

app.post("/game", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filepath));
  var response = {
    scores: []
  }

  console.log(req.body)
  data.map(row => {
    if(row.user.toString() == req.body.user && row.game == req.body.id){
      response.scores.push(row)
    }
  })

  fetch(`http://adb.arcadeitalia.net/service_scraper.php?ajax=query_mame&game_name=${req.body.id}`)
    .then(res => res.json())
    .then(json => {
      json.result.map(game => {
        console.log(game)
        if(game.game_name == req.body.id){
          console.log("IM here")
          response.gameData = game
          res.json(response)
        }
      })
    })

})

app.post("/library", (req, res) => {
  var result = []
  var response = []

  const data = JSON.parse(fs.readFileSync(filepath))
  data.map(row => {
    if(row.user == req.body.user){
      if(!result.includes(row.game)){
        result.push(row.game)
      }
    }
  })

  async function getGameData(game){
      return fetch(`http://adb.arcadeitalia.net/service_scraper.php?ajax=query_mame&game_name=${game}`)
        .then(res => res.json())
        .then(json => {
          json.result.map(gameData => {
            if(gameData.game_name == game){
              response.push(gameData)
            }
          })
        })
  }

  async function compileResult(games) {
    for(i = 0; i < games.length; i++){
      await getGameData(games[i])
    }
    res.json(response)
  }

  compileResult(result)

})

app.post("/search", (req, res) => {
  
  const result = []
  const titleData = JSON.parse(fs.readFileSync(titleDataPath));

  const scoredTitles = titleData.map(title => {
    return ({
      ...title,
      score: levenshtein(req.body.query, title.Description.toString().replace(/ *\([^)]*\) */g, ""))
    })
  })

  scoredTitles.sort((a, b) => parseFloat(a.score) - parseFloat(b.score))

  async function fetchData(title){
    return fetch(`http://adb.arcadeitalia.net/service_scraper.php?ajax=query_mame&game_name=${title.Roms}`)
      .then(response => response.json())
      .then(json => {
        json.result.map(data => {
          if(data.game_name = title.Roms && data.url_image_marquee != ""){
            result.push({
              ...title,
              manufacturer: data.manufacturer,
              marquee: data.url_image_marquee,
              year: data.year
            })
          }
        })
      })
  }

  async function compileResult(){
    for(i = 0; i < 10; i++){
      console.log(scoredTitles[i])
      await fetchData(scoredTitles[i])
    }
      res.json(result)
  }
  compileResult()
})

app.post("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filepath));
  data.push(req.body)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
  res.json({ message: "Hello from server!" });
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});