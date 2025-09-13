import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './CSS/Login.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/login', { email, password })
            .then(result => {
                console.log("Login response:", result.data);
                if (result.data.status === "Success") {
                    localStorage.setItem("userId", result.data.userId);
                    navigate('/dashboard');
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="loginPage">
          <div className="loginOverlay">
            <div className="loginBox">
              <div className="titlePageDiv">
                <h2 className="loginTitle">Travel Planner</h2>
              </div>
              <div className="subTitlePageDiv">
                <h5 className="loginSub">Login</h5>
              </div>

              <form onSubmit={handleSubmit} className="loginForm">
                <div className="fillLogin">
                  <label htmlFor="email" className="visually-hidden">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    name="email"
                    className="loginInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="fillLogin">
                  <label htmlFor="password" className="visually-hidden">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    name="password"
                    className="loginInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="loginActions">
                  <button type="submit" className="loginBtn">Login</button>
                </div>
              </form>

              <Link to="/register" className="regLink">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
    );
}

export default Login;
