import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Library from "./pages/Library"
import Game from "./pages/Game"

function App() {

  const [scoreData, setScoreData] = useState([])
  const [formData, setFormData] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchData, setSearchData] = useState([])

  // useEffect(() => {
  //   fetch("http://localhost:8000/data")
  //     .then((response) => response.json())
  //     .then((json) => setScoreData(json))
  // }, [])

  function handleChange(e) {

    if(e.target.name == "search-query"){
      setSearchQuery(e.target.value)
      console.log(searchQuery)
      return
    }

    setFormData(prevFormData => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetch("http://localhost:8000/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
  }

  function handleSearch(e){
    e.preventDefault()
    fetch("http://localhost:8000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: searchQuery })
    })
      .then(response => response.json())
      .then(json => {
        setSearchData(json)
      })
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

  const searchElements = searchData.map(result => {
    return (
      <div className="game-marquee" style={{ backgroundImage: `url(${result.marquee})`}}>
        {/* <div className="game-marquee-border"></div> */}
        <div className="info">
          <div className="game-title">{result.Description}</div>
          <div className="game-year">{result.year}</div>
        </div>
      </div>
    )
  })

  return (
    <>
      <div className="background"/>
      <div className="main">
        <div className="content">
          <div className="nav">
            <div className="nav-item">library</div>
            <div className="nav-item">search</div>
            <div className="nav-item">logout</div>
          </div>
          <BrowserRouter>
            <Routes>
              <Route path="/library" element={<Library property="value" />} />
              {/* <Route path="/search" element={<Search />} /> */}
              <Route path="/game" element={<Game />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
          {/* <form className="score-form">
            <input name="game" type="" onChange={handleChange}></input>
            <input name="score" type="" onChange={handleChange}></input>
            <input name="location" type="" onChange={handleChange}></input>
            <input name="attempt" type="" onChange={handleChange}></input>
            <button name="submit-score" onClick={handleSubmit}>submit</button>
          </form>
          }
          {/* <form className="search-form">
            <input onChange={handleChange} name="search-query"></input>
            <button onClick={handleSearch}>search</button>
          </form> */}

        {/* <div className="game-marquee">
          <div className="info">
          </div>
        </div>

          
          */}
          {searchElements}
    </>
    
  );
}

export default App;
