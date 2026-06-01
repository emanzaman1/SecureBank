import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://127.0.0.1:8000/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProfile(response.data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "/";
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {profile && (
        <div>
          <p>Username: {profile.username}</p>
          <p>Role: {profile.role}</p>
        </div>
      )}

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;