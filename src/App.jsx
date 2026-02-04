import { useState, useEffect } from "react";
import "./App.css";
import "./index.css";

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

  /* ================= LANDING ================= */
  if (screen === "landing") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
            <div className="screen">
              <h1>Can’t decide what to eat?</h1>
              <p>We’ll decide for you.</p>

              <div className="card-actions">
                <button
                  className="btn-primary"
                  disabled={!location.lat || !location.lng}
                  onClick={() => setScreen("q1")}
                >
                  Start Decision
                </button>





                {locationError && (
                  <p className="helper-text warn">
                    Location not allowed. Showing popular places near you.
                  </p>
                )}

                <p className="helper-text">
                  We use your location only to suggest nearby places. Nothing is stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

     // ========== QUESTION 1 ==========
  if (screen === "q1") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            <div className="header-actions">
              <button className="btn-option" onClick={goBack}>
                ← Back
              </button>

              <button className="btn-option" onClick={restartFlow}>
                ↻ Restart
              </button>
            </div>
      
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
            <div className="screen">
              <p className="progress">
                Step 1 of 5 • Almost there
              </p>
              <h2>Who are you going with?</h2>

              <div className="option-wrap">
                <OptionButton
                  label="Friends"
                  onClick={() => {
                    setGoingWith("friends");
                    setScreen("q2");
                  }}
                />

                <OptionButton
                  label="Date / Partner"
                  onClick={() => {
                    setGoingWith("date");
                    setScreen("q2");
                  }}
                />

                <OptionButton
                  label="Family"
                  onClick={() => {
                    setGoingWith("family");
                    setScreen("q2");
                  }}
                />

                <OptionButton
                  label="Office Team"
                  onClick={() => {
                    setGoingWith("office");
                    setScreen("q2");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== QUESTION 2 ==========
  if (screen === "q2") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            <div className="header-actions">
              <button className="btn-option" onClick={goBack}>
                ← Back
              </button>

              <button className="btn-option" onClick={restartFlow}>
                ↻ Restart
              </button>
            </div>


            
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
            <div className="screen">
              <p className="progress">
                Step 2 of 5 • Almost there
              </p>

              <h2>When is the plan?</h2>

              <div className="option-wrap">
                <OptionButton
                  label="Lunch"
                  onClick={() => {
                    setTime("lunch");
                    setScreen("q3");
                  }}
                />

                <OptionButton
                  label="Dinner"
                  onClick={() => {
                    setTime("dinner");
                    setScreen("q3");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== QUESTION 3 ==========
  if (screen === "q3") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            <div className="header-actions">
              <button className="btn-option" onClick={goBack}>
                ← Back
              </button>

              <button className="btn-option" onClick={restartFlow}>
                ↻ Restart
              </button>
            </div>


            
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
            <div className="screen">
              <p className="progress">
                Step 3 of 5 • Almost there
              </p>

              <h2>What’s the vibe?</h2>

              <div className="option-wrap">
                <OptionButton
                  label="Casual"
                  onClick={() => {
                    setMood("casual");
                    setScreen("q4");
                  }}
                />

                <OptionButton
                  label="Quiet"
                  onClick={() => {
                    setMood("quiet");
                    setScreen("q4");
                  }}
                />

                <OptionButton
                  label="Fun"
                  onClick={() => {
                    setMood("fun");
                    setScreen("q4");
                  }}
                />

                <OptionButton
                  label="Romantic"
                  onClick={() => {
                    setMood("romantic");
                    setScreen("q4");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== QUESTION 4 ==========
  if (screen === "q4") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            <div className="header-actions">
              <button className="btn-option" onClick={goBack}>
                ← Back
              </button>

              <button className="btn-option" onClick={restartFlow}>
                ↻ Restart
              </button>
            </div>


            
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
            <div className="screen">
              <p className="progress">
                Step 4 of 5 • Almost there
              </p>

              <h2>Food preference?</h2>

              <div className="option-wrap">
                <OptionButton
                  label="Veg"
                  onClick={() => {
                    setFoodType("veg");
                    setScreen("q5");
                  }}
                />

                <OptionButton
                  label="Non-veg"
                  onClick={() => {
                    setFoodType("non-veg");
                    setScreen("q5");
                  }}
                />

                <OptionButton
                  label="Mixed"
                  onClick={() => {
                    setFoodType("mixed");
                    setScreen("q5");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== QUESTION 5 ==========
  if (screen === "q5") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            <div className="header-actions">
              <button className="btn-option" onClick={goBack}>
                ← Back
              </button>

              <button className="btn-option" onClick={restartFlow}>
                ↻ Restart
              </button>
            </div>


            
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
            <div className="screen">
              <p className="progress">
                Step 5 of 5 • Almost there
              </p>

              <h2>Budget per person?</h2>

              <div className="option-wrap">
                <OptionButton
                  label="₹ Budget"
                  onClick={() => {
                    setBudget("low");
                    setScreen("thinking");
                  }}
                />

                <OptionButton
                  label="₹₹ Moderate"
                  onClick={() => {
                    setBudget("medium");
                    setScreen("thinking");
                  }}
                />

                <OptionButton
                  label="₹₹₹ Premium"
                  onClick={() => {
                    setBudget("high");
                    setScreen("thinking");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== THINKING ==========
  if (screen === "thinking") {
    return (
      <div className="container">
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
    const rec = recommendation;

    return (
      <div className="container">
        <div className="app-shell">
          <div className="app-header">
            
    
            <div className="app-logo">DecideForUs AI</div>
            <div className="app-title">Food & Place Decision Assistant</div>
          </div>

          <div className="card">
           <div className="screen">
              <h2>Here’s our recommendation</h2>

              {error && <p style={{ color: "red" }}>{error}</p>}
              
              <span className="badge">High confidence</span>

              <h3>{recommendation?.name || "Popular Local Restaurant"}</h3>
              <p>{recommendation?.reason || "A trusted nearby option chosen for you."}</p>




              <p className="meta">
                {goingWith} • {time} • {mood} • {foodType} • {budget}
              </p>

              <div className="result-actions">
                <button
                  className="btn-primary btn-restart"
                  onClick={() => setScreen("landing")}
                >
                  Start Again
                </button>
                
                <button
                  className="btn-secondary btn-share"
                  onClick={() => shareOnWhatsApp(recommendation)}
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
