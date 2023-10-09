import logo from './logo.svg';
import './App.css';
import { useState } from "react";

function App() {

  const [scoreData, setScoreData] = useState([{game:"galaga", score:"100000", location:"ground kontrol", attempt: 4}])
  const [formData, setFormData] = useState({})

  

  function handleChange(e) {
    setFormData(prevFormData => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }))
    console.log(formData)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setScoreData(prevScoreData => ([
      ...prevScoreData,
      formData
    ]))
  }

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
    <div className="main">
      <div className="content">
        <form className="score-form">
          <input name="game" type="" onChange={handleChange}></input>
          <input name="score" type="" onChange={handleChange}></input>
          <input name="location" type="" onChange={handleChange}></input>
          <input name="attempt" type="" onChange={handleChange}></input>
          <button name="submit-score" onClick={handleSubmit}>submit</button>
        </form>
        <table name="score-table">
          {scoreTableElements}
        </table>
      </div>
    </div>
  );
}

export default App;
