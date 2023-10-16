import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Library from "./pages/Library"
import Game from "./pages/Game"
import Search from "./pages/Search"
import Login from "./pages/Login"

function App() {

  const [scoreData, setScoreData] = useState([])
  const [formData, setFormData] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchData, setSearchData] = useState([])
  const [loggedIn, setLoggedIn] = useState()

  useEffect(() => {
    if(localStorage.token){
      const token = localStorage.token
      fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: token })
      })
        .then(res => res.json())
        .then(json => {
          if(json.message == "Token invalid"){
            localStorage.removeItem("token")
            return
          }
          //TODO: take user id and put it in localstorage
        })
    }
  }, [])

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
              <Route path="/search" element={<Search />} />
              <Route path="/game" element={<Game />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
    
  );
}

export default App;
