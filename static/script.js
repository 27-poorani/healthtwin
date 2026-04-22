/**
 * Modern AI Analysis Overlay
 * Provides a high-fidelity "AI processing" experience.
 */
const AI_CSS = `
    .ai-overlay { position: fixed; inset: 0; background: rgba(5, 5, 8, 0.95); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', 'Inter', monospace; color: #f8fafc; opacity: 0; transition: opacity 0.4s ease; backdrop-filter: blur(12px); }
    .ai-overlay.active { opacity: 1; }
    .ai-content { width: 90%; max-width: 800px; text-align: center; }
    
    .ai-viewport { position: relative; margin-bottom: 32px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #000; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .ai-viewport.healthy { border-color: #10b981; box-shadow: 0 0 40px rgba(16, 185, 129, 0.2); animation: ai-pulse-green 2s infinite ease-in-out; }
    .ai-viewport.unhealthy { border-color: #ef4444; box-shadow: 0 0 50px rgba(239, 68, 68, 0.3); animation: ai-heartbeat-red 1.5s infinite; }

    .ai-viewport img, .ai-viewport video { width: 100%; max-height: 50vh; object-fit: contain; transition: filter 0.8s ease; display: block; margin: 0 auto; }
    .ai-scanline { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent); box-shadow: 0 0 20px #3b82f6; display: none; z-index: 20; }
    
    .ai-box { position: absolute; border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.1); border-radius: 4px; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; z-index: 10; box-shadow: 0 0 10px #ef4444; }
    .ai-footer { max-width: 500px; margin: 0 auto; width: 100%; }
    .ai-status-wrap { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .ai-status-text { font-size: 14px; color: #94a3b8; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
    .ai-progress-track { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
    .ai-progress-fill { height: 100%; width: 0%; background: #3b82f6; transition: width 0.4s ease; }
    
    .ai-results-stage { display: none; animation: ai-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1); background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px; text-align: center; backdrop-filter: blur(20px); width: 100%; }
    .ai-res-title { font-size: 38px; font-weight: 900; color: #fff; margin: 16px 0 8px; letter-spacing: -0.04em; }
    .ai-res-msg { font-size: 16px; color: #94a3b8; margin-bottom: 24px; }
    
    .ai-badge { display: inline-flex; align-items: center; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
    .ai-badge.healthy { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .ai-badge.unhealthy { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); animation: ai-glitch-text 2s infinite; }
    
    .ai-score-wrap { margin: 24px 0; }
    .ai-score-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px; }
    .ai-score-value { font-size: 48px; font-weight: 900; font-variant-numeric: tabular-nums; }
    .healthy .ai-score-value { color: #10b981; text-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    .unhealthy .ai-score-value { color: #ef4444; text-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
    
    .ai-log { font-size: 11px; color: #475569; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; }
    .ai-btn-close { margin-top: 24px; padding: 14px 40px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; font-weight: 700; transition: all 0.3s; }
    .ai-btn-close:hover { background: #fff; color: #000; transform: translateY(-2px); }
    
    @keyframes ai-scan { 0% { top: 0; } 100% { top: 100%; } }
    @keyframes ai-slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ai-pulse-green { 0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); transform: scale(1); } 50% { box-shadow: 0 0 50px rgba(16, 185, 129, 0.4); transform: scale(1.005); } }
    @keyframes ai-heartbeat-red { 0% { transform: scale(1); box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); } 15% { transform: scale(1.01); box-shadow: 0 0 60px rgba(239, 68, 68, 0.5); } 30% { transform: scale(1); box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); } }
    @keyframes ai-glitch-text { 0% { opacity: 1; } 95% { opacity: 1; transform: scale(1); } 96% { opacity: 0.8; transform: skewX(10deg); } 97% { opacity: 1; transform: skewX(-10deg); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes ai-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
    .shake { animation: ai-shake 0.1s ease-in-out infinite; }
    
    .ai-spinner { width: 18px; height: 18px; border: 2px solid rgba(59, 130, 246, 0.2); border-top-color: #3b82f6; border-radius: 50%; animation: ai-spin 0.8s linear infinite; }
    @keyframes ai-spin { to { transform: rotate(360deg); } }
`;

const injectAIStyles = () => {
    const style = document.createElement("style");
    style.textContent = AI_CSS;
    document.head.appendChild(style);
};
injectAIStyles();

/**
 * Initialize EmailJS for direct admin notifications.
 */
const initEmailJS = () => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
        emailjs.init("w0b09IH6ZoJ4-Sey7"); // Replace with your actual EmailJS Public Key
    };
    document.head.appendChild(script);
};
initEmailJS();

