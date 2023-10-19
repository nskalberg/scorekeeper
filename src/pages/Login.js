import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login(){

    const navigate = useNavigate()

    const [formData, setFormData] = useState({})
    const [loginError, setLoginError] = useState(false)

    function handleLogin() {
        fetch(`${window.location.origin}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(res => {
                if (res.ok) {
                    setLoginError(false)
                    return res.json()
                } else {
                    throw new Error
                }
            })
            .then(json => {
                console.log(json)
                localStorage.token = json.token
                localStorage.user = json.id
                if(!localStorage.redirect){
                    window.location.reload()
                    window.location.href = `/library?user=${json.id}`
                }
            })
            .catch(error => {
                setLoginError(true)
                setFormData(prevFormData => ({
                    ...prevFormData,
                    username: "",
                    password: ""
                }))
            })
    }

    function handleChange(e) {
        setFormData(prevFormData => ({
            ...prevFormData,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <>
            <div className="window dynamic login-form">
                {loginError && <div className="error-message">Error</div>}
                <input onChange={handleChange} name="username" placeholder="username" value={formData.username}></input>
                <input onChange={handleChange} name="password" type="password" placeholder="password" value={formData.password}></input>
                <button onClick={handleLogin} style={{ height:"30px" }}></button>
            </div>
        </>
    )
}

export default Login