import { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";


const API_BASE = "https://decideforus-backend.onrender.com/api";

const THINKING_STEPS = [
  "Understanding your preferences",
  "Scanning nearby places",
  "Checking crowd levels",
  "Finding best match for you",
  "Finalizing recommendation",
];

function OptionButton({ label, onClick }) {
  return (
    <button className="btn-option" onClick={onClick}>
      {label}
    </button>
  );
}



function App() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(""); // ✅ FIX
  const [screen, setScreen] = useState("landing");
  const [goingWith, setGoingWith] = useState("");
  const [time, setTime] = useState("");
  const [mood, setMood] = useState("");
  const [foodType, setFoodType] = useState("");
  const [budget, setBudget] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showMenu, setShowMenu] = useState(false);


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoadingAuth(false);
  });

  return () => unsubscribe();
}, []);


const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
  }
};

const handleSignup = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created successfully ✅");
  } catch (err) {
    alert(err.message); // show Firebase error
    console.error(err);
  }
};

const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful ✅");
  } catch (err) {
    alert(err.message); // show Firebase error
    console.error(err);
  }
};


const handleLogout = async () => {
  await signOut(auth);
  setScreen("landing");
};

  useEffect(() => {
  detectLocation();
}, []);

  // 📍 Location
const detectLocation = () => {
  if (!navigator.geolocation) {
    setLocationError("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setLocationError(""); // clear error
    },
    () => {
      setLocationError("Location not allowed. Showing popular places near you.");
    }
  );
};




  // 🔥 BACKEND CALL (SAFE)
  const fetchRecommendation = async () => {
    if (!location?.lat || !location?.lng) {
  const fallback = {
    name: "Nearby Restaurant",
    reason: "Popular place near you.",
    };
    setRecommendation(fallback);
    return fallback;
  }


    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          goingWith,
          budget,
          time,
          foodType,
          location,
        }),
      });

      const data = await res.json();
      setRecommendation(data);
      return data;
    } catch (err) {
      console.error(err);
      setError("Failed to fetch nearby places");

      const fallback = {
        name: "Nearby Restaurant",
        reason: "A reliable nearby option.",
      };

      setRecommendation(fallback);
      return fallback;
    }
  };

  // 🧠 THINKING FLOW
  useEffect(() => {
    if (screen === "thinking") {
      setThinkingIndex(0);

      const interval = setInterval(() => {
        setThinkingIndex((prev) =>
          prev < THINKING_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 700);

      const timer = setTimeout(async () => {
        const data = await fetchRecommendation();
        if (data) setScreen("result");
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [screen]);

  const restartFlow = () => {
    setGoingWith("");
    setTime("");
    setMood("");
    setFoodType("");
    setBudget("");
    setRecommendation(null);
    setScreen("landing");
  };

  const goBack = () => {
    if (screen === "q1") return setScreen("landing");
    if (screen === "q2") return setScreen("q1");
    if (screen === "q3") return setScreen("q2");
    if (screen === "q4") return setScreen("q3");
    if (screen === "q5") return setScreen("q4");
    if (screen === "result") return setScreen("q5");
  };

  const shareOnWhatsApp = () => {
    if (!recommendation?.name) return;

    const message = `🍽️ Decided for you!

📍 ${recommendation.name}
💡 ${recommendation.reason}

Try it yourself:
👉 https://decideforus-frontend.vercel.app/`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

 // ... KEEP ALL YOUR IMPORTS AND STATES SAME ABOVE

 /* ================= LOGIN ================= */
if (!user && !loadingAuth) {
  return (
   <div className="auth-container">
  <div className="auth-card">

    <h2 className="auth-title">Welcome to DecideForUs</h2>
    <p className="auth-subtitle">Login to continue</p>

    <button
      className="google-btn"
      onClick={handleGoogleLogin}
    >
      Continue with Google
    </button>

    <div className="auth-divider">OR</div>

    <input
      type="email"
      placeholder="Email"
      className="auth-input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Password"
      className="auth-input"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      className="auth-btn"
      onClick={handleLogin}
    >
      Login
    </button>

    <button
      className="auth-btn"
      style={{ background: "#111827", marginTop: "10px" }}
      onClick={handleSignup}
    >
      Sign Up
    </button>

    <p className="auth-switch">
      New here? <span onClick={handleSignup}>Create account</span>
    </p>

  </div>
</div>

  );
}


/* ================= LANDING ================= */
if (screen === "landing") {
  return (
    <div className="landing-container light-theme">

      {/* Navbar */}
     <nav className="landing-nav">

  <div className="nav-logo">DecideForUs</div>

  {user ? (
    <div className="nav-user">

      {/* Avatar */}
      <div
        className="nav-avatar"
        onClick={() => setShowMenu(!showMenu)}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="user" />
        ) : (
          <span>{user.email[0].toUpperCase()}</span>
        )}
      </div>

      {/* Dropdown */}
      {showMenu && (
        <div className="nav-dropdown">

          <p className="nav-name">
            {user.displayName || user.email}
          </p>

          <button
            className="nav-dropdown-btn"
            onClick={() => {
              setShowMenu(false);
              setScreen("landing");
            }}
          >
            Dashboard
          </button>

          <button
            className="nav-dropdown-btn logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      )}

    </div>
  ) : (
    <button
      className="nav-login-btn"
      onClick={handleGoogleLogin}
    >
      Login
    </button>
  )}

</nav>


      {/* Hero */}
      <div className="landing-hero">

        <h1 className="landing-title">
          Stop Overthinking.
          <br />
          Let AI Decide Your Meal.
        </h1>

        <p className="landing-subtitle">
          Answer 5 simple questions and get the best restaurant near you —
          instantly.
        </p>

        <button
          className="landing-cta-btn"
          disabled={!location.lat || !location.lng}
          onClick={() => user && setScreen("q1")}

        >
          Get Started →
        </button>

        {!location.lat && (
          <p className="helper-text warn">
            📍 Please allow location to get nearby results.
          </p>
        )}

        {locationError && (
          <p className="helper-text warn">
            {locationError}
          </p>
        )}

        <p className="landing-footer-text">
          🔒 We never store your location. 100% private.
        </p>

      </div>

      
    </div>
  );
}


 // ========== QUESTION 1 ==========
if (screen === "q1") {
  return (
    <div className="question-page">

      {/* Top Bar */}
      <div className="question-header">
        <button onClick={goBack}>← Back</button>
        <span>Step 1 of 5</span>
        <button onClick={restartFlow}>↻ Restart</button>
      </div>

      {/* Card */}
      <div className="question-card">

        {/* Progress */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "20%" }}></div>
        </div>

        <h2>Who are you going with?</h2>
        <p className="question-sub">
          Help us understand your plan better
        </p>

        <div className="question-options">

          <button
            className="question-option"
            onClick={() => {
              setGoingWith("friends");
              setScreen("q2");
            }}
          >
            👯 Friends
          </button>

          <button
            className="question-option"
            onClick={() => {
              setGoingWith("date");
              setScreen("q2");
            }}
          >
            ❤️ Date / Partner
          </button>

          <button
            className="question-option"
            onClick={() => {
              setGoingWith("family");
              setScreen("q2");
            }}
          >
            👨‍👩‍👧 Family
          </button>

          <button
            className="question-option"
            onClick={() => {
              setGoingWith("office");
              setScreen("q2");
            }}
          >
            💼 Office Team
          </button>

        </div>

      </div>
    </div>
  );
}


  // ========== QUESTION 2 ==========
if (screen === "q2") {
  return (
    <div className="question-page">

      <div className="question-header">
        <button onClick={goBack}>← Back</button>
        <span>Step 2 of 5</span>
        <button onClick={restartFlow}>↻ Restart</button>
      </div>

      <div className="question-card">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: "40%" }}
          ></div>
        </div>

        <h2>When is the plan?</h2>

        <p className="question-sub">
          Choose your meal time
        </p>

        <div className="question-options">

          <button
            className="question-option"
            onClick={() => {
              setTime("lunch");
              setScreen("q3");
            }}
          >
            🍱 Lunch
          </button>

          <button
            className="question-option"
            onClick={() => {
              setTime("dinner");
              setScreen("q3");
            }}
          >
            🌙 Dinner
          </button>

        </div>

      </div>
    </div>
  );
}


  // ========== QUESTION 3 ==========
 if (screen === "q3") {
  return (
    <div className="question-page">

      <div className="question-header">
        <button onClick={goBack}>← Back</button>
        <span>Step 3 of 5</span>
        <button onClick={restartFlow}>↻ Restart</button>
      </div>

      <div className="question-card">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: "60%" }}
          ></div>
        </div>

        <h2>What’s the vibe?</h2>

        <p className="question-sub">
          Select your mood
        </p>

        <div className="question-options">

          {["Casual","Quiet","Fun","Romantic"].map((moodItem) => (
            <button
              key={moodItem}
              className="question-option"
              onClick={() => {
                setMood(moodItem.toLowerCase());
                setScreen("q4");
              }}
            >
              {moodItem}
            </button>
          ))}

        </div>

      </div>
    </div>
  );
}


  // ========== QUESTION 4 ==========
 if (screen === "q4") {
  return (
    <div className="question-page">

      <div className="question-header">
        <button onClick={goBack}>← Back</button>
        <span>Step 4 of 5</span>
        <button onClick={restartFlow}>↻ Restart</button>
      </div>

      <div className="question-card">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: "80%" }}
          ></div>
        </div>

        <h2>Food preference?</h2>

        <p className="question-sub">
          Choose your diet
        </p>

        <div className="question-options">

          <button
            className="question-option"
            onClick={() => {
              setFoodType("veg");
              setScreen("q5");
            }}
          >
            🥦 Veg
          </button>

          <button
            className="question-option"
            onClick={() => {
              setFoodType("non-veg");
              setScreen("q5");
            }}
          >
            🍗 Non-Veg
          </button>

          <button
            className="question-option"
            onClick={() => {
              setFoodType("mixed");
              setScreen("q5");
            }}
          >
            🍽️ Mixed
          </button>

        </div>

      </div>
    </div>
  );
}


  // ========== QUESTION 5 ==========
  if (screen === "q5") {
  return (
    <div className="question-page">

      <div className="question-header">
        <button onClick={goBack}>← Back</button>
        <span>Step 5 of 5</span>
        <button onClick={restartFlow}>↻ Restart</button>
      </div>

      <div className="question-card">

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: "100%" }}
          ></div>
        </div>

        <h2>Budget per person?</h2>

        <p className="question-sub">
          Select your budget range
        </p>

        <div className="question-options">

          <button
            className="question-option"
            onClick={() => {
              setBudget("low");
              setScreen("thinking");
            }}
          >
            ₹ Budget
          </button>

          <button
            className="question-option"
            onClick={() => {
              setBudget("medium");
              setScreen("thinking");
            }}
          >
            ₹₹ Moderate
          </button>

          <button
            className="question-option"
            onClick={() => {
              setBudget("high");
              setScreen("thinking");
            }}
          >
            ₹₹₹ Premium
          </button>

        </div>

      </div>
    </div>
  );
}


  // ========== THINKING ==========
