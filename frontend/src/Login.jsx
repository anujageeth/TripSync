import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "./components/Toast";
import "./CSS/Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const [toastOpen, setToastOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('info');

    const API = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API}/login`, { email, password })
            .then(res => {
                if (res?.data?.status === 'Success') {
                    localStorage.setItem('userId', res.data.userId);
                    if (res.data.token) localStorage.setItem('token', res.data.token);
                    setToastType('success'); setToastMsg('Logged in successfully.'); setToastOpen(true);
                    setTimeout(() => navigate('/dashboard'), 900);
                } else {
                    setToastType('error');
                    setToastMsg(res?.data?.message || 'Login failed. Check your credentials.');
                    setToastOpen(true);
                }
            })
            .catch(err => {
                setToastType('error');
                setToastMsg(err?.response?.data?.message || 'Login failed. Please try again.');
                setToastOpen(true);
            });
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
          <Toast
            open={toastOpen}
            type={toastType}
            message={toastMsg}
            duration={2500}
            onClose={() => setToastOpen(false)}
          />
        </div>
    );
}

export default Login;
