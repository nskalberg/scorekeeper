const express = require("express");
const cors = require("cors");
const levenshtein = require("js-levenshtein")
const app = express();
const fs = require('fs');
const filepath = './data/data.json';
const titleDataPath = './data/csvjson.json'

app.use(cors());
app.use(express.json());

app.get("/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filepath));
  res.json(data);
});

app.post("/search", (req, res) => {
  
  const result = []
  const titleData = JSON.parse(fs.readFileSync(titleDataPath));

  const scoredTitles = titleData.map(title => {
    return ({
      ...title,
      score: levenshtein(req.body.query, title.Description.toString().replace(/ *\([^)]*\) */g, ""))
    })
  })

  scoredTitles.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));

  async function compileResult(){
    scoredTitles.slice(0,10).map(title => {
      fetch(`http://adb.arcadeitalia.net/service_scraper.php?ajax=query_mame&game_name=${title.Roms}`)
        .then(response => response.json())
        .then(json => {

          json.result.map(data => {
            result.push({...title, manufacturer: data.manufacturer})
            console.log("result")
          })
        })
    })

  }

  compileResult().then(console.log(result))
  res.json(scoredTitles.slice(0, 10))

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