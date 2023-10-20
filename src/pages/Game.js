import { useEffect, useState } from "react"
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function Game(props) {
    
    const date = new Date()
    const today = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

    const {authorized, validateToken} = props

    var search = window.location.search.substring(1);
    const params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')  

    const [gameData, setGameData] = useState({})
    const [scoreData, setScoreData] = useState([])
    const [formData, setFormData] = useState({
      user: params.user,
      game: params.id,
      date: today
    })
    const [chartData, setChartData] = useState([])

    useEffect(() => {
      let result = []
      var scoreDataSorted = scoreData
      scoreDataSorted.sort((a, b) => Date.parse(a.date) - Date.parse(b.date) || parseInt(b.score) - parseInt(a.score))
      for(var i = 0; i < scoreDataSorted.length; i++){
        if(!result[0] || result[result.length-1][0] !== Date.parse(scoreDataSorted[i].date)){
          
          result.push([Date.parse(scoreDataSorted[i].date), parseInt(scoreDataSorted[i].score)])
        }
      }
      setChartData(prevChartData => ({
        ...prevChartData,
        chronological: result
      }))
      var runningHighScore = 0
      var runningHighScoreArray = []
      result.map(score => {
        if(score[1] > runningHighScore){
          runningHighScore = score[1]
        }
        runningHighScoreArray.push([score[0], runningHighScore])
      })
      setChartData(prevChartData => ({
        ...prevChartData,
        runningMax: runningHighScoreArray
      }))
    }, [scoreData])

    function getScoreData() {
      fetch(`${window.location.origin}/api/game`, {
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
        document.getElementById("add-score-content").style.transform = "scale(1)"
        document.getElementById("add-score").style.height = "auto"
      } else {
        fetch(`${window.location.origin}/api/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            token: localStorage.token
          })
        })
          .then(() => {
            setFormData(prevFormData => ({
              ...prevFormData,
              score: "",
              attempt: "",
              location: "",
              date: today
            }))
            getScoreData()
            document.getElementById("add-score").style.height = "50px"
            document.getElementById("add-score-content").style.transform = "scale(0)"
            
            setTimeout(() => {
              document.getElementById("initiateScore").style.display = "flex";
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

    console.log(scoreData)

    function averageScore() {
      let result = 0
      scoreData.map(data => {
        result += parseInt(data.score)
      })
      result = result/scoreData.length
      return Math.floor(result)
    }

    const highScore = () => Math.max(...scoreData.map(data => parseInt(data.score)))

    const scoreTableElements = scoreData.slice().reverse().map((row) => {
        return (
          <tr>
            <td>{row.date}</td>
            <td>{row.score}</td>
            <td>{row.location}</td>
            <td>{row.attempt}</td>
          </tr>
        )
      })

      const options = {
        chart: {
          type: 'area',
          backgroundColor: 'transparent'
        },
        title: {
          text: 'score history',
          style: {
            color: "#e71d36",
            fontSize: "12px"
          }
        },
        yAxis: {
          title: {
              text: null
          },
          labels: {
            enabled: false
          },
          gridLineColor: "#1a1a1a"
        },
        xAxis: {
          labels: {
            enabled: false
          }
        },
        legend: {
          enabled: false
        },
        series: [
          { 
            fillColor: {
              linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
              },
              stops: [
                  [0, 'white'],
                  [1, "transparent"]
              ]
          },
            lineWidth: 3,
            color: "white",
            data: chartData.runningMax,
            shadow: true
          },
          {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                  [0, '#e71d36'],
                  [1, "transparent"]
              ]
            },
            lineWidth: 3,
            color: "#e71d36",
            data: chartData.chronological,
            shadow: true
          }
        ]
      };

    return (
        <>
            <div className="game-marquee" style={{ backgroundImage: `url(${gameData.url_image_marquee})`}}>
                <div className="info">
                    <div className="game-title">{gameData.short_title}</div>
                    <div className="game-year">{gameData.year}</div>
                </div>
            </div>
            {authorized && (
              <div id="add-score" name="add-score"className="banner add-score short">
                <button id="initiateScore" name="initiate" onClick={handleAddScore} className="add-score-button">add score</button>
                <div id="add-score-content" className="add-score-content">
                  <div className="add-score-inputs">
                    <input onChange={handleChange} value={formData.score} placeholder="score" className="add-score-game" name="score"></input>
                    <input onChange={handleChange} value={formData.location} placeholder="location" className="add-score-game" name="location"></input>
                    <input onChange={handleChange} value={formData.attempt} placeholder="attempt" className="add-score-game" name="attempt"></input>
                    <input onChange={handleChange} value={formData.date} placeholder="date" className="add-score-game" name="date"></input>
                  </div>
                  <button id="finalizeScore" name="finalize" onClick={handleAddScore} className="add-score-button">add score</button>
                </div>
              </div>
            )}
            <div className="banner-group">
              <div className="banner half">
                <div className="high-score">
                <div className="maintext">{highScore()}</div>
                  <div className="subtext">
                    high score
                  </div>
                </div>
              </div>
              <div className="banner half">
                <div className="average-score">
                  <div className="maintext">{averageScore()}</div>
                  <div className="subtext">
                    average
                  </div>
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
          <div className="window chart">
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </>
    )

}

export default Game