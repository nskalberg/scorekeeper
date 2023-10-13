import { useEffect, useState } from "react"

function Game() {

    var search = window.location.search.substring(1);
    const params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')  

    const [gameData, setGameData] = useState({})
    const [scoreData, setScoreData] = useState([])
    const [formData, setFormData] = useState({
      user: params.user,
      game: params.id
    })

    function getScoreData() {
      fetch("http://localhost:8000/game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      })
          .then(res => res.json())
          .then(json => {
              setGameData(json.gameData)
              setScoreData(json.scores)
          })
    }

    function handleAddScore(e) {  
      if(e.target.name == "initiate"){
        e.target.style.display = "none"
        e.target.style.height = "0px"
        document.getElementById("add-score").style.height = "100px"
        document.getElementById("add-score-content").style.transform = "scale(1)"
      } else {
        fetch("http://localhost:8000/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
          .then(() => {
            getScoreData()
            document.getElementById("add-score").style.height = "50px"
            document.getElementById("add-score-content").style.transform = "scale(0)"
            document.getElementById("initiateScore").style.display = "flex";
            setTimeout(() => {
              document.getElementById("initiateScore").style.height = "36px";
            }, 500)
          })
      }
    }

    function handleChange(e) {
      setFormData(prevFormData => ({
        ...prevFormData,
        [e.target.name]: e.target.value
      }))
    }

    useEffect(() => {
      getScoreData()
    }, [])

    const scoreTableElements = scoreData.map((row) => {
        return (
          <tr>
            <td>{row.date}</td>
            <td>{row.score}</td>
            <td>{row.location}</td>
            <td>{row.attempt}</td>
          </tr>
        )
      })

    return (
        <>
            <div className="game-marquee" style={{ backgroundImage: `url(${gameData.url_image_marquee})`}}>
                <div className="info">
                    <div className="game-title">{gameData.short_title}</div>
                    <div className="game-year">{gameData.year}</div>
                </div>
            </div>
            <div id="add-score" name="add-score"className="banner add-score short">
              <button id="initiateScore" name="initiate" onClick={handleAddScore} className="add-score-button">add score</button>
              <div id="add-score-content" className="add-score-content">
                <div className="add-score-inputs">
                  <input onChange={handleChange} placeholder="score" className="add-score-game" name="score"></input>
                  <input onChange={handleChange} placeholder="date" className="add-score-game" name="date"></input>
                  <input onChange={handleChange} placeholder="attempt" className="add-score-game" name="attempt"></input>
                </div>
                <button id="finalizeScore" name="finalize" onClick={handleAddScore} className="add-score-button"></button>
              </div>
            </div>
            <div className="banner">
            <div className="high-score">
              <div className="high-score-score">
                100200
              </div>
              <div className="high-score-info">
                ground kontrol
              </div>
            </div>
          </div>
            <table>
            <thead>
              <tr>
                <th>date</th>
                <th>score</th>
                <th>location</th>
                <th>attempt</th>
              </tr>
            </thead>
            <tbody>
              {scoreTableElements}
            </tbody>
          </table>
        </>
    )

}

export default Game