
// ==========================================
// 1. THE DATABASE: "Complete the Look" (Cross-selling)
// ==========================================

const scenarioData = {
    start: {
        customerText: "I'll take the navy blue suit. It fits perfectly and it's exactly what I need for my friend's outdoor wedding next weekend.",
        options: [
            { text: "Great choice! The register is right over here, I can ring that up for you.", nextStep: "passiveMiss", isOptimal: false, moodChange: -5, feedback: "A massive missed opportunity. They are going to a wedding—they absolutely need accessories. You just acted as a cashier, not a stylist.", imageUrl: "images/neutral-customer.jpg" },
            { text: "It looks fantastic on you. Just out of curiosity, what color shoes are you planning to wear with it?", nextStep: "activeDiscovery", isOptimal: true, moodChange: 15, feedback: "Brilliant opening. You asked a 'Discovery Question' that naturally bridges the gap to accessories without sounding like a sales pitch." },
            { text: "You should also buy this $80 silk tie to go with it. Everyone needs a tie for a wedding.", nextStep: "pushyReaction", isOptimal: false, moodChange: -20, feedback: "Too aggressive. You are pitching products blindly without knowing what the customer already owns or what look they are going for.", imageUrl: "images/angry-customer.jpg" }
        ]
    },

    // PATH: The employee was too passive
    passiveMiss: {
        customerText: "Awesome, here is my card.",
        options: [
            { text: "[Process the payment and hand them the receipt]", nextStep: "partialSuccess", isOptimal: false, moodChange: 0, feedback: "You secured the primary sale, but completely failed to maximize the basket size or provide styling value." },
            { text: "Before I swipe this, I noticed you mentioned an outdoor wedding. Do you already have a pocket square to add a pop of color to the navy?", nextStep: "activeDiscovery", isOptimal: true, moodChange: 15, feedback: "Great save! You caught the interaction before the payment processed and offered a highly relevant, low-pressure suggestion." }
        ]
    },

    // PATH: The employee was too pushy
    pushyReaction: {
        customerText: "Actually, the invitation says 'Smart Casual', so I wasn't even planning on wearing a tie. I'll just take the suit, thanks.",
        options: [
            { text: "Suit yourself. I'll ring it up.", nextStep: "partialSuccess", isOptimal: false, moodChange: -15, feedback: "You let the customer's defensiveness shut down the interaction. Always try to pivot smoothly." },
            { text: "Smart casual is a great look. In that case, skip the tie! Have you thought about a crisp white linen shirt underneath instead of a standard dress shirt?", nextStep: "activeDiscovery", isOptimal: true, moodChange: 20, feedback: "Excellent pivot. You validated their choice, dropped the tie, and suggested an item that actually fits their specific dress code." }
        ]
    },

    // PATH: The core consultative path
    activeDiscovery: {
        customerText: "I'm wearing a pair of light brown leather loafers I already have at home.",
        options: [
            { text: "Light brown is perfect with navy. We actually just got these woven leather belts in that match that shade exactly. It ties the whole outfit together.", nextStep: "priceObjection", isOptimal: true, moodChange: 15, feedback: "Perfect 'Complete the Look' technique. You connected a product you sell directly to an item they already own." },
            { text: "You definitely need a new belt then. Pick one from that wall over there.", nextStep: "passiveMiss", isOptimal: false, moodChange: -15, feedback: "The customer is asking for your expertise as a stylist. Pointing at a wall provides zero value.", imageUrl: "images/angry-customer.jpg" }
        ]
    },

    priceObjection: {
        customerText: "That belt does match nicely. But I already have a black belt at home I usually wear. I'll probably just use that.",
        options: [
            { text: "A black belt with brown shoes? You can't do that, it clashes terribly.", nextStep: "snobbyReaction", isOptimal: false, moodChange: -25, feedback: "Never insult the customer's fashion sense! You can educate them without making them feel stupid.", imageUrl: "images/angry-customer.jpg" },
            { text: "A black belt is a classic, but traditionally, matching your belt to your shoes creates a much cleaner, elevated look for photos.", nextStep: "closingSuccess", isOptimal: true, moodChange: 20, feedback: "Flawless styling advice. You educated the customer gently and gave them a compelling reason (wedding photos) to upgrade." },
            { text: "Okay, no problem. Just the suit then.", nextStep: "partialSuccess", isOptimal: false, moodChange: -10, feedback: "You gave up too easily! Customers often need a little styling encouragement to step out of their comfort zone." }
        ]
    },

    snobbyReaction: {
        customerText: "Wow. Okay. I didn't ask for a fashion critique, I just said I didn't want the belt. Just ring up the suit.",
        options: [
            { text: "Ring up the suit.", nextStep: "partialSuccess", isOptimal: true, moodChange: 0, feedback: "You salvaged the primary sale, but your attitude killed the upsell and the customer left annoyed." }
        ]
    },

    closingSuccess: {
        customerText: "You know what, you're right. I'll be in a lot of photos next weekend. Toss the brown belt in there too.",
        options: [
            { text: "Will do. That's a great looking outfit.", nextStep: "successScenario", isOptimal: false, moodChange: 5, feedback: "Good job closing the belt, but an outdoor wedding is the perfect excuse for a 'double-upsell' (sunglasses or socks)." },
            { text: "Done. And since it's an outdoor wedding, grab a pair of these tortoiseshell sunglasses on your way to the register. You'll thank me when the sun is in your eyes during the ceremony!", nextStep: "doubleUpsellSuccess", isOptimal: true, moodChange: 15, feedback: "Incredible! You secured the primary cross-sell, and confidently added a high-margin accessory using the event as justification.", imageUrl: "images/happy-customer.jpg" }
        ]
    },

    // Endings
    failScenario: {
        customerText: "<em>[Simulation Failed. The customer left without buying anything.]</em>",
        options: [{ text: "Restart Simulation", nextStep: "start" }]
    },
    partialSuccess: {
        customerText: "<em>[Partial Success. You sold the suit, but missed the optimal 'Complete the Look' styling opportunity.]</em>",
        options: [{ text: "Complete Module", nextStep: "start" }]
    },
    successScenario: {
        customerText: "<em>[Success! You acted as a true stylist, increasing the basket size and building customer loyalty.]</em>",
        options: [{ text: "Complete Module", nextStep: "start" }]
    },
    doubleUpsellSuccess: {
        customerText: "<em>[Incredible Success! Suit, Belt, and Sunglasses sold. Perfect consultative styling.]</em>",
        options: [{ text: "Complete Module", nextStep: "start" }]
    }
};
// ==========================================
// 2. THE ENGINE (Identical to Difficult Return)
// ==========================================

