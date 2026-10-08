/**
 * anywhere.ai Travel Planner - Structured Itinerary Frontend
 * Renders AI markdown output as a beautiful day-card layout (screenshot 2 style)
 */

// ── Image maps ─────────────────────────────────────────────────────────────
const DEST_IMAGES = {
    tokyo:       "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80",
    kyoto:       "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop&q=80",
    osaka:       "https://images.unsplash.com/photo-1589893461700-a2bc34ceb6a9?w=400&auto=format&fit=crop&q=80",
    bali:        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80",
    ubud:        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop&q=80",
    singapore:   "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&auto=format&fit=crop&q=80",
    paris:       "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80",
    switzerland: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&auto=format&fit=crop&q=80",
    interlaken:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80",
    maldives:    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&auto=format&fit=crop&q=80",
    thailand:    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&auto=format&fit=crop&q=80",
    phuket:      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&auto=format&fit=crop&q=80",
    finland:     "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&auto=format&fit=crop&q=80",
    rome:        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80",
    london:      "https://images.unsplash.com/photo-1543799897-49f75a9e7f1f?w=400&auto=format&fit=crop&q=80",
    dubai:       "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&auto=format&fit=crop&q=80",
    barcelona:   "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&auto=format&fit=crop&q=80",
    amsterdam:   "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&auto=format&fit=crop&q=80",
};

const ACTIVITY_IMAGES = {
    food:       "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80",
    culture:    "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=300&auto=format&fit=crop&q=80",
    attraction: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&auto=format&fit=crop&q=80",
    adventure:  "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=300&auto=format&fit=crop&q=80",
    hotel:      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80",
    transport:  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80",
    arrival:    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80",
    leisure:    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80",
    default:    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&auto=format&fit=crop&q=80"
};

const TRANSIT_ICONS = { train:"🚄", fly:"✈️", car:"🚗", ferry:"⛴️", bus:"🚌", default:"🚌" };

// ── Utility ────────────────────────────────────────────────────────────────
function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""; }

function getDestImage(city) {
    const key = city.toLowerCase().replace(/\s+/g, "");
    return Object.keys(DEST_IMAGES).find(k => key.includes(k))
        ? DEST_IMAGES[Object.keys(DEST_IMAGES).find(k => key.includes(k))]
        : null;
}

function getActivityImage(text, city) {
    const t = text.toLowerCase();
    // Check city image first
    const ci = getDestImage(city);
    if (ci) return ci;
    if (/airport|arrival|depart|fly|flight/.test(t))         return ACTIVITY_IMAGES.arrival;
    if (/food|eat|restaur|lunch|dinner|breakfast|drink|cafe|cuisine/.test(t)) return ACTIVITY_IMAGES.food;
    if (/museum|temple|shrine|castle|palace|histor|art|gallery/.test(t))      return ACTIVITY_IMAGES.culture;
    if (/hotel|check.in|check.out|resort|stay|accommodation/.test(t))         return ACTIVITY_IMAGES.hotel;
    if (/train|bus|transfer|taxi/.test(t))                   return ACTIVITY_IMAGES.transport;
    if (/adventure|hike|trek|climb|surf|dive/.test(t))       return ACTIVITY_IMAGES.adventure;
    if (/beach|relax|leisure|free time|pool|spa/.test(t))    return ACTIVITY_IMAGES.leisure;
    return ACTIVITY_IMAGES.default;
}

function detectCategory(text) {
    const t = text.toLowerCase();
    if (/food|eat|restaur|lunch|dinner|breakfast|drink|cafe|cuisine|street food/.test(t)) return "food";
    if (/museum|temple|shrine|castle|palace|histor|art|gallery|culture/.test(t))          return "culture";
    if (/hotel|check.in|check.out|resort|stay/.test(t))                                   return "hotel";
    if (/adventure|hike|trek|climb|surf|dive/.test(t))                                    return "adventure";
    if (/at leisure|free time|relax|rest/.test(t))                                         return "leisure";
    return "attraction";
}

function detectTime(text) {
    const t = text.toLowerCase();
    if (/morning to noon|morning to afternoon/.test(t)) return "morning to noon";
    if (/full.?day/.test(t)) return "full day";
    if (/morning/.test(t))   return "morning";
    if (/afternoon|noon/.test(t)) return "afternoon";
    if (/evening/.test(t))   return "evening";
    if (/night/.test(t))     return "night";
    return "";
}

