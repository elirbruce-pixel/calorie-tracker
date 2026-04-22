import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0f0f0f", card: "#1a1a1a", border: "#2a2a2a",
  accent: "#e8ff47", text: "#f0f0f0", muted: "#666",
  danger: "#ff4757", blue: "#74b9ff", pink: "#fd79a8", yellow: "#fdcb6e",
};

const PRESETS = [
  { name: "PB Toast (2 slices)", cal: 380, p: 14, c: 42, f: 18 },
  { name: "Bagel & Cream Cheese", cal: 420, p: 12, c: 62, f: 14 },
  { name: "Eggs x3 & Toast", cal: 380, p: 22, c: 28, f: 16 },
  { name: "Greek Yogurt & Granola", cal: 280, p: 18, c: 36, f: 7 },
  { name: "Oatmeal (1 cup)", cal: 300, p: 10, c: 54, f: 5 },
  { name: "Protein Bar", cal: 210, p: 20, c: 24, f: 7 },
  { name: "Meat Stick", cal: 100, p: 9, c: 1, f: 7 },
  { name: "Banana", cal: 105, p: 1.3, c: 27, f: 0.4 },
  { name: "Apple", cal: 95, p: 0.5, c: 25, f: 0.3 },
  { name: "Almonds (1oz)", cal: 164, p: 6, c: 6, f: 14 },
  { name: "Donut", cal: 300, p: 4, c: 36, f: 16 },
  { name: "Bag of Chips", cal: 150, p: 2, c: 15, f: 10 },
  { name: "Granola Bar", cal: 190, p: 4, c: 29, f: 7 },
  { name: "Chocolate Milk (1 cup)", cal: 208, p: 8, c: 32, f: 8 },
  { name: "Chicken Breast (6oz)", cal: 280, p: 52, c: 0, f: 6 },
  { name: "Ground Beef (6oz)", cal: 340, p: 38, c: 0, f: 20 },
  { name: "Salmon (6oz)", cal: 350, p: 40, c: 0, f: 20 },
  { name: "Protein Shake", cal: 160, p: 30, c: 6, f: 2 },
  { name: "Eggs x3", cal: 234, p: 18, c: 1.8, f: 15 },
  { name: "White Rice (1 cup)", cal: 200, p: 4, c: 44, f: 0.5 },
  { name: "Pasta (1 cup)", cal: 220, p: 8, c: 43, f: 1.3 },
  { name: "Sweet Potato", cal: 130, p: 3, c: 30, f: 0.1 },
  { name: "Ice Cream (1 cup)", cal: 290, p: 5, c: 34, f: 16 },
  { name: "Chipotle Bowl (est)", cal: 850, p: 45, c: 90, f: 30 },
  { name: "Subway Chicken Footlong", cal: 560, p: 42, c: 72, f: 10 },
  { name: "Cholms Burger (est)", cal: 750, p: 38, c: 55, f: 38 },
  { name: "Cosmic Pizza (2 slices)", cal: 560, p: 24, c: 68, f: 20 },
  { name: "Mexican Truck Burrito", cal: 800, p: 38, c: 85, f: 28 },
  { name: "Mexican Truck Plate", cal: 480, p: 24, c: 42, f: 16 },
  { name: "McDonald's McDouble", cal: 400, p: 22, c: 33, f: 20 },
  { name: "McDonald's Fries (M)", cal: 320, p: 4, c: 44, f: 15 },
  { name: "Chipotle Kids Meal", cal: 600, p: 40, c: 60, f: 25 },
];

const todayKey = () => new Date().toISOString().split("T")[0];
const dateKey = (d) => d.toISOString().split("T")[0];
const WATER_GOAL = 100;

