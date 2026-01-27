import { useState, useEffect } from "react";
import "./App.css";
import "./index.css";

function OptionButton({ label, onClick }) {
  return (
    <button className="btn-option" onClick={onClick}>
      {label}
    </button>
  );
}

function getRecommendation({ goingWith, mood, time, foodType, budget }) {
  // 🔴 Highest Priority: Date + Romantic
  if (goingWith === "date" && mood === "romantic") {
    return {
      name: "Cozy Candlelight Café",
      reason: "Romantic vibe, quiet seating, and perfect for quality time."
    };
  }

  // 🔴 Family always needs comfort
  if (goingWith === "family") {
    return {
      name: "Green Leaf Family Restaurant",
      reason: "Hygienic, calm atmosphere and family-friendly menu."
    };
  }

  // 🟠 Office outings
  if (goingWith === "office") {
    return {
      name: "Business Lunch Hub",
      reason: "Professional ambience with quick service."
    };
  }

  // 🟡 Friends + Fun
  if (goingWith === "friends" && mood === "fun") {
    return {
      name: "The Social Street",
      reason: "Energetic vibe, affordable food and great for groups."
    };
  }

  // 🟢 Budget-sensitive fallback
  if (budget === "low") {
    return {
      name: "Local Food Junction",
      reason: "Budget-friendly and satisfying choices."
    };
  }

  // 🔵 Default safe choice
  return {
    name: "Neighborhood Café",
    reason: "A balanced option that works for most situations."
  };
}

function Progress({ current, total }) {
  return <p className="progress">Step {current} of {total}</p>;
}

function App() {
  const [screen, setScreen] = useState("landing");
  const [goingWith, setGoingWith] = useState("");
  const [time, setTime] = useState("");
  const [mood, setMood] = useState("");
  const [foodType, setFoodType] = useState("");
  const [budget, setBudget] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");


 useEffect(() => {
  const fetchRecommendation = async () => {
    if (screen !== "thinking") return;

    setError("");
    setRecommendation(null);

    try {
      const res = await fetch("https://decideforus-backend.onrender.com/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goingWith,
          time,
          mood,
          foodType,
          budget,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong");
        setScreen("result");
        return;
      }

      setRecommendation(data);

      setTimeout(() => {
        setScreen("result");
      }, 800);
    } catch (err) {
      setError("Backend not running / API error");
      setScreen("result");
    }
  };

  fetchRecommendation();
}, [screen, goingWith, time, mood, foodType, budget]);


  const restartFlow = () => {
  setGoingWith("");
  setTime("");
  setMood("");
  setFoodType("");
  setBudget("");
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

  // ========== LANDING ==========
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
                <button className="btn-primary" onClick={() => setScreen("q1")}>
                  Start Decision
                </button>
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
              <Progress current={1} total={5} />
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
              <Progress current={2} total={5} />
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
              <Progress current={3} total={5} />
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
              <Progress current={4} total={5} />
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
              <Progress current={5} total={5} />
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
              <h2>Thinking…</h2>
              <p>Understanding your plan</p>
              <p>Finding best places</p>
              <p>Avoiding overcrowded spots</p>
            
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
              <h2>Here’s our recommendation</h2>

              {error && <p style={{ color: "red" }}>{error}</p>}
              
              <span className="badge">High confidence</span>

              <h3>{rec?.name || "No recommendation"}</h3>
              <p>{rec?.reason || "Try again."}</p>



              <p className="meta">
                {goingWith} • {time} • {mood} • {foodType} • {budget}
              </p>

              <div className="card-actions">
                <button className="btn-primary" onClick={() => setScreen("landing")}>
                  Start Again
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
