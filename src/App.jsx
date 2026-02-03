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
  const [screen, setScreen] = useState("landing");
  const [goingWith, setGoingWith] = useState("");
  const [time, setTime] = useState("");
  const [mood, setMood] = useState("");
  const [foodType, setFoodType] = useState("");
  const [budget, setBudget] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [error, setError] = useState("");

  // 📍 Location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocation({ lat: 19.076, lng: 72.8777 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLocation({ lat: 19.076, lng: 72.8777 });
      }
    );
  };

  // 🔥 BACKEND CALL (FIXED)
  const fetchRecommendation = async () => {
    if (!location?.lat || !location?.lng) {
      throw new Error("Location not ready");
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
      return data; // ✅ IMPORTANT FIX
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

  // 🧠 THINKING FLOW (FINAL FIX)
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
        if (data) {
          setScreen("result");
        }
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

              <button
                className="btn-primary"
                onClick={() => {
                  detectLocation();
                  setScreen("q1");
                }}
              >
                Start Decision
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= QUESTIONS ================= */
  const steps = {
    q1: ["Who are you going with?", [
      ["Friends", () => { setGoingWith("friends"); setScreen("q2"); }],
      ["Date / Partner", () => { setGoingWith("date"); setScreen("q2"); }],
      ["Family", () => { setGoingWith("family"); setScreen("q2"); }],
      ["Office Team", () => { setGoingWith("office"); setScreen("q2"); }],
    ]],
    q2: ["When is the plan?", [
      ["Lunch", () => { setTime("lunch"); setScreen("q3"); }],
      ["Dinner", () => { setTime("dinner"); setScreen("q3"); }],
    ]],
    q3: ["What’s the vibe?", [
      ["Casual", () => { setMood("casual"); setScreen("q4"); }],
      ["Quiet", () => { setMood("quiet"); setScreen("q4"); }],
      ["Fun", () => { setMood("fun"); setScreen("q4"); }],
      ["Romantic", () => { setMood("romantic"); setScreen("q4"); }],
    ]],
    q4: ["Food preference?", [
      ["Veg", () => { setFoodType("veg"); setScreen("q5"); }],
      ["Non-veg", () => { setFoodType("non-veg"); setScreen("q5"); }],
      ["Mixed", () => { setFoodType("mixed"); setScreen("q5"); }],
    ]],
    q5: ["Budget per person?", [
      ["₹ Budget", () => { setBudget("low"); setScreen("thinking"); }],
      ["₹₹ Moderate", () => { setBudget("medium"); setScreen("thinking"); }],
      ["₹₹₹ Premium", () => { setBudget("high"); setScreen("thinking"); }],
    ]],
  };

  if (steps[screen]) {
    const [title, options] = steps[screen];

    return (
      <div className="container">
        <div className="app-shell">
          <div className="card">
            <div className="screen">
              <h2>{title}</h2>
              <div className="option-wrap">
                {options.map(([label, action]) => (
                  <OptionButton key={label} label={label} onClick={action} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= THINKING ================= */
  if (screen === "thinking") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="card">
            <div className="screen">
              <h2>Thinkings 🤔</h2>
              <p>{THINKING_STEPS[thinkingIndex]}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= RESULT ================= */
  if (screen === "result") {
    return (
      <div className="container">
        <div className="app-shell">
          <div className="card">
            <div className="screen">
              <h2>Here’s our recommendation</h2>

              <span className="badge">High confidence</span>

              <h3>{recommendation?.name}</h3>
              <p>{recommendation?.reason}</p>

              <p className="meta">
                {goingWith} • {time} • {mood} • {foodType} • {budget}
              </p>

              <button className="btn-primary" onClick={restartFlow}>
                Start Again
              </button>

              <button className="btn-secondary" onClick={shareOnWhatsApp}>
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
