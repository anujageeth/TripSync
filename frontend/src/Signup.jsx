import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './CSS/Login.css';

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    axios.post('http://localhost:3001/register', { name, email, password })
      .then(result => {
        console.log(result);
        navigate('/login');
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
            <h5 className="loginSub">Sign Up</h5>
          </div>

          <form onSubmit={handleSubmit} className="loginForm">
            <div className="fillLogin">
              <label htmlFor="name" className="visually-hidden">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
                name="name"
                className="loginInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="fillLogin">
              <label htmlFor="email" className="visually-hidden">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
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
                placeholder="Enter password"
                autoComplete="new-password"
                name="password"
                className="loginInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="fillLogin">
              <label htmlFor="confirmPassword" className="visually-hidden">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                name="confirmPassword"
                className="loginInput"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="loginActions">
              <button type="submit" className="loginBtn">
                Register
              </button>
            </div>
          </form>

          <Link to="/login" className="regLink">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
