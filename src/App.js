import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Library from "./pages/Library"
import Game from "./pages/Game"
import Search from "./pages/Search"
import Login from "./pages/Login"

function App() {

  const [scoreData, setScoreData] = useState([])
  const [formData, setFormData] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [searchData, setSearchData] = useState([])
  const [authorized, setAuthorized] = useState()

  function logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setAuthorized(false)
    fetch(`${window.location.href}/api/authorize`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: localStorage.user,
        token: localStorage.token
      })
    })
      .then(res => {
        // window.location = "/"
      })
    

  }

  function validateToken(){
    if(localStorage.token && localStorage.user) {
      fetch(`${window.location.href}/api/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: localStorage.token,
          user: localStorage.user
        })
      })
        .then(res => {
          if(res.ok){
            setAuthorized(true)
          } else {
            setAuthorized(false)
          }
        })
    }
  }

  validateToken()

  return (
    <>
      <div className="background"/>
      <div className="main">
        <div className="content">
          <BrowserRouter>
            <div className="nav">

              {authorized && (
                <>
                  <Link className="nav-item" to={`/library?user=${localStorage.user}`}>
                    <div >library</div>
                  </Link>
                  <Link className="nav-item" to={`/search`}>
                    <div>search</div>
                  </Link>
                  <div onClick={logout} className="nav-item">logout</div>
                </>

              )}
              {!authorized && (
                <Link className="nav-item" to={`/login`}>
                  <div >login</div>
                </Link>
              )}
            </div>
          
            <Routes>
              <Route path="/library" element={<Library authorized={authorized} />} />
              <Route path="/search" element={<Search />} />
              <Route path="/game" element={<Game validateToken={validateToken} authorized={authorized} />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
    
  );
}

export default App;
