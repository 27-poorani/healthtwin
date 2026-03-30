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

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("dog_id", dogId);

    fetch("/predict", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        const label = data.prediction;
        const health = data.health_status || data.prediction;
        const prob = Number(data.healthy_probability);
        const threshold = Number(data.baseline_threshold);

        const out = document.getElementById("predictionResult");
        if (out) {
            out.innerHTML =
                `<div class="result-head">
                    <div>
                        <div class="result-title">Image Result</div>
                        <div class="card-subtitle">Predicted class: ${escapeHtml(label)}</div>
                    </div>
                    <div class="result-badge ${health === "Healthy" ? "good" : "bad"}">${escapeHtml(health)}</div>
                </div>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Healthy Probability</div>
                        <div class="result-value">${isFinite(prob) ? prob.toFixed(6) : "-"}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Baseline Threshold</div>
                        <div class="result-value">${isFinite(threshold) ? threshold.toFixed(6) : "-"}</div>
                    </div>
                </div>`;
        }

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

    const formData = new FormData();
    formData.append("file", videoInput.files[0]);
    formData.append("dog_id", dogId);

    fetch("/predict_video", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        const results = data.results || [];
        const unhealthyThumbs = data.unhealthy_thumbnails || [];
        const threshold = Number(data.baseline_threshold);

        const stats = computeVideoOverall(results);

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
                `<div class="result-head">
                    <div>
                        <div class="result-title">Video Result</div>
                        <div class="card-subtitle">Frame extraction: every 1 second</div>
                    </div>
                    <div class="result-badge ${stats.overall === "Healthy" ? "good" : "bad"}">${escapeHtml(stats.overall)}</div>
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
                </details>`;
        }

        // Render unhealthy frame thumbnails (if any).
        const gallery = document.getElementById("unhealthyFrameGallery");
        if (gallery) {
            if (!unhealthyThumbs.length) {
                gallery.innerHTML = `<div class="empty-state">No Unhealthy frames found in the sampled intervals.</div>`;
            } else {
                gallery.innerHTML =
                    `<div class="gallery-title">Unhealthy Frame Images</div>` +
                    unhealthyThumbs.map(t => {
                        const imgSrc = `data:image/jpeg;base64,${t.image_base64}`;
                        return `
                            <div class="thumb-item">
                                <img class="thumb-img" src="${imgSrc}" alt="Unhealthy frame ${t.frame_index}" />
                                <div class="thumb-meta">
                                    Frame ${t.frame_index} (${t.time_seconds}s)
                                    <br />
                                    Disease: ${escapeHtml(t.predicted_label || "-")}
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
}

// Expose functions for onclick
window.uploadImage = uploadImage;
window.uploadVideo = uploadVideo;
window.clearPredictionHistory = clearPredictionHistory;
window.showDashboardTab = showDashboardTab;
window.downloadCurrentVideoCSV = downloadCurrentVideoCSV;
window.downloadStoredVideoCSV = downloadStoredVideoCSV;

// Initial render from localStorage
renderAllDashboards();
showDashboardTab("image");
initChatAssistant();
