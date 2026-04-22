import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0f0f0f", card: "#1a1a1a", border: "#2a2a2a",
  accent: "#e8ff47", text: "#f0f0f0", muted: "#666",
  danger: "#ff4757", green: "#2ed573",
};

const PRESETS = [
  { name: "Chicken Breast (100g)", cal: 165, p: 31, c: 0, f: 3.6 },
  { name: "White Rice (100g)", cal: 130, p: 2.7, c: 28, f: 0.3 },
  { name: "Egg", cal: 78, p: 6, c: 0.6, f: 5 },
  { name: "Banana", cal: 89, p: 1.1, c: 23, f: 0.3 },
  { name: "Oats (100g)", cal: 389, p: 17, c: 66, f: 7 },
  { name: "Protein Shake", cal: 120, p: 25, c: 3, f: 1.5 },
  { name: "Greek Yogurt (100g)", cal: 59, p: 10, c: 3.6, f: 0.4 },
  { name: "Almonds (30g)", cal: 173, p: 6, c: 6, f: 15 },
];

const todayKey = () => new Date().toISOString().split("T")[0];

export default function App() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ct_${todayKey()}`) || "[]"); } catch { return []; }
  });
  const [goal, setGoal] = useState(() => parseInt(localStorage.getItem("ct_goal") || "2200"));
  const [form, setForm] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const [tab, setTab] = useState("log");
  const [editGoal, setEditGoal] = useState(goal);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    localStorage.setItem(`ct_${todayKey()}`, JSON.stringify(entries));
  }, [entries]);

  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.cal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const pct = Math.min((totals.cal / goal) * 100, 100);
  const remaining = goal - totals.cal;

  const addEntry = (item) => {
    const entry = {
      id: Date.now(),
      name: item.name || "Custom",
      cal: parseFloat(item.cal) || 0,
      p: parseFloat(item.p) || 0,
      c: parseFloat(item.c) || 0,
      f: parseFloat(item.f) || 0,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setEntries((prev) => [...prev, entry]);
    setForm({ name: "", cal: "", p: "", c: "", f: "" });
    setFlash("Added!");
    setTimeout(() => setFlash(""), 1500);
    setTab("log");
  };

  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const saveGoal = () => {
    setGoal(editGoal);
    localStorage.setItem("ct_goal", editGoal);
    setTab("log");
  };

  const barColor = pct >= 100 ? COLORS.danger : pct >= 80 ? "#ffb347" : COLORS.accent;

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, padding: "0", maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { background: #111 !important; color: #f0f0f0 !important; border: 1px solid #2a2a2a !important; border-radius: 6px; padding: 10px 12px; font-family: 'DM Mono', monospace; font-size: 13px; width: 100%; outline: none; transition: border-color .2s; }
        input:focus { border-color: #e8ff47 !important; }
        input::placeholder { color: #444; }
        button { cursor: pointer; font-family: 'DM Mono', monospace; border: none; }
        .flash { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #e8ff47; color: #000; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 500; z-index: 99; }
      `}</style>

      {flash && <div className="flash">{flash}</div>}

      <div style={{ padding: "28px 20px 0", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, letterSpacing: 2, lineHeight: 1, color: COLORS.accent }}>FUEL LOG</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: remaining < 0 ? COLORS.danger : COLORS.text }}>
              {remaining < 0 ? "+" + Math.abs(remaining) : remaining}
            </div>
            <div style={{ fontSize: 10, color: COLORS.muted }}>{remaining < 0 ? "over goal" : "kcal left"}</div>
          </div>
        </div>

        <div style={{ height: 4, background: "#222", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 2, transition: "width .4s ease" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[
            { label: "CAL", val: Math.round(totals.cal), color: COLORS.accent },
            { label: "PRO", val: Math.round(totals.p) + "g", color: "#74b9ff" },
            { label: "CARB", val: Math.round(totals.c) + "g", color: "#fd79a8" },
            { label: "FAT", val: Math.round(totals.f) + "g", color: "#fdcb6e" },
          ].map((m) => (
            <div key={m.label} style={{ flex: 1, background: "#151515", borderRadius: 8, padding: "8px 0", textAlign: "center", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 9, color: COLORS.muted, marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          {[["log", "LOG"], ["add", "+ ADD"], ["goal", "GOAL"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "10px 0", fontSize: 11, letterSpacing: 1,
              background: tab === key ? COLORS.accent : "transparent",
              color: tab === key ? "#000" : COLORS.muted,
              borderBottom: tab === key ? "none" : `1px solid ${COLORS.border}`,
              fontWeight: tab === key ? 500 : 400,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {tab === "log" && (
        <div style={{ padding: "16px 20px" }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 13, paddingTop: 60 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🍽</div>
              No entries yet. Hit + ADD to log food.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...entries].reverse().map((e) => (
                <div key={e.id} style={{ background: COLORS.card, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 3 }}>P {e.p}g · C {e.c}g · F {e.f}g · {e.time}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12 }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: COLORS.accent }}>{Math.round(e.cal)}</div>
                    <button onClick={() => removeEntry(e.id)} style={{ background: "none", color: "#444", fontSize: 16, padding: "2px 4px" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>QUICK ADD</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => addEntry(p)} style={{
                background: "#151515", border: `1px solid ${COLORS.border}`, borderRadius: 20,
                padding: "6px 12px", fontSize: 11, color: COLORS.text,
              }}>
                {p.name.split("(")[0].trim()} <span style={{ color: COLORS.muted }}>{p.cal}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>CUSTOM ENTRY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Food name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input placeholder="Calories" type="number" value={form.cal} onChange={e => setForm(f => ({ ...f, cal: e.target.value }))} />
              <input placeholder="Protein (g)" type="number" value={form.p} onChange={e => setForm(f => ({ ...f, p: e.target.value }))} />
              <input placeholder="Carbs (g)" type="number" value={form.c} onChange={e => setForm(f => ({ ...f, c: e.target.value }))} />
              <input placeholder="Fat (g)" type="number" value={form.f} onChange={e => setForm(f => ({ ...f, f: e.target.value }))} />
            </div>
            <button onClick={() => form.cal && addEntry(form)} style={{
              background: form.cal ? COLORS.accent : "#222", color: form.cal ? "#000" : "#555",
              borderRadius: 8, padding: "12px", fontSize: 12, letterSpacing: 1, fontWeight: 500, marginTop: 4,
            }}>LOG FOOD</button>
          </div>
        </div>
      )}

      {tab === "goal" && (
        <div style={{ padding: "28px 20px" }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>DAILY CALORIE GOAL</div>
          <input type="number" value={editGoal} onChange={e => setEditGoal(parseInt(e.target.value) || 0)}
            style={{ fontSize: 24, textAlign: "center", padding: "16px", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[1800, 2000, 2200, 2500, 2800].map(g => (
              <button key={g} onClick={() => setEditGoal(g)} style={{
                flex: 1, padding: "8px 0", fontSize: 11, borderRadius: 6,
                background: editGoal === g ? COLORS.accent : "#151515",
                color: editGoal === g ? "#000" : COLORS.muted,
                border: `1px solid ${editGoal === g ? COLORS.accent : COLORS.border}`,
              }}>{g}</button>
            ))}
          </div>
          <button onClick={saveGoal} style={{
            width: "100%", background: COLORS.accent, color: "#000",
            borderRadius: 8, padding: "12px", fontSize: 12, letterSpacing: 1, fontWeight: 500,
          }}>SAVE GOAL</button>
        </div>
      )}
    </div>
  );
}