export default function App() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ct_${todayKey()}`) || "[]"); } catch { return []; }
  });
  const [goalCal, setGoalCal] = useState(() => parseInt(localStorage.getItem("ct_goal") || "2800"));
  const [water, setWater] = useState(() => parseInt(localStorage.getItem(`ct_water_${todayKey()}`) || "0"));
  const [weights, setWeights] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ct_weights") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const [tab, setTab] = useState("log");
  const [editGoal, setEditGoal] = useState(goalCal);
  const [flash, setFlash] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const html5QrRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`ct_${todayKey()}`, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(`ct_water_${todayKey()}`, water);
  }, [water]);

  useEffect(() => {
    localStorage.setItem("ct_weights", JSON.stringify(weights));
  }, [weights]);

  const totals = entries.reduce(
    (a, e) => ({ cal: a.cal + e.cal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const pctCal = Math.min((totals.cal / goalCal) * 100, 100);
  const remaining = goalCal - totals.cal;
  const barColor = pctCal >= 100 ? COLORS.danger : pctCal >= 80 ? "#ffb347" : COLORS.accent;

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 1800); };

  const addEntry = (item) => {
    setEntries((prev) => [...prev, {
      id: Date.now(),
      name: item.name || "Custom",
      cal: parseFloat(item.cal) || 0,
      p: parseFloat(item.p) || 0,
      c: parseFloat(item.c) || 0,
      f: parseFloat(item.f) || 0,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setForm({ name: "", cal: "", p: "", c: "", f: "" });
    showFlash("Added!");
    setTab("log");
  };

  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const saveGoal = () => {
    setGoalCal(editGoal);
    localStorage.setItem("ct_goal", editGoal);
    showFlash("Goal saved!");
    setTab("log");
  };

  const logWeight = () => {
    if (!weightInput) return;
    const entry = { date: todayKey(), weight: parseFloat(weightInput) };
    setWeights((prev) => [...prev.filter(w => w.date !== todayKey()), entry].sort((a, b) => a.date.localeCompare(b.date)));
    setWeightInput("");
    showFlash("Weight logged!");
  };

  const startScanner = async () => {
    setScannerError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      html5QrRef.current = new Html5Qrcode("qr-reader");
      await html5QrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (barcode) => {
          await stopScanner();
          showFlash("Looking up...");
          try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await res.json();
            if (data.status === 1) {
              const n = data.product.nutriments;
              setForm({
                name: data.product.product_name || "Scanned Food",
                cal: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
                p: Math.round((n.proteins_100g || 0) * 10) / 10,
                c: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
                f: Math.round((n.fat_100g || 0) * 10) / 10,
              });
              showFlash("Found! Review & log.");
            } else {
              setScannerError("Product not found. Enter manually.");
            }
          } catch { setScannerError("Lookup failed. Enter manually."); }
        },
        () => {}
      );
    } catch {
      setScannerError("Camera access denied.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    try { if (html5QrRef.current) { await html5QrRef.current.stop(); html5QrRef.current.clear(); } } catch {}
    setScanning(false);
  };

  const getLast7Days = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = dateKey(d);
      const dayEntries = JSON.parse(localStorage.getItem(`ct_${key}`) || "[]");
      return {
        key, label: i === 6 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
        cal: Math.round(dayEntries.reduce((a, e) => a + e.cal, 0)),
        p: Math.round(dayEntries.reduce((a, e) => a + e.p, 0)),
        entries: dayEntries.length,
      };
    });
  };

  const MacroBar = ({ label, current, goal, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: COLORS.muted }}>{label}</span>
        <span style={{ fontSize: 11, color }}>{Math.round(current)}g <span style={{ color: COLORS.muted }}>/ {goal}g</span></span>
      </div>
      <div style={{ height: 6, background: "#222", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min((current / goal) * 100, 100)}%`, background: color, borderRadius: 3, transition: "width .4s ease" }} />
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { background: #111 !important; color: #f0f0f0 !important; border: 1px solid #2a2a2a !important; border-radius: 6px; padding: 10px 12px; font-family: 'DM Mono', monospace; font-size: 13px; width: 100%; outline: none; transition: border-color .2s; }
        input:focus { border-color: #e8ff47 !important; }
        input::placeholder { color: #444; }
        button { cursor: pointer; font-family: 'DM Mono', monospace; border: none; }
        .flash { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #e8ff47; color: #000; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 500; z-index: 99; }
        #qr-reader video { width: 100% !important; border-radius: 10px; }
        #qr-reader { width: 100% !important; border: none !important; }
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
              {remaining < 0 ? "+" + Math.abs(Math.round(remaining)) : Math.round(remaining)}
            </div>
            <div style={{ fontSize: 10, color: COLORS.muted }}>{remaining < 0 ? "over goal" : "kcal left"}</div>
          </div>
        </div>

        <div style={{ height: 4, background: "#222", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pctCal}%`, background: barColor, borderRadius: 2, transition: "width .4s ease" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { label: "CAL", val: Math.round(totals.cal), color: COLORS.accent },
            { label: "PRO", val: Math.round(totals.p) + "g", color: COLORS.blue },
            { label: "CARB", val: Math.round(totals.c) + "g", color: COLORS.pink },
            { label: "FAT", val: Math.round(totals.f) + "g", color: COLORS.yellow },
            { label: "💧", val: water + " oz", color: "#56c8f5" },
          ].map((m) => (
            <div key={m.label} style={{ flex: 1, background: "#151515", borderRadius: 8, padding: "8px 0", textAlign: "center", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 9, color: COLORS.muted, marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          {[["log", "LOG"], ["add", "+ ADD"], ["stats", "STATS"], ["goal", "GOAL"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); if (scanning) stopScanner(); }} style={{
              flex: 1, padding: "10px 0", fontSize: 10, letterSpacing: 1,
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
          <div style={{ background: COLORS.card, borderRadius: 10, padding: "16px", border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 12 }}>MACRO PROGRESS</div>
            <MacroBar label="Protein" current={totals.p} goal={190} color={COLORS.blue} />
            <MacroBar label="Carbs" current={totals.c} goal={280} color={COLORS.pink} />
            <MacroBar label="Fat" current={totals.f} goal={70} color={COLORS.yellow} />
          </div>

          <div style={{ background: COLORS.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${COLORS.border}`, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#56c8f5" }}>💧 WATER</div>
              <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{water} / {WATER_GOAL} oz today</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setWater(w => Math.max(0, w - 8))} style={{ background: "#222", color: COLORS.text, borderRadius: 6, width: 32, height: 32, fontSize: 16 }}>-</button>
              <span style={{ fontSize: 11, color: COLORS.muted }}>8oz</span>
              <button onClick={() => setWater(w => w + 8)} style={{ background: "#56c8f5", color: "#000", borderRadius: 6, width: 32, height: 32, fontSize: 16, fontWeight: 700 }}>+</button>
            </div>
          </div>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", color: COLORS.muted, fontSize: 13, paddingTop: 40 }}>
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
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>BARCODE SCANNER</div>
          {!scanning ? (
            <button onClick={startScanner} style={{
              width: "100%", background: "#151515", border: `1px solid ${COLORS.accent}`,
              color: COLORS.accent, borderRadius: 8, padding: "12px", fontSize: 12, letterSpacing: 1, marginBottom: 24,
            }}>📷 SCAN BARCODE</button>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <div id="qr-reader" style={{ width: "100%", marginBottom: 10 }} />
              <button onClick={stopScanner} style={{ width: "100%", background: "#222", color: COLORS.muted, borderRadius: 8, padding: "10px", fontSize: 12 }}>CANCEL</button>
            </div>
          )}
          {scannerError && <div style={{ fontSize: 11, color: COLORS.danger, marginBottom: 16 }}>{scannerError}</div>}

          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>QUICK ADD</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => addEntry(p)} style={{
                background: "#151515", border: `1px solid ${COLORS.border}`, borderRadius: 20,
                padding: "6px 12px", fontSize: 11, color: COLORS.text,
              }}>
                {p.name} <span style={{ color: COLORS.muted }}>{p.cal}</span>
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

      {tab === "stats" && (
        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>LOG WEIGHT (lbs)</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input placeholder="e.g. 182.5" type="number" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ flex: 1 }} />
            <button onClick={logWeight} style={{ background: COLORS.accent, color: "#000", borderRadius: 8, padding: "10px 16px", fontSize: 12, fontWeight: 500 }}>LOG</button>
          </div>

          {weights.length > 0 && (
            <div style={{ background: COLORS.card, borderRadius: 10, padding: "14px", border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 12 }}>WEIGHT HISTORY</div>
              {[...weights].reverse().slice(0, 7).map((w, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>{w.date}</span>
                  <span style={{ fontSize: 13, color: COLORS.accent, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>{w.weight} lbs</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>7-DAY HISTORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {getLast7Days().map((d) => (
              <div key={d.key} style={{ background: COLORS.card, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d.label}</div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{d.entries} items · {d.p}g protein</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: d.cal > goalCal ? COLORS.danger : d.cal === 0 ? COLORS.muted : COLORS.accent }}>{d.cal || "—"}</div>
                    <div style={{ fontSize: 9, color: COLORS.muted }}>kcal</div>
                  </div>
                </div>
                {d.cal > 0 && (
                  <div style={{ height: 3, background: "#222", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min((d.cal / goalCal) * 100, 100)}%`, background: d.cal > goalCal ? COLORS.danger : COLORS.accent, borderRadius: 2 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "goal" && (
        <div style={{ padding: "28px 20px" }}>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 10 }}>DAILY CALORIE GOAL</div>
          <input type="number" value={editGoal} onChange={e => setEditGoal(parseInt(e.target.value) || 0)}
            style={{ fontSize: 24, textAlign: "center", padding: "16px", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[2200, 2500, 2800, 3000, 3200].map(g => (
              <button key={g} onClick={() => setEditGoal(g)} style={{
                flex: 1, padding: "8px 0", fontSize: 11, borderRadius: 6,
                background: editGoal === g ? COLORS.accent : "#151515",
                color: editGoal === g ? "#000" : COLORS.muted,
                border: `1px solid ${editGoal === g ? COLORS.accent : COLORS.border}`,
              }}>{g}</button>
            ))}
          </div>
          <div style={{ background: COLORS.card, borderRadius: 10, padding: "16px", border: `1px solid ${COLORS.border}`, marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginBottom: 12 }}>MACRO TARGETS</div>
            {[
              { label: "Protein", val: "190g", color: COLORS.blue },
              { label: "Carbs", val: "280g", color: COLORS.pink },
              { label: "Fat", val: "70g", color: COLORS.yellow },
              { label: "Water", val: "100 oz", color: "#56c8f5" },
            ].map((m, i, arr) => (
              <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <span style={{ fontSize: 12, color: COLORS.muted }}>{m.label}</span>
                <span style={{ fontSize: 12, color: m.color }}>{m.val}</span>
              </div>
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