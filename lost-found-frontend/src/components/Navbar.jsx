import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav style={{ background: "#1f2937", padding: "10px 20px", color: "#fff" }}>
      <Link to="/" style={{ marginRight: 15, color: "white" }}>
        Home
      </Link>

      {user ? (
        <>
          <Link to="/messages" style={{ marginRight: 15, color: "white" }}>
            Messages
          </Link>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: 15, color: "white" }}>
            Login
          </Link>
          <Link to="/signup" style={{ color: "white" }}>
            Signup
          </Link>
        </>
      )}
    </nav>
  );
}
