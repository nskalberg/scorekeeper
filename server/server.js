const express = require("express");
const cors = require("cors");
const levenshtein = require("js-levenshtein")
const sql = require("mssql");
const app = express();
const fs = require('fs');
const filepath = './data/data.json';
const titleDataPath = './data/csvjson.json'
const tokenData = './data/tokens.json'
const userData = './data/users.json'

app.use(cors());
app.use(express.json());

function generateToken(n) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var token = '';
  for(var i = 0; i < n; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

app.post("/login", (req, res) => {
  const {username, password, token} = req.body

  const data =  JSON.parse(fs.readFileSync(userData))
  const tokens = JSON.parse(fs.readFileSync(tokenData))

  console.log(req.body)

  if(token){
    for(i = 0; i < tokens.length; i++){
      if(token == tokens[i].token){
        res.json(tokens[i])
        return;
      }
    }
    res.json({message: "Token invalid"})
    return
  }

  for(i = 0; i < data.length; i++){
    if(data[i].username == username && data[i].password == password){
      const token = generateToken(10)
      tokens.push({
        token: token,
        user: data[i].id
      })
      fs.writeFileSync(tokenData, JSON.stringify(tokens, null, 4));
      res.json({
        id: data[i].id,
        token: token
      })
      return;
    }
  }

  const err = new Error("Invalid credentials")
  err.statusCode = 401
  throw err

})

app.post("/game", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filepath));
  var response = {
    scores: []
  }

  data.map(row => {
    if(row.user.toString() == req.body.user && row.game == req.body.id){
      response.scores.push(row)
    }
  })

  fetch(`http://adb.arcadeitalia.net/service_scraper.php?ajax=query_mame&game_name=${req.body.id}`)
    .then(res => res.json())
    .then(json => {
      json.result.map(game => {
        if(game.game_name == req.body.id){
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
      await fetchData(scoredTitles[i])
    }
      res.json(result)
  }
  compileResult()
})

app.post("/score", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filepath));
  data.push(req.body)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
  res.json({ message: "Score uploaded successfully." });
});

app.listen(8000, () => {
  console.log(`Server is running on port 8000.`);
});