// ── Main App ───────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    let selectedPersona = "Couple";
    let generatedMarkdown = "";

    const personaPills    = document.querySelectorAll(".persona-pill");
    const personaInput    = document.getElementById("personaInput");
    const destinationInput= document.getElementById("destinationInput");
    const daysSelect      = document.getElementById("daysSelect");
    const budgetSelect    = document.getElementById("budgetSelect");
    const planForm        = document.getElementById("planForm");
    const btnGenerate     = document.getElementById("btnGenerate");
    const loadingOverlay  = document.getElementById("loadingOverlay");
    const loadingStatusText=document.getElementById("loadingStatusText");
    const resultsSection  = document.getElementById("resultsSection");
    const itineraryMain   = document.getElementById("itineraryMain");
    const routeList       = document.getElementById("routeList");
    const btnDownload     = document.getElementById("btnDownload");
    const packageCards    = document.querySelectorAll(".btn-package-plan");
    const resSectionTitle = document.getElementById("resSectionTitle");

    // ── Persona Selection ────────────────────────────────────────────────
    personaPills.forEach(pill => {
        pill.addEventListener("click", () => {
            personaPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            selectedPersona = pill.getAttribute("data-persona");
            if (personaInput) personaInput.value = selectedPersona;
        });
    });

    // ── Package Customize ────────────────────────────────────────────────
    packageCards.forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            if (destinationInput) destinationInput.value = btn.getAttribute("data-dest");
            if (daysSelect) daysSelect.value = btn.getAttribute("data-days");
            personaPills.forEach(p => { if (p.getAttribute("data-persona") === btn.getAttribute("data-persona")) p.click(); });
            window.scrollTo({ top: 300, behavior: "smooth" });
            generateTravelPlan();
        });
    });

    // ── Form Submission ──────────────────────────────────────────────────
    planForm.addEventListener("submit", e => { e.preventDefault(); generateTravelPlan(); });

    // ── Generate ─────────────────────────────────────────────────────────
    async function generateTravelPlan() {
        const destination = destinationInput.value.trim();
        const days = parseInt(daysSelect.value) || 5;
        const budget = budgetSelect.value || "Moderate";

        if (!destination) { alert("Please enter a destination."); destinationInput.focus(); return; }

        resultsSection.style.display = "none";
        loadingOverlay.style.display = "flex";
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `<span>Planning...</span>`;

        const msgs = [
            `Connecting to anywhere.ai Agent...`,
            `Searching live attractions & weather for ${destination}...`,
            `Building day-by-day itinerary with activities...`,
            `Computing hotel options & budget breakdown...`,
            `Finalizing your custom travel plan...`
        ];
        let mi = 0;
        const si = setInterval(() => { mi = (mi+1)%msgs.length; if (loadingStatusText) loadingStatusText.innerText = msgs[mi]; }, 2500);

        try {
            const res = await fetch("/api/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destination, days, persona: selectedPersona, budget_tier: budget, provider: "groq" })
            });
            clearInterval(si);
            if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Failed."); }

            const data = await res.json();
            generatedMarkdown = data.itinerary_markdown;

            if (resSectionTitle) resSectionTitle.innerText = `${destination} — ${days} Day ${selectedPersona} Itinerary`;
            document.getElementById("markdownContent").innerText = generatedMarkdown;

            renderStructuredItinerary(generatedMarkdown, destination, days);

            loadingOverlay.style.display = "none";
            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth" });
        } catch(err) {
            clearInterval(si);
            loadingOverlay.style.display = "none";
            alert("Error: " + err.message);
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = `🚀 <span>Plan My Trip</span>`;
        }
    }

    // ── RENDER STRUCTURED ITINERARY ───────────────────────────────────────
    function renderStructuredItinerary(markdown, destination, totalDays) {
        if (!itineraryMain) return;
        itineraryMain.innerHTML = "";

        // Parse the markdown into structured day data
        const days = parseMarkdownToDays(markdown, destination, totalDays);

        if (days.length === 0) {
            // Fallback: render pretty markdown
            const mb = document.createElement("div");
            mb.className = "markdown-body";
            mb.innerHTML = window.marked ? window.marked.parse(markdown) : markdown;
            itineraryMain.appendChild(mb);
            return;
        }

        // Group days by city
        const cityGroups = groupDaysByCity(days, destination);

        // Build route sidebar
        buildRouteSidebar(cityGroups);

        // Render city sections
        cityGroups.forEach((group, gi) => {
            const section = buildCitySection(group, gi, cityGroups);
            itineraryMain.appendChild(section);

            // Transit connector between cities
            if (gi < cityGroups.length - 1) {
                itineraryMain.appendChild(buildTransitConnector(cityGroups[gi+1]));
            }
        });
    }

    // ── Parse Markdown to Day Objects ─────────────────────────────────────
    function parseMarkdownToDays(markdown, destination, totalDays) {
        const lines = markdown.split("\n");
        const days = [];
        let currentDay = null;
        let inTable = false;

        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();

            // Skip separator lines & empty
            if (!line || /^[-|:]{3,}$/.test(line) || /^\|[-\s|:]+\|$/.test(line)) {
                if (/^\|[-\s|:]+\|$/.test(line)) inTable = true;
                continue;
            }

            // ── Day heading detection: ### Day 1, ## DAY 1, #### Day 1, etc.
            const dayMatch = line.match(/^#{1,4}\s*(?:day|d)[.\s\-–—]*(\d+)[:\s\-–—]*(.*)/i);
            if (dayMatch) {
                const dayNum = parseInt(dayMatch[1]);
                const title = (dayMatch[2] || "").replace(/\*+/g,"").trim();
                currentDay = { num: dayNum, title, city: destination, activities: [], transit: null };
                days.push(currentDay);
                inTable = false;
                continue;
            }

            if (!currentDay) continue;

            // ── Table row (e.g. | **08:00** | Breakfast at Café... | ...)
            if (line.startsWith("|") && inTable) {
                const cells = line.split("|").map(c => c.replace(/\*+/g,"").replace(/\[.*?\]/g,"").trim()).filter(c => c);
                if (cells.length >= 2) {
                    // First cell = time, rest = activity
                    const timeCell = cells[0];
                    const actCell = cells[1] || "";
                    if (!timeCell.toLowerCase().includes("time") && !timeCell.toLowerCase().includes("meal") && actCell.length > 3) {
                        const cleanAct = actCell.replace(/–|—/g, "-").trim();
                        if (cleanAct.length > 4 && !cleanAct.toLowerCase().startsWith("hidden") && !cleanAct.toLowerCase().startsWith("highlights")) {
                            currentDay.activities.push({
                                title: cleanAct.length > 120 ? cleanAct.slice(0, 117) + "…" : cleanAct,
                                time: normaliseTime(timeCell),
                                category: detectCategory(cleanAct),
                                isLeisure: /at leisure|free time/i.test(cleanAct)
                            });
                        }
                    }
                }
            }

            // Start table detection
            if (line.startsWith("|") && !inTable) inTable = true;

            // ── Bullet points (- Morning: ...)
            const bullet = line.match(/^[-*•]\s+(.*)/);
            if (bullet) {
                inTable = false;
                const text = bullet[1].replace(/\*+/g,"").replace(/\[.*?\]/g,"").trim();
                if (text.length > 4) {
                    currentDay.activities.push({
                        title: text.length > 120 ? text.slice(0,117)+"…" : text,
                        time: detectTime(text),
                        category: detectCategory(text),
                        isLeisure: /at leisure|free time/i.test(text)
                    });
                }
            }

            // ── Transit hint (e.g. "Transfer by train to Kyoto")
            if (/transfer|travel route|transit|ride to/i.test(line)) {
                const cityHint = line.match(/to\s+([A-Z][a-z]+)/);
                if (cityHint && currentDay) currentDay.nextCity = cityHint[1];
                const transitType = detectTransitType(line);
                if (currentDay) currentDay.transitToNext = transitType;
            }
        }

        return days;
    }

    function normaliseTime(raw) {
        const t = raw.replace(/\*+/g,"").trim().toLowerCase();
        if (/morning.*noon|morning.*after/.test(t)) return "morning to noon";
        if (/full.?day|all.?day/.test(t)) return "full day";
        if (/morning|08:|09:|10:|11:/.test(t)) return "morning";
        if (/afternoon|noon|12:|13:|14:|15:|16:/.test(t)) return "afternoon";
        if (/evening|17:|18:|19:|20:/.test(t)) return "evening";
        if (/night|21:|22:|23:/.test(t)) return "night";
        return t.length < 20 ? t : "";
    }

    function detectTransitType(text) {
        const t = text.toLowerCase();
        if (/fly|flight|airport|plane/.test(t)) return "fly";
        if (/train|shinkansen|rail|metro/.test(t)) return "train";
        if (/ferry|boat|cruise/.test(t)) return "ferry";
        if (/bus|coach/.test(t)) return "bus";
        if (/car|drive|taxi/.test(t)) return "car";
        return "train";
    }

    // ── Group Days by City ───────────────────────────────────────────────
    function groupDaysByCity(days, destination) {
        // Try to find city boundaries from nextCity hints
        const groups = [];
        let currentGroup = { city: cap(destination), days: [], transit: null };

        days.forEach(day => {
            // Detect city change
            if (day.nextCity && day.nextCity.toLowerCase() !== currentGroup.city.toLowerCase()) {
                if (currentGroup.days.length > 0) groups.push(currentGroup);
                currentGroup = { city: cap(day.nextCity), days: [], transit: day.transitToNext || "train" };
            }
            currentGroup.days.push(day);
        });
        if (currentGroup.days.length > 0) groups.push(currentGroup);

        return groups;
    }

    // ── Build City Section DOM ────────────────────────────────────────────
    function buildCitySection(group, gi, allGroups) {
        const section = document.createElement("div");
        section.className = "city-section";
        section.id = `city-${gi}`;

        const nightsText = group.days.length > 0 ? ` — ${group.days.length} NIGHT${group.days.length > 1 ? "S" : ""}` : "";
        section.innerHTML = `
            <div class="city-section-header">
                <span class="city-section-name">${group.city.toUpperCase()}</span>
                <span class="city-nights-badge">${nightsText}</span>
            </div>
        `;

        group.days.forEach(day => {
            const row = document.createElement("div");
            row.className = "day-row";

            // Day label
            const label = document.createElement("div");
            label.className = "day-label";
            label.innerHTML = `<span>Day</span><span class="day-num">${String(day.num).padStart(2, "0")}</span>`;
            row.appendChild(label);

            // Activities
            const actWrap = document.createElement("div");
            actWrap.className = "day-activities";

            // Limit to 4 activities for clean layout
            const displayActs = day.activities.slice(0, 4);
            if (displayActs.length === 0) {
                actWrap.innerHTML = `<div class="activity-add">+ Add Activity</div>`;
            } else {
                displayActs.forEach(act => actWrap.appendChild(buildActivityCard(act, group.city)));
            }

            row.appendChild(actWrap);
            section.appendChild(row);
        });

        return section;
    }

    // ── Build Activity Card DOM ───────────────────────────────────────────
    function buildActivityCard(act, city) {
        const card = document.createElement("div");
        card.className = "activity-card";

        const img = getActivityImage(act.title, city);
        const timeTag  = act.time ? `<span class="tag tag-time">${act.time.toUpperCase()}</span>` : "";
        const catTag   = act.category && !act.isLeisure ? `<span class="tag tag-${act.category}">${act.category.toUpperCase()}</span>` : "";

        if (act.isLeisure) {
            card.innerHTML = `
                <div class="activity-body" style="padding:18px 14px 14px;">
                    <div class="activity-tags">${timeTag}</div>
                    <p class="activity-title" style="color:var(--text-muted);font-style:italic;">At leisure</p>
                </div>
                <div class="activity-add">+ Add Activity</div>
            `;
        } else {
            card.innerHTML = `
                <img class="activity-img" src="${img}" alt="${act.title}" loading="lazy">
                <div class="activity-body">
                    <div class="activity-tags">${timeTag}${catTag}</div>
                    <p class="activity-title">${act.title}</p>
                </div>
            `;
        }

        return card;
    }

    // ── Transit Connector ─────────────────────────────────────────────────
    function buildTransitConnector(nextGroup) {
        const transit = nextGroup.transit || "train";
        const icon = TRANSIT_ICONS[transit] || TRANSIT_ICONS.default;
        const el = document.createElement("div");
        el.className = "transit-connector";
        el.innerHTML = `
            <div class="transit-line"></div>
            <div class="transit-icon-wrap">${icon}</div>
            <div class="transit-line"></div>
            <span>${cap(transit)} ride to ${nextGroup.city}</span>
        `;
        return el;
    }

    // ── Route Sidebar ─────────────────────────────────────────────────────
    function buildRouteSidebar(groups) {
        if (!routeList) return;
        routeList.innerHTML = "";
        groups.forEach((group, idx) => {
            const item = document.createElement("div");
            item.className = "route-item";

            item.innerHTML = `
                <div class="route-stop">
                    <div class="route-dot"></div>
                    <span class="route-city">${group.city}</span>
                </div>
            `;

            if (idx < groups.length - 1) {
                const transit = groups[idx+1].transit || "train";
                const icon = TRANSIT_ICONS[transit] || "🚌";
                item.innerHTML += `
                    <div class="route-transit">
                        <div class="route-transit-line"></div>
                        <span>${icon} Transfer by ${transit}</span>
                    </div>
                `;
            }

            routeList.appendChild(item);
        });
    }

    // ── Download ──────────────────────────────────────────────────────────
    if (btnDownload) {
        btnDownload.addEventListener("click", () => {
            if (!generatedMarkdown) return;
            const blob = new Blob([generatedMarkdown], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `anywhereai_Trip_Plan_${new Date().toISOString().slice(0,10)}.md`;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
        });
    }
});