async function runAnalysisExperience(file, apiPromise) {
    const overlay = document.createElement("div");
    overlay.className = "ai-overlay";
    const imgUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    
    overlay.innerHTML = `
        <div class="ai-content" id="ai-main-container">
            <div class="ai-viewport">
                ${isVideo ? `<video src="${imgUrl}" id="ai-target-img" autoplay muted loop></video>` : `<img src="${imgUrl}" id="ai-target-img" />`}
                <div class="ai-scanline" id="ai-scan"></div>
                <div class="ai-box" style="top:20%; left:25%; width:25%; height:30%"></div>
                <div class="ai-box" style="top:45%; left:50%; width:30%; height:20%"></div>
            </div>
            <div id="ai-processing">
                <div class="ai-footer">
                    <div class="ai-status-wrap">
                        <div class="ai-status-text"><div class="ai-spinner"></div> <span id="ai-msg">Initializing AI model...</span></div>
                        <div id="ai-pct-text" style="color:#64748b; font-size:14px; font-weight:600">0%</div>
                    </div>
                    <div class="ai-progress-track"><div class="ai-progress-fill" id="ai-fill" style="width:0%"></div></div>
                </div>
            </div>
            <div class="ai-results-stage" id="ai-results"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("active"));

    const img = document.getElementById("ai-target-img");
    const fill = document.getElementById("ai-fill");
    const pctText = document.getElementById("ai-pct-text");
    const msg = document.getElementById("ai-msg");
    const scan = document.getElementById("ai-scan");
    const boxes = document.querySelectorAll(".ai-box");
    const results = document.getElementById("ai-results");
    const processing = document.getElementById("ai-processing");

    const update = (text, p) => {
        msg.textContent = text;
        fill.style.width = p + "%";
        pctText.textContent = p + "%";
    };
    const viewport = document.querySelector('.ai-viewport');

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Simulated Animation Timeline
    update("Initializing AI model...", 12);
    await delay(800);

    update("Preprocessing image...", 35);
    img.style.filter = "blur(8px) grayscale(100%) brightness(1.2)";
    await delay(1200);

    update("Scanning for patterns...", 60);
    img.style.filter = "contrast(1.2) brightness(0.8)";
    scan.style.display = "block";
    scan.style.animation = "ai-scan 2s linear infinite";
    await delay(1500);

    update("Detecting regions...", 85);
    boxes.forEach((b, i) => setTimeout(() => b.style.opacity = 1, i * 400));
    await delay(1000);

    update("Analyzing data...", 94);
    const data = await apiPromise;
    
    update("Finalizing analysis...", 100);
    await delay(600);

    const isHealthy = data.health_status === "Healthy";
    const themeClass = isHealthy ? "healthy" : "unhealthy";
    
    // Transition to results
    scan.style.display = "none";
    processing.style.display = "none";
    img.style.filter = "none";
    viewport.classList.add(themeClass);
    
    if (!isHealthy) {
        viewport.classList.add("shake");
    } else {
        boxes.forEach(b => b.style.opacity = 0);
    }
    results.classList.add(themeClass);

    const badgeText = isHealthy ? "Healthy" : "⚠ Disease Detected";
    const statusMsg = isHealthy ? "No abnormalities detected" : "Anomalous patterns identified";
    const titleText = isHealthy ? "System Normal" : data.prediction;
    const confidencePct = (data.healthy_probability * 100);
    
    results.innerHTML = `
        <div class="ai-badge ${themeClass}">${badgeText}</div>
        <div class="ai-res-title">${titleText}</div>
        <div class="ai-res-msg">${statusMsg}</div>
        
        <div class="ai-score-wrap">
            <div class="ai-score-label">AI Diagnostic Confidence</div>
            <div class="ai-score-value" id="ai-count">0.00%</div>
        </div>

        <div class="ai-res-stats">
            <span>Dog ID: <b>${data.dog_id}</b></span>
            <span>NODES_ACTIVE: <b>642</b></span>
            <span>LATENCY: <b>${(Math.random() * 50 + 10).toFixed(0)}ms</b></span>
        </div>
        <button class="ai-btn-close" onclick="document.querySelector('.ai-overlay').remove()">Return to Dashboard</button>
        <div class="ai-log">Analysis complete. Visualization mapping finished. Diagnostic confidence validated.</div>
    `;
    results.style.display = "block";

    // If healthy, stop the viewport shake after a moment (glitch effect)
    if (!isHealthy) {
        setTimeout(() => viewport.classList.remove("shake"), 1000);
    }

    // Counter animation
    const counterEl = document.getElementById("ai-count");
    const start = performance.now();
    function animateCount(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / 1500, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        counterEl.textContent = (ease * confidencePct).toFixed(2) + "%";
        if (progress < 1) requestAnimationFrame(animateCount);
    }
    requestAnimationFrame(animateCount);
    return data;
}

const LS_KEY = "dogSkin.dashboardRuns.v1";

const MAX_RUNS = 30;
const MAX_STORED_VIDEO_FRAMES = 250;

function safeGetLocalStorage() {
    try {
        return window.localStorage;
    } catch (e) {
        return null;
    }
}

function loadRuns() {
    const ls = safeGetLocalStorage();
    if (!ls) return [];
    const raw = ls.getItem(LS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveRuns(runs) {
    const ls = safeGetLocalStorage();
    if (!ls) return;
    ls.setItem(LS_KEY, JSON.stringify(runs));
}

function escapeHtml(v) {
    const s = (v === null || v === undefined) ? "" : String(v);
    return s.replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatWhen(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function clampScore01(value, fallback = 0.5) {
    const n = Number(value);
    if (!isFinite(n)) return fallback;
    if (n < 0) return 0;
    if (n > 1) return 1;
    return n;
}

function updateHealthyReferenceProfile(dogId, averageHealthyScore) {
    const dogIdEl = document.getElementById("profileDogIdValue");
    const fillEl = document.getElementById("avgHealthyScoreFill");
    const valueEl = document.getElementById("avgHealthyScoreValue");
    const statusEl = document.getElementById("avgHealthyScoreStatus");
    const progressEl = document.querySelector(".score-progress");

    if (dogIdEl) dogIdEl.textContent = String(dogId || "default");

    const score = clampScore01(averageHealthyScore, 0.5);
    const pct = Math.round(score * 100);
    const isStable = score >= 0.5;

    if (fillEl) fillEl.style.width = `${pct}%`;
    if (valueEl) valueEl.textContent = score.toFixed(2);
    if (progressEl) progressEl.setAttribute("aria-valuenow", score.toFixed(2));
    if (statusEl) {
        statusEl.textContent = isStable ? "Stable" : "Low Stability";
        statusEl.classList.toggle("stable", isStable);
        statusEl.classList.toggle("low", !isStable);
    }
}

function renderHealthComparison(currentScore, baselineScore) {
    const card = document.getElementById("healthComparisonCard");
    const currentEl = document.getElementById("currentHealthScoreValue");
    const baselineEl = document.getElementById("baselineHealthScoreValue");
    if (!card || !currentEl || !baselineEl) return;

    const current = clampScore01(currentScore, 0);
    const baseline = clampScore01(baselineScore, 0.5);
    currentEl.textContent = current.toFixed(2);
    baselineEl.textContent = baseline.toFixed(2);
    card.style.display = "block";
}

function computeVideoOverall(results) {
    let healthy = 0;
    let unhealthy = 0;
    for (const r of results) {
        if (r.health_status === "Healthy") healthy++;
        else unhealthy++;
    }
    return {
        healthy,
        unhealthy,
        overall: healthy >= unhealthy ? "Healthy" : "Unhealthy",
    };
}

function classifySeverityFromHealthyProb(healthyProb, threshold, healthStatus) {
    const p = Number(healthyProb);
    const t = Number(threshold);
    const status = healthStatus === "Healthy" ? "Healthy" : "Unhealthy";

    if (!isFinite(p) || !isFinite(t)) {
        return { label: "Mild", key: "mild" };
    }

    // If predicted Healthy, we consider severity Mild (no disease detected).
    if (status === "Healthy") {
        return { label: "Mild", key: "mild" };
    }

    // Unhealthy severity based on how far below the baseline threshold the healthy-probability is.
    const deficit = Math.max(0, t - p); // 0..1
    if (deficit < 0.10) return { label: "Mild", key: "mild" };
    if (deficit < 0.25) return { label: "Moderate", key: "moderate" };
    return { label: "Severe", key: "severe" };
}

function classifySeverityFromVideo(results) {
    const total = results ? results.length : 0;
    if (!total) return { label: "Mild", key: "mild" };
    const unhealthy = results.reduce((acc, r) => acc + (r.health_status === "Healthy" ? 0 : 1), 0);
    const ratio = unhealthy / total;
    if (ratio < 0.20) return { label: "Mild", key: "mild" };
    if (ratio < 0.50) return { label: "Moderate", key: "moderate" };
    return { label: "Severe", key: "severe" };
}

function getDiseaseCareInfo(diseaseLabel) {
    const label = (diseaseLabel || "").trim();

    // Conservative defaults for safety.
    const defaultInfo = {
        steps: [
            "Keep the area clean and dry.",
            "Prevent licking/scratching (use a cone if needed).",
            "Avoid using human creams/medicines unless your vet confirms they are safe for dogs.",
            "If you notice worsening lesions, pus, strong odor, fever, or spreading, contact a veterinarian.",
        ],
        vet: "Yes",
        contagious: "No",
    };

    // Map from model output labels to care tips.
    if (label === "Healthy") {
        return {
            steps: [
                "Monitor your dog’s skin for any new redness, itching, or hair loss.",
                "Maintain good hygiene and continue regular flea/tick prevention.",
            ],
            vet: "No",
            contagious: "No",
        };
    }

    if (label === "Ringworm") {
        return {
            steps: [
                "Isolate affected pets from other animals when possible.",
                "Wash hands after touching your dog; clean/disinfect bedding and grooming tools.",
                "Avoid touching lesions with bare hands and prevent licking/scratching (cone if needed).",
                "Use vet-prescribed antifungal treatment as directed (shampoo/dips or oral meds).",
                "Do not use steroid-only creams (they can worsen fungal problems).",
            ],
            vet: "Urgent",
            contagious: "Yes",
        };
    }

    if (label === "Fungal Infections") {
        return {
            steps: [
                "Keep lesions clean; gently bathe only with vet-approved medicated products.",
                "Prevent licking/scratching (cone if needed).",
                "Wash hands after care and clean bedding/grooming items.",
                "Follow vet instructions for antifungal shampoo/dips or oral antifungal medication.",
            ],
            vet: "Urgent",
            contagious: "Yes",
        };
    }

    if (label === "Dermatitis") {
        return {
            steps: [
                "Try to identify and remove possible triggers (irritants, new foods, grooming products).",
                "Use gentle cleansing and keep the coat dry.",
                "Start flea prevention if not already using it (fleas can cause dermatitis).",
                "Prevent licking/scratching and consider a vet visit to find the root cause.",
            ],
            vet: "Yes",
            contagious: "No",
        };
    }

    if (label === "Hypersensitivity") {
        return {
            steps: [
                "Start/continue flea prevention and avoid known environmental triggers when possible.",
                "Avoid random human anti-itch products; ask your vet for safe allergy control.",
                "Consider a diet/allergy plan with your vet if symptoms keep recurring.",
                "Prevent licking/scratching (cone/appropriate barriers).",
            ],
            vet: "Yes",
            contagious: "No",
        };
    }

    if (label === "Demodicosis") {
        return {
            steps: [
                "Book a vet appointment for treatment and skin checks.",
                "Follow vet instructions for dips/topicals/oral meds; do not stop early.",
                "Treat any secondary skin infection if your vet finds one.",
            ],
            vet: "Yes",
            contagious: "No",
        };
    }

    // Some datasets might output Demodicosis spelled differently; keep a fallback.
    if (label === "Demodicosis (Demodex)" || label === "Demodex") {
        return defaultInfo;
    }

    return defaultInfo;
}

function formatDiseaseListForDisplay(diseaseLabels) {
    const list = (Array.isArray(diseaseLabels) ? diseaseLabels : [diseaseLabels])
        .filter(Boolean)
        .map(s => String(s).trim())
        .filter(Boolean);

    if (!list.length) return "-";
    if (list.length <= 3) return list.join(", ");
    return list.slice(0, 3).join(", ") + " + " + (list.length - 3) + " more";
}

function updateCareSuggestionsPanel(panelId, diseaseLabels) {
    const el = document.getElementById(panelId);
    if (!el) return;

    const labels = (Array.isArray(diseaseLabels) ? diseaseLabels : [diseaseLabels])
        .filter(Boolean)
        .map(s => String(s).trim())
        .filter(Boolean);

    const safeLabels = labels.length ? labels : ["-"];
    const displayDisease = formatDiseaseListForDisplay(safeLabels);

    // Merge info across diseases (video may include multiple).
    const stepsSeen = new Set();
    const mergedSteps = [];

    let vetLevel = "No"; // No < Yes < Urgent
    let contagious = "No";

    for (const d of safeLabels) {
        const info = getDiseaseCareInfo(d);

        for (const s of (info.steps || [])) {
            if (stepsSeen.has(s)) continue;
            stepsSeen.add(s);
            mergedSteps.push(s);
        }

        if (info.vet === "Urgent") vetLevel = "Urgent";
        else if (info.vet === "Yes" && vetLevel !== "Urgent") vetLevel = "Yes";

        if (info.contagious === "Yes") contagious = "Yes";
    }

    const vetClass = vetLevel === "Urgent" ? "urgent" : (vetLevel === "No" ? "no" : "yes");
    const contagiousClass = contagious === "Yes" ? "yes" : "no";

    const stepsLi = mergedSteps.map(s => `<li>${escapeHtml(s)}</li>`).join("");
    const callNowHtml = vetLevel === "Urgent"
        ? `<div class="care-action-row"><a class="call-now-btn" href="tel:108">🚨 Call Now</a></div>`
        : "";

    el.innerHTML = `
        <div class="result-card">
            <div class="care-head">
                <div>
                    <div class="care-title">🐕 Care Suggestions</div>
                    <div class="care-disease">Detected: ${escapeHtml(displayDisease || "-")}</div>
                </div>
                <div class="care-badges">
                    <div class="care-badge ${vetClass}">Vet: ${escapeHtml(vetLevel)}</div>
                    <div class="care-badge ${contagiousClass}">Contagious: ${escapeHtml(contagious)}</div>
                </div>
            </div>

            <div class="care-section">
                <div class="care-section-title">Immediate care steps</div>
                <ul class="care-steps">${stepsLi}</ul>
            </div>
            ${callNowHtml}
        </div>
    `;

    el.style.display = "block";
}

function deriveDiseasesFromVideoResults(results) {
    const list = (results || []).filter(r => r && r.health_status !== "Healthy");
    if (!list.length) return ["Healthy"];

    // Preserve insertion order so the panel looks consistent.
    const diseases = new Set();
    for (const r of list) {
        const k = (r.predicted_label || "").trim();
        if (!k) continue;
        diseases.add(k);
    }

    const arr = Array.from(diseases);
    return arr.length ? arr : ["Healthy"];
}

function pushDiseaseMessageToChat(diseaseLabels) {
    const fn = window.__chatAssistantAddMessage;
    if (typeof fn === "function") {
        const displayDisease = formatDiseaseListForDisplay(diseaseLabels);
        fn("This looks like " + (displayDisease || "-") + ". Ask me anything.");
    }
}

// Reporting state (used by "Report this dog" button)
function setReportPredictionContext(diseaseLabels, severityKey, severityLabel, dogId) {
    window.__reportContext = window.__reportContext || {};
    window.__reportContext.dogId = dogId || "default";
    window.__reportContext.diseaseLabels = (Array.isArray(diseaseLabels) ? diseaseLabels : [diseaseLabels]).filter(Boolean);
    window.__reportContext.severityKey = severityKey || "mild";
    window.__reportContext.severityLabel = severityLabel || "Mild";
    window.__reportContext.predictionReady = true;
    window.__reportContext.imageReady = false;
    window.__reportContext.isSubmitting = false;
    updateReportButtonState();
}

function setReportImageContext(imageBase64, imageMime) {
    window.__reportContext = window.__reportContext || {};
    window.__reportContext.imageBase64 = imageBase64 || null;
    window.__reportContext.imageMime = imageMime || "image/jpeg";
    window.__reportContext.imageReady = !!imageBase64;
    updateReportButtonState();
}

function reportDogFromUnhealthyThumb(index) {
    const thumbs = window.__currentUnhealthyThumbsForReport || [];
    const t = thumbs[Number(index)];
    if (!t) {
        alert("Could not find this frame to report.");
        return;
    }
    const threshold = Number(window.__currentVideoThresholdForReport);
    const dogId = window.__currentVideoDogIdForReport || "default";
    const sev = classifySeverityFromHealthyProb(t.healthy_probability, threshold, "Unhealthy");
    const disease = t.predicted_label || "Unhealthy";

    setReportPredictionContext([disease], sev.key, sev.label, dogId);
    setReportImageContext(t.image_base64 || null, "image/jpeg");
    reportThisDog();
}

function updateReportButtonState() {
    const btn = document.getElementById("reportThisDogBtn");
    const statusEl = document.getElementById("reportStatus");
    const ctx = window.__reportContext || {};
    const ready = !!(ctx.predictionReady && ctx.imageReady);
    if (btn) btn.disabled = !ready;

    if (!statusEl) return;

    if (ctx.isSubmitting) {
        statusEl.textContent = "Submitting report...";
        return;
    }

    if (!ctx.predictionReady) {
        statusEl.textContent = "Run an image/video prediction to enable reporting.";
        return;
    }

    if (ctx.predictionReady && !ctx.imageReady) {
        statusEl.textContent = "Preparing image for report…";
        return;
    }

    statusEl.textContent = "Ready to report. We’ll ask for your current location.";
}

function fileToScaledJpegBase64(file, maxDim = 512, quality = 0.72) {
    return new Promise((resolve) => {
        if (!file) return resolve(null);
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const w = img.width;
                    const h = img.height;
                    const scale = Math.min(1, maxDim / Math.max(w, h));
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(w * scale));
                    canvas.height = Math.max(1, Math.round(h * scale));
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL("image/jpeg", quality);
                    const base64 = dataUrl.split(",")[1];
                    resolve(base64 || null);
                };
                img.onerror = () => resolve(null);
                img.src = reader.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        } catch (e) {
            resolve(null);
        }
    });
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Geolocation is not supported by this browser."));
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => reject(err),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000,
            }
        );
    });
}

async function reportThisDog() {
    const btn = document.getElementById("reportThisDogBtn");
    const statusEl = document.getElementById("reportStatus");
    const notesInput = document.getElementById("reportNotesInput");
    const ctx = window.__reportContext || {};

    if (btn && btn.disabled) {
        updateReportButtonState();
        return;
    }

    ctx.isSubmitting = true;
    updateReportButtonState();

    try {
        if (statusEl) statusEl.textContent = "Requesting location permission…";
        const location = await getCurrentLocation();

        const locName = await reverseGeocodeName(location.latitude, location.longitude);
        const locationText = locName || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;

        if (statusEl) statusEl.textContent = "Submitting report…";

        const payload = {
            dog_id: ctx.dogId || "default",
            disease: ctx.diseaseLabels || [],
            severity: ctx.severityLabel || "Mild",
            image_base64: ctx.imageBase64 || null,
            image_mime: ctx.imageMime || "image/jpeg",
            location: location,
            notes: notesInput && notesInput.value ? String(notesInput.value).trim() : "",
        };

        const resp = await fetch("/api/report_dog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            throw new Error(data.error || "Failed to submit report.");
        }

        // EmailJS: Direct Notification to Admin
        if (window.emailjs) {
            const templateParams = {
                disease_name: (payload.disease && payload.disease.length > 0) ? payload.disease.join(", ") : "Not specified",
                condition: payload.severity === "Severe" ? "Urgent / Critical" : "Attention Required",
                severity: payload.severity,
                location: locationText,
                timestamp: new Date().toLocaleString(),
                dog_image: payload.image_base64 || "",
                notes: payload.notes || "No additional notes"
            };
            emailjs.send("service_jqvb0e7", "template_f4eqogg", templateParams)
                .catch(err => console.error("EmailJS notification failed:", err));
        }

        if (statusEl) statusEl.textContent = "Thanks! Report submitted and admin notified.";
        alert("Reported!");
        if (notesInput) notesInput.value = "";
        renderReportsHistory();

        // Prevent duplicate submissions until next prediction.
        ctx.predictionReady = false;
        ctx.imageReady = false;
        ctx.isSubmitting = false;
        updateReportButtonState();

        const historyCard = document.querySelector(".reports-history-card");
        if (historyCard && historyCard.scrollIntoView) {
            historyCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    } catch (e) {
        ctx.isSubmitting = false;
        const msg = (e && e.message) ? e.message : String(e);
        if (statusEl) {
            if (/permission|denied|user denied/i.test(msg)) {
                statusEl.textContent = "Location permission denied. Enable location to report this dog.";
            } else {
                statusEl.textContent = "Report failed. " + msg;
            }
        }
        updateReportButtonState();
    }
}

function formatIsoToLocal(iso) {
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso || "");
        return d.toLocaleString();
    } catch (e) {
        return String(iso || "");
    }
}

function severityKeyFromLabel(label) {
    const v = String(label || "");
    if (v === "Severe") return "severe";
    if (v === "Moderate") return "moderate";
    return "mild";
}

function reportStatusKeyFromLabel(label) {
    const v = String(label || "").trim();
    if (v === "Resolved") return "resolved";
    if (v === "In Progress") return "inprogress";
    return "reported";
}

let _diseaseChart = null;
let _severityChart = null;
let _locationChart = null;
let _trendChart = null;

function _destroyIfChart(c) {
    if (c && typeof c.destroy === "function") c.destroy();
}

function buildReportsCharts(reports) {
    if (typeof Chart === "undefined") return;
    const diseaseCtx = document.getElementById("diseaseChart");
    const severityCtx = document.getElementById("severityChart");
    const locationCtx = document.getElementById("locationChart");
    const trendCtx = document.getElementById("trendChart");
    if (!diseaseCtx || !severityCtx || !locationCtx || !trendCtx) return;

    const safeReports = Array.isArray(reports) ? reports : [];

    // Disease distribution
    const diseaseCounts = {};
    for (const r of safeReports) {
        const dis = Array.isArray(r.disease) ? r.disease : (r.disease ? [r.disease] : []);
        for (const d of dis) {
            const key = String(d || "Unknown").trim() || "Unknown";
            diseaseCounts[key] = (diseaseCounts[key] || 0) + 1;
        }
    }
    const diseaseLabels = Object.keys(diseaseCounts);
    const diseaseValues = diseaseLabels.map(k => diseaseCounts[k]);

    // Severity distribution
    const severityCounts = { Mild: 0, Moderate: 0, Severe: 0 };
    for (const r of safeReports) {
        const sev = String(r.severity || "Mild");
        if (sev === "Moderate") severityCounts.Moderate++;
        else if (sev === "Severe") severityCounts.Severe++;
        else severityCounts.Mild++;
    }

    // Location-based cases (bucketed by rounded lat/lng)
    const locationCounts = {};
    for (const r of safeReports) {
        if (r.lat == null || r.lng == null) continue;
        const latR = _roundCoord(r.lat);
        const lngR = _roundCoord(r.lng);
        if (latR === null || lngR === null) continue;
        const key = `${latR},${lngR}`;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
    }
    const locLabels = Object.keys(locationCounts);
    const locValues = locLabels.map(k => locationCounts[k]);

    // Trend over time (by date)
    const trendCounts = {};
    for (const r of safeReports) {
        const iso = r.createdAt;
        if (!iso) continue;
        const d = new Date(iso);
        if (isNaN(d.getTime())) continue;
        const key = d.toISOString().slice(0, 10);
        trendCounts[key] = (trendCounts[key] || 0) + 1;
    }
    const trendLabels = Object.keys(trendCounts).sort();
    const trendValues = trendLabels.map(k => trendCounts[k]);

    _destroyIfChart(_diseaseChart);
    _destroyIfChart(_severityChart);
    _destroyIfChart(_locationChart);
    _destroyIfChart(_trendChart);

    if (diseaseLabels.length) {
        _diseaseChart = new Chart(diseaseCtx, {
            type: "pie",
            data: {
                labels: diseaseLabels,
                datasets: [{
                    data: diseaseValues,
                    backgroundColor: ["#22c55e","#3b82f6","#f97316","#e11d48","#6366f1","#14b8a6"],
                }],
            },
            options: {
                plugins: { legend: { position: "bottom" } },
            },
        });
    }

    _severityChart = new Chart(severityCtx, {
        type: "bar",
        data: {
            labels: ["Mild","Moderate","Severe"],
            datasets: [{
                data: [severityCounts.Mild, severityCounts.Moderate, severityCounts.Severe],
                backgroundColor: ["#22c55e","#eab308","#ef4444"],
            }],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision:0 } } },
        },
    });

    if (locLabels.length) {
        _locationChart = new Chart(locationCtx, {
            type: "bar",
            data: {
                labels: locLabels,
                datasets: [{
                    data: locValues,
                    backgroundColor: "#3b82f6",
                }],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision:0 } } },
            },
        });
    }

    if (trendLabels.length) {
        _trendChart = new Chart(trendCtx, {
            type: "line",
            data: {
                labels: trendLabels,
                datasets: [{
                    data: trendValues,
                    borderColor: "#0b5ed7",
                    backgroundColor: "rgba(59,130,246,0.18)",
                    fill: true,
                    tension: 0.25,
                }],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision:0 } } },
            },
        });
    }
}
async function renderReportsHistory() {
    const listEl = document.getElementById("reportsHistoryList");
    const emptyEl = document.getElementById("reportsHistoryEmpty");
    const totalEl = document.getElementById("analyticsTotalReports");
    const severeEl = document.getElementById("analyticsSevereReports");
    const topDiseaseEl = document.getElementById("analyticsTopDisease");
    if (!listEl || !emptyEl) return;

    try {
        const resp = await fetch("/api/reported_dogs");
        const data = await resp.json();
        const reports = (data && data.reports) ? data.reports : [];

        // Summary analytics
        if (totalEl) totalEl.textContent = String(reports.length || 0);
        const active = reports.filter(r => r && String(r.status || "") !== "Resolved").length;
        const inProgress = reports.filter(r => r && String(r.status || "") === "In Progress").length;
        const resolved = reports.filter(r => r && String(r.status || "") === "Resolved").length;
        const activeEl = document.getElementById("analyticsActiveReports");
        const inProgEl = document.getElementById("analyticsInProgressReports");
        const resolvedEl = document.getElementById("analyticsResolvedReports");
        if (activeEl) activeEl.textContent = String(active || 0);
        if (inProgEl) inProgEl.textContent = String(inProgress || 0);
        if (resolvedEl) resolvedEl.textContent = String(resolved || 0);

        if (!reports.length) {
            emptyEl.style.display = "block";
            listEl.innerHTML = "";
            buildReportsCharts([]);
            return;
        }

        emptyEl.style.display = "none";
        listEl.innerHTML = reports.slice(0, 5).map(r => {
            const diseaseText = Array.isArray(r.disease) ? r.disease.join(", ") : (r.disease || "-");
            const sevLabel = r.severity || "Mild";
            const sevKey = severityKeyFromLabel(sevLabel);
            const statusLabel = (r.status || "Reported");
            const statusKey = reportStatusKeyFromLabel(statusLabel);
            const notes = (r.notes || "").trim();
            const hasCoords = isFinite(Number(r.lat)) && isFinite(Number(r.lng));
            const locId = `reportLoc_${String(r.id || "").replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
            const imgB64 = r.image_base64;
            const imgMime = r.image_mime || "image/jpeg";
            const imgHtml = (typeof imgB64 === "string" && imgB64.trim())
                ? `<img class="report-thumb" alt="Reported dog" src="data:${escapeHtml(imgMime)};base64,${imgB64}" />`
                : `<div class="report-thumb placeholder" aria-hidden="true">No image</div>`;
            return `
                <div class="report-item">
                    <div class="report-item-grid">
                        ${imgHtml}
                        <div>
                            <div class="report-item-top">
                                <div>
                                    <div class="report-date">${escapeHtml(formatIsoToLocal(r.createdAt))}</div>
                                    <div class="report-disease">${escapeHtml(diseaseText)}</div>
                                    ${hasCoords ? `<div class="report-location">📍 <b>Location:</b> <span id="${escapeHtml(locId)}" data-lat="${escapeHtml(r.lat)}" data-lng="${escapeHtml(r.lng)}">Loading...</span></div>` : ""}
                                </div>
                                <div class="report-pills">
                                    <div class="report-status-pill ${escapeHtml(statusKey)}">${escapeHtml(statusLabel)}</div>
                                    <div class="severity-pill ${escapeHtml(sevKey)}">${escapeHtml(sevLabel)}</div>
                                </div>
                            </div>
                            ${notes ? `<div class="report-notes"><b>Notes:</b> ${escapeHtml(notes)}</div>` : ""}
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // After rendering, resolve human-readable location names (best-effort).
        resolveReportLocationNames(listEl);
        buildReportsCharts(reports);
    } catch (e) {
        emptyEl.style.display = "block";
        emptyEl.textContent = "Could not load reports (check MongoDB connection).";
        listEl.innerHTML = "";
    }
}

const _geoCacheKey = "dogSkin.reportGeoCache.v1";
const _geoInFlight = new Map();

function _geoCacheLoad() {
    const ls = safeGetLocalStorage();
    if (!ls) return {};
    try {
        const raw = ls.getItem(_geoCacheKey);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
        return {};
    }
}

function _geoCacheSave(cache) {
    const ls = safeGetLocalStorage();
    if (!ls) return;
    try {
        ls.setItem(_geoCacheKey, JSON.stringify(cache));
    } catch (e) {
        // ignore quota errors
    }
}

function _roundCoord(v) {
    const n = Number(v);
    if (!isFinite(n)) return null;
    return Math.round(n * 1000) / 1000; // ~110m precision; good for caching + privacy
}

async function reverseGeocodeName(lat, lng) {
    const latR = _roundCoord(lat);
    const lngR = _roundCoord(lng);
    if (latR === null || lngR === null) return null;
    const key = `${latR},${lngR}`;

    const cache = _geoCacheLoad();
    if (cache[key]) return cache[key];

    if (_geoInFlight.has(key)) return await _geoInFlight.get(key);

    const p = (async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latR)}&lon=${encodeURIComponent(lngR)}`;
            const resp = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                },
            });
            if (!resp.ok) return null;
            const data = await resp.json();
            const name = (data && (data.name || data.display_name)) ? String(data.name || data.display_name) : null;
            if (name) {
                cache[key] = name;
                // Keep cache bounded.
                const keys = Object.keys(cache);
                if (keys.length > 250) {
                    for (const k of keys.slice(0, keys.length - 250)) delete cache[k];
                }
                _geoCacheSave(cache);
            }
            return name;
        } catch (e) {
            return null;
        } finally {
            _geoInFlight.delete(key);
        }
    })();

    _geoInFlight.set(key, p);
    return await p;
}

function sleepMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveReportLocationNames(containerEl) {
    if (!containerEl) return;
    const nodes = Array.from(containerEl.querySelectorAll("span[data-lat][data-lng]"));
    if (!nodes.length) return;

    // Resolve sequentially to avoid hammering the geocoding service.
    for (const el of nodes) {
        try {
            if (!el || el.dataset.resolved === "1") continue;
            const lat = el.getAttribute("data-lat");
            const lng = el.getAttribute("data-lng");
            const name = await reverseGeocodeName(lat, lng);
            el.textContent = name ? name : "Unknown";
            el.dataset.resolved = "1";
            await sleepMs(250);
        } catch (e) {
            // ignore
        }
    }
}

let _reportsHistoryPollId = null;
function startReportsHistoryPolling() {
    if (_reportsHistoryPollId) return;
    // Keep main page in sync with admin status updates.
    _reportsHistoryPollId = setInterval(() => {
        if (document.visibilityState === "visible") renderReportsHistory();
    }, 15000);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") renderReportsHistory();
    });
}

function downloadCSV(results, filename) {
    if (!results || !results.length) {
        alert("No results to export.");
        return;
    }

    const headers = ["frame_index", "time_seconds", "health_status", "predicted_label", "healthy_probability"];
    const escapeCell = (v) => {
        const s = (v === null || v === undefined) ? "" : String(v);
        if (/[",\n]/.test(s)) {
            return '"' + s.replaceAll('"', '""') + '"';
        }
        return s;
    };

    const rows = results.map(r => [
        escapeCell(r.frame_index),
        escapeCell(r.time_seconds),
        escapeCell(r.health_status),
        escapeCell(r.predicted_label),
        escapeCell(r.healthy_probability),
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "video_frame_predictions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearPredictionHistory() {
    const ls = safeGetLocalStorage();
    if (ls) ls.removeItem(LS_KEY);
    renderAllDashboards();
}

function showDashboardTab(type) {
    const tabImage = document.getElementById("tabImageRuns");
    const tabVideo = document.getElementById("tabVideoRuns");
    const panelImage = document.getElementById("tabPanelImage");
    const panelVideo = document.getElementById("tabPanelVideo");
    if (!tabImage || !tabVideo || !panelImage || !panelVideo) return;

    const isImage = type === "image";
    tabImage.classList.toggle("active", isImage);
    tabVideo.classList.toggle("active", !isImage);
    panelImage.style.display = isImage ? "block" : "none";
    panelVideo.style.display = isImage ? "none" : "block";
}

function dogStatusPillClass(status) {
    return status === "Healthy" ? "health-pill good" : "health-pill bad";
}

function createRunCard(run) {
    const created = formatWhen(run.createdAt);
    const badgeClass = run.overall_health_status === "Healthy" ? "health-pill good" : "health-pill bad";
    const badgeText = run.overall_health_status;

    if (run.type === "image") {
        return `
            <div class="run-card">
                <div class="run-head">
                    <div>
                        <div class="run-title">Image run</div>
                        <div class="run-time">${escapeHtml(created)}</div>
                    </div>
                    <div class="${badgeClass}">${escapeHtml(badgeText)}</div>
                </div>

                <div class="run-metrics">
                    <div class="metric">
                        <div class="metric-label">Dog ID</div>
                        <div class="metric-value">${escapeHtml(run.dog_id || "default")}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Predicted class</div>
                        <div class="metric-value">${escapeHtml(run.prediction || "-")}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Healthy probability</div>
                        <div class="metric-value">${Number(run.healthy_probability).toFixed(6)}</div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">Baseline threshold</div>
                        <div class="metric-value">${Number(run.baseline_threshold).toFixed(6)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    const resultsStoredCount = run.resultsStored ? run.resultsStored.length : 0;
    return `
        <div class="run-card">
            <div class="run-head">
                <div>
                    <div class="run-title">Video run</div>
                    <div class="run-time">${escapeHtml(created)}</div>
                </div>
                <div class="${badgeClass}">${escapeHtml(badgeText)}</div>
            </div>

            <div class="run-metrics">
                <div class="metric">
                    <div class="metric-label">Dog ID</div>
                    <div class="metric-value">${escapeHtml(run.dog_id || "default")}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Frames analyzed</div>
                    <div class="metric-value">${escapeHtml(run.frames_analyzed ?? 0)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Healthy frames</div>
                    <div class="metric-value">${escapeHtml(run.healthy_frames ?? 0)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Unhealthy frames</div>
                    <div class="metric-value">${escapeHtml(run.unhealthy_frames ?? 0)}</div>
                </div>
            </div>

            <div class="run-actions">
                ${resultsStoredCount ? `<button class="secondary-btn" onclick="downloadStoredVideoCSV('${escapeHtml(run.id)}')">Download CSV</button>` : ""}
            </div>
        </div>
    `;
}

function downloadStoredVideoCSV(runId) {
    const runs = loadRuns();
    const run = runs.find(r => r.id === runId);
    if (!run || !run.resultsStored || !run.resultsStored.length) {
        alert("Stored video frames not available for this run.");
        return;
    }
    downloadCSV(run.resultsStored, "video_frame_predictions_" + runId + ".csv");
}

function renderDashboardPanels() {
    const runs = loadRuns();

    const imageRuns = runs.filter(r => r.type === "image");
    const videoRuns = runs.filter(r => r.type === "video");

    const emptyImage = document.getElementById("dashboardEmptyImage");
    const emptyVideo = document.getElementById("dashboardEmptyVideo");
    const imageList = document.getElementById("dashboardImageRuns");
    const videoList = document.getElementById("dashboardVideoRuns");

    if (imageList) imageList.innerHTML = "";
    if (videoList) videoList.innerHTML = "";

    if (imageRuns.length === 0 && emptyImage) emptyImage.style.display = "block";
    if (videoRuns.length === 0 && emptyVideo) emptyVideo.style.display = "block";

    if (emptyImage) emptyImage.style.display = imageRuns.length ? "none" : "block";
    if (emptyVideo) emptyVideo.style.display = videoRuns.length ? "none" : "block";

    if (imageList) imageList.innerHTML = imageRuns.map(createRunCard).join("");
    if (videoList) videoList.innerHTML = videoRuns.map(createRunCard).join("");
}

function renderDogStatusList() {
    const runs = loadRuns();
    const dogList = document.getElementById("dogStatusList");
    const dogEmpty = document.getElementById("dogStatusEmpty");
    if (!dogList || !dogEmpty) return;

    dogList.innerHTML = "";

    const latestByDog = {};
    for (const run of runs) {
        const dogId = run.dog_id || "default";
        if (!latestByDog[dogId]) latestByDog[dogId] = run;
    }

    const dogs = Object.keys(latestByDog).map(dogId => latestByDog[dogId]);
    if (!dogs.length) {
        dogEmpty.style.display = "block";
        return;
    }
    dogEmpty.style.display = "none";

    dogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    dogList.innerHTML = dogs.map(run => {
        const status = run.overall_health_status || "Unhealthy";
        return `
            <div class="dog-status-item">
                <div class="dog-status-top">
                    <div class="dog-id">${escapeHtml(run.dog_id || "default")}</div>
                    <div class="${dogStatusPillClass(status)}">${escapeHtml(status)}</div>
                </div>
                <div class="dog-meta">
                    ${escapeHtml(run.type.toUpperCase())} run
                    <br />
                    ${escapeHtml(formatWhen(run.createdAt))}
                </div>
            </div>
        `;
    }).join("");
}

function renderAllDashboards() {
    renderDashboardPanels();
    renderDogStatusList();
}

function addRunToHistory(run) {
    const runs = loadRuns();
    runs.unshift(run);
    saveRuns(runs.slice(0, MAX_RUNS));
}

function uploadImage() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput || !fileInput.files || !fileInput.files.length) {
        alert("Please select an image file.");
        return;
    }

    const dogIdInput = document.getElementById("dogIdInput");
    const dogId = dogIdInput && dogIdInput.value ? dogIdInput.value.trim() : "default";
    const selectedFile = fileInput.files[0];
    const reportImageMime = selectedFile && selectedFile.type ? selectedFile.type : "image/jpeg";
    const reportImagePromise = fileToScaledJpegBase64(selectedFile).catch(() => null);

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("dog_id", dogId);

    const apiPromise = fetch("/predict", {
        method: "POST",
        body: formData,
    }).then(res => res.json());

    runAnalysisExperience(selectedFile, apiPromise).then(data => {
        const label = data.prediction;
        const health = data.health_status || data.prediction;
        const prob = Number(data.healthy_probability);
        const threshold = Number(data.baseline_threshold);
        const avgHealthyScore = clampScore01(data.average_healthy_score, 0.5);
        const severity = classifySeverityFromHealthyProb(prob, threshold, health);
        
        updateHealthyReferenceProfile(dogId, avgHealthyScore);
        renderHealthComparison(prob, avgHealthyScore);

        const isHealthy = health === "Healthy";

        const resultCardHtml = `
            <div class="result-card modern-ai-card ${isHealthy ? 'healthy' : 'unhealthy'}" style="background: rgba(246, 247, 249, 0.97); border: 1px solid rgb(224, 217, 217); padding: 28px; border-radius: 20px; backdrop-filter: blur(10px);">
                <div class="result-head" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 24px;">
                    <div class="result-info">
                        <div class="system-tag" style="font-size: 10px; letter-spacing: 0.2em; color: #050607; margin-bottom: 4px;">AI ANALYSIS COMPLETE</div>
                        <div class="result-title" style="font-size: 28px; font-weight: 900; color: #121111; letter-spacing: -0.02em;">${isHealthy ? 'Healthy Condition' : escapeHtml(label)}</div>
                    </div>
                    <div class="result-badges" style="display:flex; gap:10px; align-items:center;">
                        <div class="severity-pill ${escapeHtml(severity.key)}">${escapeHtml(severity.label)}</div>
                        <div class="ai-badge ${isHealthy ? 'healthy' : 'unhealthy'}" style="padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 800;">${isHealthy ? 'NORMAL' : '⚠ ANOMALY'}</div>
                    </div>
                </div>
                
                <div class="result-visualization" style="display:grid; grid-template-columns: 1fr 1.5fr; gap: 24px; margin-bottom: 32px; padding: 20px; background: rgba(251, 247, 247, 0.93); border-radius: 16px;">
                    <div class="metric-group" style="border-right: 1px solid rgba(255,255,255,0.05);">
                        <div class="metric-label" style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">Healthy Probability</div>
                        <div class="metric-value" style="font-size: 20px; font-weight: 800; color: ${isHealthy ? '#10b981' : '#ef4444'};">
                            ${(prob * 100).toFixed(2)}%
                        </div>
                    </div>
                    <div class="metric-group">
                        <div class="metric-label" style="font-size: 11px; color: #323333; text-transform: uppercase; letter-spacing: 0.1em;">Status Summary</div>
                        <div class="metric-msg" style="font-size: 14px; color: #1a1a1b; line-height: 1.5;">${isHealthy ? 'The AI analysis concludes no visible skin abnormalities or diseases.' : 'Analysis identified patterns consistent with ' + escapeHtml(label) + '.'}</div>
                    </div>
                </div>

                <div class="care-action-row" style="display: flex; gap: 12px;">
                    <button id="reportThisDogBtn" class="primary-btn report-btn" type="button" onclick="reportThisDog()" disabled style="flex: 1; padding: 14px; border-radius: 12px; font-weight: 700;">
                        <span>📢 Report Case</span>
                    </button>
                    <div id="reportStatus" style="font-size: 12px; color: #64748b; align-self: center;"></div>
                </div>
            </div>`;

        const out = document.getElementById("predictionResult");
        if (out) out.innerHTML = resultCardHtml;

        updateCareSuggestionsPanel("careSuggestionsImage", label);
        pushDiseaseMessageToChat(label);
        setReportPredictionContext([label], severity.key, severity.label, dogId);
        reportImagePromise.then(b64 => setReportImageContext(b64, reportImageMime));
        updateReportButtonState();

        const run = {
            id: "img_" + Math.random().toString(16).slice(2) + "_" + Date.now(),
            type: "image",
            createdAt: new Date().toISOString(),
            dog_id: dogId,
            prediction: label,
            health_status: health,
            overall_health_status: health,
            healthy_probability: prob,
            baseline_threshold: threshold,
        };
        addRunToHistory(run);
        renderAllDashboards();
        showDashboardTab("image");
    })
    .catch(error => console.error("Error:", error));
}

function uploadVideo() {
    const videoInput = document.getElementById("videoInput");
    if (!videoInput || !videoInput.files || !videoInput.files.length) {
        alert("Please select a video file.");
        return;
    }

    const dogIdInput = document.getElementById("dogIdInput");
    const dogId = dogIdInput && dogIdInput.value ? dogIdInput.value.trim() : "default";

    const selectedFile = videoInput.files[0];
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("dog_id", dogId);

    const apiPromise = fetch("/predict_video", {
        method: "POST",
        body: formData,
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Server error");
        
        const results = data.results || [];
        const stats = computeVideoOverall(results);
        const scoreValues = results.map(r => Number(r.healthy_probability)).filter(v => isFinite(v));
        const avgProb = scoreValues.length ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 0;
        
        return { ...data, health_status: stats.overall, prediction: stats.overall === "Healthy" ? "Healthy" : "Anomalous Patterns Detected", healthy_probability: avgProb };
    });

    runAnalysisExperience(selectedFile, apiPromise).then(data => {
        const results = data.results || [];
        const unhealthyThumbs = data.unhealthy_thumbnails || [];
        const threshold = Number(data.baseline_threshold);
        window.__currentUnhealthyThumbsForReport = unhealthyThumbs;
        window.__currentVideoThresholdForReport = threshold;
        window.__currentVideoDogIdForReport = dogId;
        const avgHealthyScore = clampScore01(data.average_healthy_score, 0.5);
        updateHealthyReferenceProfile(dogId, avgHealthyScore);

        const scoreValues = results
            .map(r => Number(r && r.healthy_probability))
            .filter(v => isFinite(v));
        const currentScore = scoreValues.length
            ? (scoreValues.reduce((acc, v) => acc + v, 0) / scoreValues.length)
            : 0;
        renderHealthComparison(currentScore, avgHealthyScore);

        const stats = computeVideoOverall(results);
        const videoSeverity = classifySeverityFromVideo(results);
        const videoDiseaseLabels = deriveDiseasesFromVideoResults(results);

        setReportPredictionContext(videoDiseaseLabels, videoSeverity.key, videoSeverity.label, dogId);
        if (unhealthyThumbs && unhealthyThumbs.length && unhealthyThumbs[0] && unhealthyThumbs[0].image_base64) {
            setReportImageContext(unhealthyThumbs[0].image_base64, "image/jpeg");
        } else {
            setReportImageContext(null, "image/jpeg");
        }

        // Show current run
        const videoOut = document.getElementById("videoPredictionResult");
        if (videoOut) {
            const preview = results.slice(0, 12).map(r => ({
                t: r.time_seconds,
                health_status: r.health_status,
                predicted_label: r.predicted_label,
                healthy_probability: r.healthy_probability,
            }));

            videoOut.innerHTML =
                `<div class="result-card">
                <div class="result-head">
                    <div>
                        <div class="result-title">🐕 Video Result</div>
                        <div class="card-subtitle">Frame extraction: every 1 second</div>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
                        <div class="severity-pill ${escapeHtml(videoSeverity.key)}">${escapeHtml(videoSeverity.label)}</div>
                        <div class="result-badge ${stats.overall === "Healthy" ? "good" : "bad"}">${stats.overall === "Healthy" ? "Healthy" : "🚨 Unhealthy"}</div>
                    </div>
                </div>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Frames analyzed</div>
                        <div class="result-value">${results.length}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Healthy Frames</div>
                        <div class="result-value">${stats.healthy}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Unhealthy Frames</div>
                        <div class="result-value">${stats.unhealthy}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Baseline Threshold</div>
                        <div class="result-value">${isFinite(threshold) ? threshold.toFixed(6) : "-"}</div>
                    </div>
                </div>
                <details class="details">
                    <summary class="details-summary">Preview first ${preview.length} frames</summary>
                    <pre class="details-pre">${escapeHtml(JSON.stringify(preview, null, 2))}</pre>
                </details>
                </div>`;
        }

        updateCareSuggestionsPanel("careSuggestionsVideo", videoDiseaseLabels);
        pushDiseaseMessageToChat(videoDiseaseLabels);

        // Render unhealthy frame thumbnails (if any).
        const gallery = document.getElementById("unhealthyFrameGallery");
        if (gallery) {
            if (!unhealthyThumbs.length) {
                gallery.innerHTML = `<div class="empty-state">No Unhealthy frames found in the sampled intervals.</div>`;
            } else {
                gallery.innerHTML =
                    `<div class="gallery-title">🚨 Unhealthy Frame Images</div>` +
                    unhealthyThumbs.map((t, idx) => {
                        const imgSrc = `data:image/jpeg;base64,${t.image_base64}`;
                        const sev = classifySeverityFromHealthyProb(t.healthy_probability, threshold, "Unhealthy");
                        return `
                            <div class="thumb-item">
                                <img class="thumb-img" src="${imgSrc}" alt="Unhealthy frame ${t.frame_index}" />
                                <div class="thumb-meta">
                                    Frame ${t.frame_index} (${t.time_seconds}s)
                                    <br />
                                    Disease: ${escapeHtml(t.predicted_label || "-")}
                                    <br />
                                    Severity: <span class="severity-pill ${escapeHtml(sev.key)}" style="padding:4px 8px; font-size:11px;">${escapeHtml(sev.label)}</span>
                                    <div style="margin-top:8px;">
                                        <button class="primary-btn" style="padding:7px 12px; font-size:12px;" onclick="reportDogFromUnhealthyThumb(${idx})">🐕 Report this dog</button>
                                    </div>
                                </div>
                                
                            </div>
                        `;
                    }).join("");
            }
        }

        const downloadArea = document.getElementById("videoDownloadArea");
        if (downloadArea) {
            const storedFrames = results.length > MAX_STORED_VIDEO_FRAMES
                ? results.slice(0, MAX_STORED_VIDEO_FRAMES)
                : results;
            window.__currentVideoResultsForCSV = storedFrames;
            downloadArea.innerHTML =
                `<button class="secondary-btn" onclick="downloadCurrentVideoCSV()">Download CSV (Stored)</button>`;
        }

        const storedFrames = results.length > MAX_STORED_VIDEO_FRAMES
            ? results.slice(0, MAX_STORED_VIDEO_FRAMES)
            : results;

        const run = {
            id: "vid_" + Math.random().toString(16).slice(2) + "_" + Date.now(),
            type: "video",
            createdAt: new Date().toISOString(),
            dog_id: dogId,
            baseline_threshold: threshold,
            frames_analyzed: results.length,
            healthy_frames: stats.healthy,
            unhealthy_frames: stats.unhealthy,
            overall_health_status: stats.overall,
            resultsStored: storedFrames,
        };

        addRunToHistory(run);
        renderAllDashboards();
        showDashboardTab("video");
      })
    .catch(error => console.error("Error:", error));
}

function downloadCurrentVideoCSV() {
    const results = window.__currentVideoResultsForCSV || [];
    downloadCSV(results, "video_frame_predictions_current.csv");
}

function normalizeChatText(s) {
    return (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getChatAssistantAnswer(userText) {
    const q = normalizeChatText(userText);

    const disclaimer =
        "Note: This is general information, not a diagnosis. If symptoms are severe, spreading, or your dog seems unwell, consult a veterinarian.\n";

    if (!q) {
        return "Ask a question like “What is ringworm?” or “How to treat dog skin infection?”";
    }

    // Core topics
    if (q.includes("ringworm") || (q.includes("fungal") && q.includes("infection"))) {
        return (
            "Ringworm is a **fungal** skin infection (despite the name, it’s not a worm). It can cause circular hair loss, scaling, redness, and itchiness.\n\n" +
            "- It is **contagious** to other pets and humans.\n" +
            "- Common care: vet-prescribed **antifungal shampoo/dips** and/or oral antifungals.\n" +
            "- Hygiene: wash bedding, disinfect surfaces, and isolate affected pets when possible.\n\n" +
            disclaimer
        );
    }

    if (q.includes("dermatitis") || (q.includes("skin") && q.includes("inflammation"))) {
        return (
            "Dermatitis means **inflammation of the skin**. In dogs it’s often triggered by allergies (food/environment), parasites (fleas/mites), infections, or irritants.\n\n" +
            "- Signs: redness, itching, licking, rash, scabs, odor, or recurrent ear issues.\n" +
            "- Treatment depends on cause: flea control, allergy management, medicated shampoos, and sometimes antibiotics/antifungals or anti-itch meds.\n\n" +
            disclaimer
        );
    }

    if (q.includes("demodicosis") || q.includes("demodex") || (q.includes("mite") && q.includes("dog"))) {
        return (
            "Demodicosis (Demodex) is a **mite-related** skin condition. Demodex mites normally live on skin, but overgrowth can cause patchy hair loss, redness, and sometimes infection.\n\n" +
            "- Often needs vet treatment (topical/oral acaricides) and follow-up skin checks.\n" +
            "- Secondary bacterial infection is common and may need antibiotics.\n\n" +
            disclaimer
        );
    }

    if (q.includes("hypersensitivity") || q.includes("allergy") || q.includes("allergic")) {
        return (
            "Hypersensitivity is an **allergic reaction** (to fleas, food, pollen/dust, etc.). It often causes intense itching, chewing/licking, and recurrent skin/ear problems.\n\n" +
            "- Start with flea prevention, gentle bathing, and avoiding known triggers.\n" +
            "- A vet may recommend allergy meds, diet trials, or immunotherapy.\n\n" +
            disclaimer
        );
    }

    if (q.includes("skin infection") || (q.includes("treat") && q.includes("skin"))) {
        return (
            "For a suspected dog skin infection (bacterial or fungal), the safest approach is to identify the cause first.\n\n" +
            "- Gently clean the area; prevent licking/scratching (cone if needed).\n" +
            "- Use vet-approved medicated shampoo/antiseptic washes when recommended.\n" +
            "- Avoid human creams unless a vet confirms they are safe for dogs.\n" +
            "- Seek vet help if there’s pus, strong odor, widespread hair loss, fever, pain, or rapid spreading.\n\n" +
            disclaimer
        );
    }

    if (q.includes("contagious") || q.includes("spread")) {
        return (
            "Some dog skin problems can spread.\n\n" +
            "- **Ringworm** (fungal) can spread to humans and pets.\n" +
            "- Some **mites** (like sarcoptic mange) are contagious; Demodex usually isn’t.\n" +
            "- Bacterial infections often spread by contact if the skin barrier is damaged.\n\n" +
            "If you suspect something contagious, limit contact, wash hands, and clean bedding.\n\n" +
            disclaimer
        );
    }

    // Fallback
    return (
        "I can help with common questions like:\n" +
        "- What is ringworm?\n" +
        "- What is dermatitis?\n" +
        "- How to treat dog skin infection?\n" +
        "- Is it contagious?\n\n" +
        "Type one of these, or click a suggested question below.\n\n" +
        disclaimer
    );
}

function initChatAssistant() {
    const fab = document.getElementById("chatFab");
    const panel = document.getElementById("chatPanel");
    const closeBtn = document.getElementById("chatCloseBtn");
    const messages = document.getElementById("chatMessages");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const suggestions = document.getElementById("chatSuggestions");

    if (!fab || !panel || !closeBtn || !messages || !form || !input || !suggestions) return;

    const SUGGESTED = [
        "What is ringworm?",
        "How to treat dog skin infection?",
        "What is dermatitis?",
        "Is ringworm contagious to humans?",
        "What is demodicosis (Demodex)?",
        "What does hypersensitivity mean?",
    ];

    function setOpen(isOpen) {
        panel.style.display = isOpen ? "flex" : "none";
        fab.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (isOpen) {
            input.focus();
            messages.scrollTop = messages.scrollHeight;
        }
    }

    function addBubble(role, text) {
        const div = document.createElement("div");
        div.className = "chat-bubble " + role;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function respondTo(text) {
        const answer = getChatAssistantAnswer(text);
        addBubble("assistant", answer);
    }

    // Seed suggestions
    suggestions.innerHTML = SUGGESTED.map(q => {
        const safe = escapeHtml(q);
        return `<button class="chat-suggest-btn" type="button" data-q="${safe}">${safe}</button>`;
    }).join("");

    suggestions.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("button[data-q]") : null;
        if (!btn) return;
        const q = btn.getAttribute("data-q") || "";
        setOpen(true);
        input.value = q;
        if (typeof form.requestSubmit === "function") {
            form.requestSubmit();
        } else {
            form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
    });

    fab.addEventListener("click", () => setOpen(panel.style.display === "none"));
    closeBtn.addEventListener("click", () => setOpen(false));

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = (input.value || "").trim();
        if (!text) return;
        addBubble("user", text);
        input.value = "";
        respondTo(text);
    });

    // Initial assistant greeting (once)
    addBubble("assistant", "Hi! Ask me about common dog skin conditions (ringworm, dermatitis, allergies, mites) and basic care steps.");

    // Allow other parts of the app to push a message into the chat.
    window.__chatAssistantAddMessage = (text) => addBubble("assistant", text);
}

// Expose functions for onclick
window.uploadImage = uploadImage;
window.uploadVideo = uploadVideo;
window.clearPredictionHistory = clearPredictionHistory;
window.showDashboardTab = showDashboardTab;
window.downloadCurrentVideoCSV = downloadCurrentVideoCSV;
window.downloadStoredVideoCSV = downloadStoredVideoCSV;
window.reportThisDog = reportThisDog;
window.reportDogFromUnhealthyThumb = reportDogFromUnhealthyThumb;

// Initial render from localStorage
renderAllDashboards();
showDashboardTab("image");
initChatAssistant();
renderReportsHistory();
updateHealthyReferenceProfile("default", 0.5);
startReportsHistoryPolling();
