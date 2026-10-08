/**
 * anywhere.ai Multi-step Wizard Controller
 */

document.addEventListener("DOMContentLoaded", () => {
    // Wizard State
    const state = {
        destination: "Japan",
        persona: "Couple",
        vibes: ["Food and drink"],
        days: 7,
        durationText: "7 - 8 Days",
        pace: "Balanced",
        cities: ["Tokyo", "Kyoto"],
        budget: "Balanced / Comfort ($$)"
    };

    let currentStep = 1;
    let generatedMarkdown = "";

    // DOM Elements
    const steps = [
        document.getElementById("step-1"),
        document.getElementById("step-2"),
        document.getElementById("step-3"),
        document.getElementById("step-4"),
        document.getElementById("step-5"),
        document.getElementById("step-6"),
        document.getElementById("step-7"),
        document.getElementById("step-8")
    ];

    const crumbs = {
        destination: document.getElementById("crumb-destination"),
        travellers: document.getElementById("crumb-travellers"),
        interests: document.getElementById("crumb-interests"),
        duration: document.getElementById("crumb-duration"),
        pace: document.getElementById("crumb-pace"),
        cities: document.getElementById("crumb-cities"),
        budget: document.getElementById("crumb-budget")
    };

    // STEP 1: Destination Selection
    const destCards = document.querySelectorAll(".dest-card");
    const destSearch = document.getElementById("destSearch");

    destCards.forEach(card => {
        card.addEventListener("click", () => {
            state.destination = card.getAttribute("data-name");
            const citiesAttr = card.getAttribute("data-cities") || "";
            state.cities = citiesAttr.split(",").filter(c => c.trim().length > 0);

            destCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            updateBreadcrumbs();
            goToStep(2);
        });
    });

    if (destSearch) {
        destSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            destCards.forEach(card => {
                const name = card.getAttribute("data-name").toLowerCase();
                if (name.includes(query)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // STEP 2: Travellers Selection
    const travellerCards = document.querySelectorAll(".traveller-card");
    travellerCards.forEach(card => {
        card.addEventListener("click", () => {
            state.persona = card.getAttribute("data-persona");
            travellerCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            updateBreadcrumbs();
            goToStep(3);
        });
    });

    // STEP 3: Vibe (Interests) Selection
    const vibeCards = document.querySelectorAll(".vibe-card");
    const btnGoDuration = document.getElementById("btnGoDuration");

    vibeCards.forEach(card => {
        card.addEventListener("click", () => {
            const vibe = card.getAttribute("data-vibe");
            if (card.classList.contains("active")) {
                card.classList.remove("active");
                state.vibes = state.vibes.filter(v => v !== vibe);
            } else {
                if (state.vibes.length >= 3) {
                    alert("You can select up to 3 travel vibes.");
                    return;
                }
                card.classList.add("active");
                state.vibes.push(vibe);
            }
            updateBreadcrumbs();
        });
    });

    if (btnGoDuration) {
        btnGoDuration.addEventListener("click", () => {
            if (state.vibes.length === 0) {
                state.vibes = ["Food and drink"];
            }
            goToStep(4);
        });
    }

    // STEP 4: Duration Selection
    const durationCards = document.querySelectorAll(".duration-card");
    durationCards.forEach(card => {
        card.addEventListener("click", () => {
            state.days = parseInt(card.getAttribute("data-days")) || 7;
            state.durationText = card.getAttribute("data-text") || "7 - 8 Days";

            durationCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            updateBreadcrumbs();
            goToStep(5);
        });
    });

    // STEP 5: Pace Selection
    const paceCards = document.querySelectorAll(".pace-card");
    paceCards.forEach(card => {
        card.addEventListener("click", () => {
            state.pace = card.getAttribute("data-pace");

            paceCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            updateBreadcrumbs();
            populateCitiesStep();
            goToStep(6);
        });
    });

    // STEP 6: Cities Selection
    function populateCitiesStep() {
        const citiesSub = document.getElementById("citiesSub");
        const container = document.getElementById("citiesContainer");

        if (citiesSub) citiesSub.innerText = `Select cities to visit in ${state.destination}`;
        if (!container) return;

        container.innerHTML = "";
        
        let defaultCities = state.cities.length > 0 ? state.cities : ["Main City 1", "Main City 2", "Main City 3"];

        defaultCities.forEach((city, idx) => {
            const pill = document.createElement("div");
            pill.className = "city-pill active";
            pill.innerText = city;

            pill.addEventListener("click", () => {
                pill.classList.toggle("active");
                if (pill.classList.contains("active")) {
                    if (!state.cities.includes(city)) state.cities.push(city);
                } else {
                    state.cities = state.cities.filter(c => c !== city);
                }
                updateBreadcrumbs();
            });

            container.appendChild(pill);
        });
    }

    const btnGoBudget = document.getElementById("btnGoBudget");
    if (btnGoBudget) {
        btnGoBudget.addEventListener("click", () => {
            goToStep(7);
        });
    }

    // STEP 7: Budget Style
    const budgetCards = document.querySelectorAll(".budget-card");
    budgetCards.forEach(card => {
        card.addEventListener("click", () => {
            state.budget = card.getAttribute("data-budget");
            budgetCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            updateBreadcrumbs();
        });
    });

    const btnGenerateItinerary = document.getElementById("btnGenerateItinerary");
    if (btnGenerateItinerary) {
        btnGenerateItinerary.addEventListener("click", () => {
            goToStep(8);
            generateWizardPlan();
        });
    }

    // Navigation Helper
    function goToStep(stepNumber) {
        currentStep = stepNumber;
        steps.forEach((s, idx) => {
            if (s) {
                if (idx + 1 === stepNumber) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateBreadcrumbs() {
        if (crumbs.destination) {
            crumbs.destination.innerText = state.destination || "Destination";
            crumbs.destination.classList.add("active");
        }
        if (crumbs.travellers) {
            crumbs.travellers.innerText = state.persona || "Travellers";
            if (currentStep >= 2) crumbs.travellers.classList.add("active");
        }
        if (crumbs.interests) {
            crumbs.interests.innerText = state.vibes.length > 0 ? state.vibes.join(", ") : "Interests";
            if (currentStep >= 3) crumbs.interests.classList.add("active");
        }
        if (crumbs.duration) {
            crumbs.duration.innerText = state.durationText || "Duration";
            if (currentStep >= 4) crumbs.duration.classList.add("active");
        }
        if (crumbs.pace) {
            crumbs.pace.innerText = state.pace || "Pace";
            if (currentStep >= 5) crumbs.pace.classList.add("active");
        }
        if (crumbs.cities) {
            crumbs.cities.innerText = state.cities.length > 0 ? state.cities.slice(0, 2).join(", ") : "Cities";
            if (currentStep >= 6) crumbs.cities.classList.add("active");
        }
        if (crumbs.budget) {
            crumbs.budget.innerText = state.budget ? state.budget.split(" ")[0] : "Budget";
            if (currentStep >= 7) crumbs.budget.classList.add("active");
        }
    }

    // STEP 8: Generate Plan Call
    async function generateWizardPlan() {
        const wizardLoading = document.getElementById("wizardLoading");
        const wizardResults = document.getElementById("wizardResults");
        const wizardStatusText = document.getElementById("wizardStatusText");
        const wizardMarkdown = document.getElementById("wizardMarkdown");
        const resTitle = document.getElementById("resTitle");
        const photoGallery = document.getElementById("photoGallery");

        if (wizardLoading) wizardLoading.style.display = "block";
        if (wizardResults) wizardResults.style.display = "none";

        const statusMessages = [
            `Connecting to anywhere.ai Agent...`,
            `Searching top places & weather for ${state.destination}...`,
            `Building day-by-day itineraries for ${state.cities.join(", ")}...`,
            `Estimating budget for ${state.persona} (${state.budget})...`,
            `Finalizing customized itinerary with photo gallery...`
        ];

        let msgIdx = 0;
        const interval = setInterval(() => {
            msgIdx = (msgIdx + 1) % statusMessages.length;
            if (wizardStatusText) wizardStatusText.innerText = statusMessages[msgIdx];
        }, 3000);

        try {
            const response = await fetch("/api/plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination: state.destination,
                    days: state.days,
                    duration_text: state.durationText,
                    persona: state.persona,
                    vibes: state.vibes,
                    pace: state.pace,
                    cities: state.cities,
                    budget_tier: state.budget,
                    provider: "groq"
                })
            });

            clearInterval(interval);

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to generate itinerary.");
            }

            const data = await response.json();
            generatedMarkdown = data.itinerary_markdown;

            if (resTitle) resTitle.innerText = `${state.destination} (${state.durationText}) - ${state.persona} Special`;

            // Populate Photo Gallery
            if (photoGallery) {
                photoGallery.innerHTML = `
                    <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=80" alt="${state.destination}">
                    <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&auto=format&fit=crop&q=80" alt="Attraction">
                    <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80" alt="Dining">
                    <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&auto=format&fit=crop&q=80" alt="Scenery">
                `;
            }

            // Render Markdown
            if (window.marked) {
                wizardMarkdown.innerHTML = window.marked.parse(generatedMarkdown);
            } else {
                wizardMarkdown.innerText = generatedMarkdown;
            }

            if (wizardLoading) wizardLoading.style.display = "none";
            if (wizardResults) wizardResults.style.display = "block";

        } catch (err) {
            clearInterval(interval);
            if (wizardLoading) wizardLoading.style.display = "none";
            alert("Error: " + err.message);
        }
    }

    // Download Button
    const btnDownloadMd = document.getElementById("btnDownloadMd");
    if (btnDownloadMd) {
        btnDownloadMd.addEventListener("click", () => {
            if (!generatedMarkdown) return;
            const blob = new Blob([generatedMarkdown], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `anywhereai_Trip_Plan_${state.destination}_${new Date().toISOString().slice(0, 10)}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Breadcrumb clicks to navigate back
    if (crumbs.destination) crumbs.destination.addEventListener("click", () => goToStep(1));
    if (crumbs.travellers) crumbs.travellers.addEventListener("click", () => goToStep(2));
    if (crumbs.interests) crumbs.interests.addEventListener("click", () => goToStep(3));
    if (crumbs.duration) crumbs.duration.addEventListener("click", () => goToStep(4));
    if (crumbs.pace) crumbs.pace.addEventListener("click", () => goToStep(5));
    if (crumbs.cities) crumbs.cities.addEventListener("click", () => goToStep(6));
    if (crumbs.budget) crumbs.budget.addEventListener("click", () => goToStep(7));
});
