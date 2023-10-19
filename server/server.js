const express = require("express");
const cors = require("cors");
const levenshtein = require("js-levenshtein")
const app = express();
const fs = require('fs');
const path = require("path");
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

app.post("/authorize", async (req, res) => {
  const {token, user} = req.body
  const tokens = JSON.parse(fs.readFileSync(tokenData))

  for(t = 0; t < tokens.length; t++){
    if(token == tokens[t].token && user == tokens[t].user){
      if(tokens[t].expires > Math.floor(Date.now()/1000)){
        res.status(200)
        res.send({message: "Token valid"})
        return
      }
    }
  }

  res.status(401)
  res.send({message: "Token invalid"})

})

app.delete("/authorize", async (req, res) => {
  const {token, user} = req.body
  const tokens = JSON.parse(fs.readFileSync(tokenData))
  var index, result
  
  console.log(tokens)

  for(t = 0; t < tokens.length; t++){
    if(token == tokens[t].token && user == tokens[t].user){
      index = t
    }
  }
  
  if(tokens.length == 1){
    result = []
  } else {
    result = tokens.splice(index, 1)
  }

  fs.writeFileSync(tokenData, JSON.stringify(result, null, 4));
  res.send("Token deleted")
})

app.post("/login", async (req, res) => {
  const {username, password, token} = req.body

  const data =  JSON.parse(fs.readFileSync(userData))
  const tokens = JSON.parse(fs.readFileSync(tokenData))

  if(token){
    for(i = 0; i < tokens.length; i++){
      if(token == tokens[i].token){
        res.json(tokens[i])
        return;
      }
    }
    res.status(401)
    res.send("Token invalid")
    return
  }

  for(i = 0; i < data.length; i++){
    if(data[i].username == username && data[i].password == password){
      const token = generateToken(10)
      tokens.push({
        token: token,
        user: data[i].id,
        expires: Math.floor((Date.now()/1000)+86400)
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

app.post("/library", async (req, res) => {
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

  async function fetchData(game, index){
    var promise = new Promise((resolve, reject) => {
      fetch(`http://adb.arcadeitalia.net/service_scraper.php?ajax=query_mame&game_name=${game}`)
        .then(res => res.json())
        .then(json => resolve(json))
    })
    let result = await promise
    response[index] = result.result[0]
  }

  async function compileResult(games) {
    for(j = 0; j < games.length; j++){
      await fetchData(games[j], j)
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

app.use(express.static(path.join(__dirname, "..", "build")));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

app.post("/score", (req, res) => {

  const data = JSON.parse(fs.readFileSync(filepath));
  const tokens = JSON.parse(fs.readFileSync(tokenData))

  const { user, token } = req.body

  for(row in tokens){
    console.log(row)
    if(tokens[row].token == token && tokens[row].user == user){
      data.push(req.body)
      fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
      res.json({ message: "Score uploaded successfully." });
      return
    }
  }
  res.status(401)
  res.send({ message: "Not authorized"})
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});