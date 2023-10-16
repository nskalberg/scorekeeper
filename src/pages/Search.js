import { useState, useEffect } from "react"

function Search(){

    const [formData, setFormData] = useState([])
    const [searchData, setSearchData] = useState([])

    function handleChange(e){
        setFormData(prevFormData => ({
            ...prevFormData,
            [e.target.name]: e.target.value
        }))
    }

    function handleSearch(e){
        e.preventDefault()
        fetch("http://localhost:8000/search", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ query: formData.query })
        })
            .then(response => response.json())
            .then(json => {
                setSearchData(json)
            })
    }

    console.log(searchData)

    const searchElements = searchData.map(result => {
        return (
          <div className="game-marquee" style={{ backgroundImage: `url(${result.marquee})`}}>
            <div className="info">
              <div className="game-title">{result.Description}</div>
              <div className="game-year">{result.year}</div>
            </div>
          </div>
        )
      })

    return (
        <>  
            <div className="banner">
                <div className="search-content">
                    <input onChange={handleChange} style={{width: "75%", marginRight: "auto"}} name="query"></input>
                    <div className="search-button" onClick={handleSearch}>search</div>
                </div>
            </div>
            
            {searchElements}
        </>
    )

}

export default Search