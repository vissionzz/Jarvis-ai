// ======================================
// J.A.R.V.I.S. AI - MAIN SCRIPT
// ======================================

const API_URL = "https://jarvis-ai-8gsc.onrender.com/api/chat";

const micBtn = document.getElementById("micBtn");
const stopBtn = document.getElementById("stopBtn");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");

const chatMessages = document.getElementById("chatMessages");
const statusText = document.getElementById("status");
const messageText = document.getElementById("message");

// ======================================
// STATUS
// ======================================

function setStatus(text) {
    if (statusText) {
        statusText.textContent = text;
    }

    if (messageText) {
        messageText.textContent = text;
    }
}

// ======================================
// CHAT MESSAGES
// ======================================

function addMessage(sender, text) {
    const message = document.createElement("p");

    message.textContent = sender + ": " + text;

    if (chatMessages) {
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ======================================
// JARVIS VOICE
// ======================================

let selectedVoice = null;

function chooseVoice() {
    const voices = window.speechSynthesis.getVoices();

    // Prefer voices commonly presented as male.
    const preferredNames = [
        "Microsoft David",
        "Google UK English Male",
        "Microsoft Guy",
        "Daniel",
        "David",
        "Mark",
        "Alex"
    ];

    selectedVoice = null;

    for (const preferred of preferredNames) {
        selectedVoice = voices.find(voice =>
            voice.name.toLowerCase().includes(
                preferred.toLowerCase()
            )
        );

        if (selectedVoice) break;
    }

    // Otherwise use an available English voice.
    if (!selectedVoice) {
        selectedVoice =
            voices.find(voice =>
                voice.lang.toLowerCase().startsWith("en")
            ) || voices[0] || null;
    }
}

if ("speechSynthesis" in window) {
    chooseVoice();

    window.speechSynthesis.onvoiceschanged = chooseVoice;
}

function speak(text) {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    speech.lang = selectedVoice?.lang || "en-US";
    speech.rate = 0.95;
    speech.pitch = 0.85;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
}

// ======================================
// SEND MESSAGE TO THE AI BRAIN
// ======================================

let isThinking = false;

async function askJarvis(text) {
    const question = text.trim();

    if (!question || isThinking) {
        return;
    }

    isThinking = true;

    addMessage("YOU", question);
    setStatus("THINKING...");

    if (userInput) {
        userInput.value = "";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The AI request failed."
            );
        }

        const reply = data.reply || "I have no response.";

        addMessage("JARVIS", reply);
        setStatus("SYSTEM ONLINE");

        speak(reply);

    } catch (error) {
        console.error("JARVIS error:", error);

        addMessage(
            "SYSTEM",
            "I could not connect to my AI brain. Please check the backend and API configuration."
        );

        setStatus("CONNECTION ERROR");

    } finally {
        isThinking = false;
    }
}

// ======================================
// SEND BUTTON
// ======================================

if (sendBtn) {
    sendBtn.addEventListener("click", () => {
        askJarvis(userInput.value);
    });
}

// Send with the Enter key.
if (userInput) {
    userInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            askJarvis(userInput.value);
        }
    });
}

// ======================================
// MICROPHONE / VOICE RECOGNITION
// ======================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;
let listening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        listening = true;
        setStatus("LISTENING...");
    };

    recognition.onresult = event => {
        const spokenText =
            event.results[0][0].transcript;

        if (userInput) {
            userInput.value = spokenText;
        }

        askJarvis(spokenText);
    };

    recognition.onerror = event => {
        console.error("Microphone error:", event.error);

        if (event.error === "not-allowed") {
            setStatus("MICROPHONE PERMISSION DENIED");
        } else {
            setStatus("VOICE INPUT ERROR");
        }
    };

    recognition.onend = () => {
        listening = false;

        if (!isThinking) {
            setStatus("SYSTEM ONLINE");
        }
    };

} else {
    console.warn(
        "Speech recognition is not supported by this browser."
    );
}

// Activate microphone.
if (micBtn) {
    micBtn.addEventListener("click", () => {
        if (!recognition) {
            alert(
                "Voice recognition is not supported by this browser. Try Google Chrome."
            );
            return;
        }

        if (listening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            console.error(error);
        }
    });
}

// Stop listening and speaking.
if (stopBtn) {
    stopBtn.addEventListener("click", () => {
        if (recognition && listening) {
            recognition.stop();
        }

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        setStatus("SYSTEM ONLINE");
    });
}

// ======================================
// STARTUP
// ======================================

setStatus("SYSTEM ONLINE");

console.log("JARVIS AI initialized.");