const chatWindow = document.getElementById('chat-window');
const buttonGrid = document.querySelector('.button-grid');
const controlsSection = document.querySelector('.controls'); 
let currentMood = 50; 

function updateMoodMeter(change) {
    currentMood += change;
    if (currentMood > 100) currentMood = 100;
    if (currentMood < 0) currentMood = 0;

    const moodBar = document.getElementById('dynamic-mood-bar');
    const moodLabel = document.getElementById('dynamic-mood-label');
    
    if (moodBar) {
        moodBar.style.width = currentMood + '%';
        if (currentMood >= 70) {
            moodBar.style.backgroundColor = '#28a745'; moodLabel.innerText = 'Customer Mood: Receptive';
        } else if (currentMood <= 35) {
            moodBar.style.backgroundColor = '#dc3545'; moodLabel.innerText = 'Customer Mood: Defensive';
        } else {
            moodBar.style.backgroundColor = '#ffc107'; moodLabel.innerText = 'Customer Mood: Neutral';
        }
    }
}

function initializeMoodMeter() {
    if (!document.getElementById('mood-meter-container')) {
        const meterHTML = `
            <div id="mood-meter-container" class="mood-container">
                <div id="dynamic-mood-bar" class="mood-bar"></div>
                <div id="dynamic-mood-label" class="mood-label">Customer Mood: Neutral</div>
            </div>
        `;
        chatWindow.insertAdjacentHTML('beforebegin', meterHTML);
    }
    currentMood = 50;
    updateMoodMeter(0); 
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    if (sender === 'employee') {
        messageDiv.style.backgroundColor = '#e8f5e9';
        messageDiv.style.borderLeft = '4px solid #4caf50';
        messageDiv.innerHTML = `<p><strong>You:</strong> ${text}</p>`;
    } else {
        messageDiv.innerHTML = `<p><strong>Customer:</strong> ${text}</p>`;
    }
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; 
}