if (screen === "thinking") {
  return (
    <div className="container thinking-theme">
      <div className="app-shell">
        <div className="app-header">
          <div className="app-logo">DecideForUs AI</div>
          <div className="app-title">Food & Place Decision Assistant</div>
        </div>

        <div className="card">
          <div className="screen">
            <h2>Thinking 🤔</h2>
            <p className="thinking-text">
              {THINKING_STEPS[thinkingIndex]}...
            </p>

            <div className="dot-loader">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



    // ========== RESULT ==========
 if (screen === "result") {
  return (
    <div className="container result-theme">
      <div className="app-shell">
        <div className="app-header">
          <div className="app-logo">DecideForUs AI</div>
          <div className="app-title">Food & Place Decision Assistant</div>
        </div>

        <div className="card">
          <div className="screen">
            <h2>Here’s our recommendation</h2>

            <span className="badge">High confidence</span>

            <h3>{recommendation?.name}</h3>
            <p>{recommendation?.reason}</p>

            <p className="meta">
              {goingWith} • {time} • {mood} • {foodType} • {budget}
            </p>

            <div className="result-actions">
              <button
                className="btn-primary btn-restart"
                onClick={restartFlow}
              >
                Start Again
              </button>

              <button
                className="btn-secondary btn-share"
                onClick={shareOnWhatsApp}
              >
                Share on WhatsApp
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


  return null;
}

export default App;
