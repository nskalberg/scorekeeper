import { useState } from "react"

function Login(){

    const [formData, setFormData] = useState({})
    const [loginError, setLoginError] = useState(false)

    function handleLogin() {
        fetch("http://localhost:8000/login", {
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
                localStorage.token = json.token
                if(!localStorage.redirect){
                    window.location.href = `http://localhost:3000/library?user=${json.id}`
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