window.handleChoice = function(selectedOption, allOptions, clickedBtn) {
    if (selectedOption.nextStep === 'start') {
        chatWindow.innerHTML = '';
        removeFeedbackPanel();
        loadStep('start');
        return;
    }
    addMessage(selectedOption.text, 'employee');
    if (selectedOption.moodChange) updateMoodMeter(selectedOption.moodChange);

    const buttons = buttonGrid.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    if (selectedOption.isOptimal) {
        clickedBtn.style.backgroundColor = '#d4edda'; clickedBtn.style.borderColor = '#28a745'; clickedBtn.style.color = '#155724'; clickedBtn.innerHTML = `✅ ${selectedOption.text}`;
    } else {
        clickedBtn.style.backgroundColor = '#f8d7da'; clickedBtn.style.borderColor = '#dc3545'; clickedBtn.style.color = '#721c24'; clickedBtn.innerHTML = `❌ ${selectedOption.text}`;
        const correctIndex = allOptions.findIndex(opt => opt.isOptimal);
        if (correctIndex !== -1) {
            buttons[correctIndex].style.backgroundColor = '#d4edda'; buttons[correctIndex].style.borderColor = '#28a745'; buttons[correctIndex].style.color = '#155724'; buttons[correctIndex].innerHTML = `✅ ${allOptions[correctIndex].text}`;
        }
    }
    showFeedbackPanel(selectedOption);
};

function showFeedbackPanel(selectedOption) {
    removeFeedbackPanel(); 
    const panel = document.createElement('div');
    panel.id = 'active-feedback'; 
    let imageHTML = selectedOption.imageUrl ? `<img src="${selectedOption.imageUrl}" class="feedback-image" alt="Scenario outcome">` : '';
    
    if (selectedOption.isOptimal) {
        panel.className = 'feedback-panel panel-correct';
        panel.innerHTML = `${imageHTML} <h4>✅ Correct Choice</h4> <p>${selectedOption.feedback}</p>`;
    } else {
        panel.className = 'feedback-panel panel-incorrect';
        panel.innerHTML = `${imageHTML} <h4>❌ Incorrect Choice</h4> <p>${selectedOption.feedback}</p>`;
    }

    const continueBtn = document.createElement('button');
    continueBtn.className = 'continue-btn';
    continueBtn.innerText = 'Continue ➔';
    continueBtn.onclick = () => { removeFeedbackPanel(); loadStep(selectedOption.nextStep); };
    panel.appendChild(continueBtn);
    controlsSection.appendChild(panel); 
}

function removeFeedbackPanel() {
    const existingPanel = document.getElementById('active-feedback');
    if (existingPanel) existingPanel.remove();
}

function loadStep(stepId) {
    if (stepId === 'start') initializeMoodMeter();
    const stepData = scenarioData[stepId];
    addMessage(stepData.customerText, 'customer');
    buttonGrid.innerHTML = ''; 
    stepData.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = option.text;
        btn.onclick = (e) => handleChoice(option, stepData.options, e.target);
        buttonGrid.appendChild(btn);
    });
}

chatWindow.innerHTML = ''; 
loadStep('start');