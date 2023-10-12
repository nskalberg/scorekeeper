import { useEffect, useState } from "react"

function Game() {
    const [gameData, setGameData] = useState({})
    const [scoreData, setScoreData] = useState([])

    var search = window.location.search.substring(1);
    const params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')

    useEffect(() => {
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
    }, [])

    const scoreTableElements = scoreData.map((row) => {
        return (
          <tr>
            <td>{row.game}</td>
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
            <div className="banner short"></div>
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
          </table> */
        </>
    )

}

export default Game