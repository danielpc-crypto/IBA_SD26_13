import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSignup = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ firstName, lastName, username, email, password }),
        });
        const data = await res.json();
        console.log(data);
    };
    return(
        <div>
        <h1>Signup</h1>
        <div>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
        </div>
    );
}

export default Signup;