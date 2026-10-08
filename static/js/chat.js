/**
 * anywhere.ai Floating Chat Widget
 * Handles open/close, message sending, typing indicator,
 * suggestion chips, and conversation history.
 */

document.addEventListener("DOMContentLoaded", () => {
    const trigger     = document.getElementById("chatTrigger");
    const panel       = document.getElementById("chatPanel");
    const closeBtn    = document.getElementById("chatCloseBtn");
    const messages    = document.getElementById("chatMessages");
    const input       = document.getElementById("chatInput");
    const sendBtn     = document.getElementById("chatSendBtn");
    const typingEl    = document.getElementById("chatTyping");
    const chipsEl     = document.getElementById("chatChips");

    if (!trigger || !panel) return;

    // ── State ────────────────────────────────────────────────────────────
    let isOpen     = false;
    let isLoading  = false;
    let history    = [];   // [{role: "user"|"assistant", content: "..."}]

    // ── Open / Close ─────────────────────────────────────────────────────
    function openChat() {
        isOpen = true;
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        trigger.setAttribute("aria-expanded", "true");
        // Hide pulse once opened
        const pulse = trigger.querySelector(".chat-trigger-pulse");
        if (pulse) pulse.style.display = "none";
        // Focus input
        setTimeout(() => input && input.focus(), 350);
        scrollToBottom();
    }

    function closeChat() {
        isOpen = false;
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", () => isOpen ? closeChat() : openChat());
    if (closeBtn) closeBtn.addEventListener("click", closeChat);

    // Close on Escape
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && isOpen) closeChat();
    });

    // ── Suggestion Chips ─────────────────────────────────────────────────
    if (chipsEl) {
        chipsEl.querySelectorAll(".chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const query = chip.getAttribute("data-query");
                if (query) {
                    // Remove chips after first use
                    chipsEl.style.transition = "opacity 0.2s";
                    chipsEl.style.opacity = "0";
                    setTimeout(() => chipsEl.remove(), 220);
                    sendMessage(query);
                }
            });
        });
    }

    // ── Send on Enter / Button ────────────────────────────────────────────
    if (input) {
        input.addEventListener("keydown", e => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
    }
    if (sendBtn) sendBtn.addEventListener("click", handleSend);

    function handleSend() {
        const text = input ? input.value.trim() : "";
        if (!text || isLoading) return;
        if (input) input.value = "";
        sendMessage(text);
    }

    // ── Core Send Function ────────────────────────────────────────────────
    async function sendMessage(text) {
        if (isLoading) return;

        // Show user bubble
        appendBubble("user", text);
        history.push({ role: "user", content: text });

        // Lock input
        isLoading = true;
        if (sendBtn) sendBtn.disabled = true;
        if (input)   input.disabled   = true;

        // Show typing indicator
        showTyping(true);
        scrollToBottom();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: history.slice(-8),   // last 4 exchanges
                    provider: "groq"
                })
            });

            showTyping(false);

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Server error ${res.status}`);
            }

            const data = await res.json();
            const reply = data.reply || "Sorry, I couldn't generate a response. Please try again.";

            appendBubble("assistant", reply);
            history.push({ role: "assistant", content: reply });

        } catch (err) {
            showTyping(false);
            appendBubble("assistant", `⚠️ ${err.message || "Something went wrong. Please try again."}`);
        } finally {
            isLoading = false;
            if (sendBtn) sendBtn.disabled = false;
            if (input)   { input.disabled = false; input.focus(); }
            scrollToBottom();
        }
    }

    // ── Append Message Bubble ─────────────────────────────────────────────
    function appendBubble(role, text) {
        const wrapper = document.createElement("div");
        wrapper.className = `chat-msg chat-msg-${role === "user" ? "user" : "bot"}`;

        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";

        // Render markdown if available
        if (role === "assistant" && window.marked) {
            bubble.innerHTML = window.marked.parse(text);
        } else {
            bubble.textContent = text;
        }

        const time = document.createElement("span");
        time.className = "chat-time";
        time.textContent = getTimeLabel();

        wrapper.appendChild(bubble);
        wrapper.appendChild(time);
        messages.appendChild(wrapper);

        scrollToBottom();
    }

    // ── Typing Indicator ──────────────────────────────────────────────────
    function showTyping(visible) {
        if (!typingEl) return;
        typingEl.style.display = visible ? "block" : "none";
        if (visible) scrollToBottom();
    }

    // ── Scroll to Bottom ──────────────────────────────────────────────────
    function scrollToBottom() {
        if (!messages) return;
        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
        });
    }

    // ── Time Label ────────────────────────────────────────────────────────
    function getTimeLabel() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
});
