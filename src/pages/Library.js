import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

function Library(props){

    console.log(Math.floor(Date.now() / 1000))

    const { authorized } = props

    console.log(authorized)

    const [libraryData, setLibraryData] = useState([])

    var search = window.location.search.substring(1);
    const params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')

    useEffect(() => {
        fetch(`${window.location.href}/api/library`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({user: params.user})
        })
            .then(res => res.json())
            .then(json => setLibraryData(json))
    }, [])

    console.log(libraryData)

    const libraryElements = libraryData.map(game => {
        return (
            <Link to={`/game?id=${game.game_name}&user=${params.user}`}>
                <div className="game-marquee" style={{ backgroundImage: `url(${game.url_image_marquee})`}}>
                    <div className="info">
                        <div className="game-title">{game.short_title}</div>
                        <div className="game-year">{game.year}</div>
                    </div>
                </div>
            </Link>
        )
    })

    return (
        <>
            {libraryElements}
        </>
    )
}

export default Library