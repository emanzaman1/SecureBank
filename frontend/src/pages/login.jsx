
import { useState } from "react";
import axios from "axios";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        {
          username: username,
          password: password
        }
      );

      console.log("Login Success");
      console.log(response.data);

      localStorage.setItem(
        "token",
        response.data.access_token
      );

      window.location.href = "/dashboard";

    }
    catch (error) {

      console.error("Login Error");

      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
      }

      alert("Login Failed");
    }
  };

  return (
    <div>
      <h1>SecureBank Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br /><br />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default Login;