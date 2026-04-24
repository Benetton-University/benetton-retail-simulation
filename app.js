// ==========================================
// 1. THE DATABASE (Recovery Paths & Mood Scores)
// ==========================================

const scenarioData = {
    start: {
        customerText: "Hi, I bought this jacket yesterday but I want to return it. I lost the receipt though.",
        options: [
            { text: "We can't do returns without a receipt.", nextStep: "hostileReaction1", isOptimal: false, moodChange: -35, feedback: "Flat denial instantly ruins the customer experience. But the interaction isn't over yet—try to save it.", imageUrl: "images/angry-customer.jpg" },
            { text: "No problem, let's see if we can look it up by your phone number.", nextStep: "phoneLookup", isOptimal: true, moodChange: 15, feedback: "Excellent. Offering an immediate alternative keeps the customer calm." },
            { text: "I need to call my manager for this.", nextStep: "managerEscalation", isOptimal: false, moodChange: -15, feedback: "You should attempt to solve basic receipt issues before pulling a manager off the floor." }
        ]
    },
    
    // RECOVERY PATH 1
    hostileReaction1: {
        customerText: "Are you kidding me? I was literally just here yesterday! I spend thousands of dollars at this brand. This is ridiculous.",
        options: [
            { text: "I understand, but policy is policy. I can't do anything.", nextStep: "failScenario", isOptimal: false, moodChange: -40, feedback: "Doubling down on policy when a customer is already angry guarantees a failed interaction.", imageUrl: "images/angry-customer.jpg" },
            { text: "You're right, I apologize for being so abrupt. Let me see if I can locate the transaction using your phone number instead.", nextStep: "phoneLookup", isOptimal: true, moodChange: 25, feedback: "Fantastic recovery! You owned the mistake, apologized, and immediately pivoted to a solution.", imageUrl: "images/happy-customer.jpg" },
            { text: "I will call the manager.", nextStep: "managerEscalation", isOptimal: true, moodChange: -10, feedback: "Since you escalated the customer, handing it off to a manager is the safest bet, though not ideal." }
        ]
    },

    phoneLookup: {
        customerText: "Oh, thank you! My phone number is 555-0198.",
        options: [
            { text: "Give me one second while I pull that up in the system.", nextStep: "systemGlitch", isOptimal: true, moodChange: 10, feedback: "Good communication. Keeping the customer informed of what you are doing builds trust." },
            { text: "[Stare at the computer silently while typing]", nextStep: "systemGlitch", isOptimal: false, moodChange: -10, feedback: "Silence can make customers anxious. Always narrate your actions positively." }
        ]
    },
    systemGlitch: {
        customerText: "Is there a problem? I'm kind of in a hurry to get back to my car.",
        options: [
            { text: "Please calm down, the system is just slow.", nextStep: "escalatedGlitch", isOptimal: false, moodChange: -25, feedback: "Telling a customer to 'calm down' almost always has the exact opposite effect. Try to fix this.", imageUrl: "images/angry-customer.jpg" },
            { text: "I apologize for the wait, our system is just taking a moment to load your profile. I'll be as fast as I can.", nextStep: "resolutionFound", isOptimal: true, moodChange: 15, feedback: "Perfect. You validated their urgency, apologized for the tech issue, and reassured them." }
        ]
    },

    // RECOVERY PATH 2
    escalatedGlitch: {
        customerText: "Don't tell me to calm down! I just asked a simple question about how long this takes. Get me a manager.",
        options: [
            { text: "I will call them over.", nextStep: "managerEscalation", isOptimal: true, moodChange: -10, feedback: "The customer specifically requested a manager. You must comply to prevent further escalation." },
            { text: "You are absolutely right, and I apologize for my phrasing. Good news though—your transaction just popped up. Let's get this sorted.", nextStep: "resolutionFound", isOptimal: true, moodChange: 30, feedback: "A brilliant pivot. You validated their anger, apologized directly for your tone, and immediately shifted focus to the positive result." }
        ]
    },

    resolutionFound: {
        customerText: "Okay, fine. Did you find it? Can I just get cash back?",
        options: [
            { text: "Since you don't have the receipt, policy says store credit only.", nextStep: "pushback", isOptimal: false, moodChange: -15, feedback: "While technically true, quoting 'policy' sounds robotic and defensive." },
            { text: "Because we don't have the physical receipt, I can issue you a store credit for the full amount right now.", nextStep: "pushback", isOptimal: true, moodChange: 10, feedback: "Great phrasing. You framed the store credit as a solution, not a punishment." }
        ]
    },
    pushback: {
        customerText: "Store credit? But I paid with cash yesterday. I just want my money back.",
        options: [
            { text: "I completely understand the frustration. However, the store credit never expires and can be used at any location.", nextStep: "acceptance", isOptimal: true, moodChange: 15, feedback: "Excellent de-escalation. You validated their feelings and immediately highlighted the benefits of the credit." },
            { text: "I can't override the system. Do you want the credit or not?", nextStep: "failScenario", isOptimal: false, moodChange: -40, feedback: "Ultimatums will immediately destroy any remaining goodwill. This violates brand service standards.", imageUrl: "images/angry-customer.jpg" }
        ]
    },
    acceptance: {
        customerText: "Okay, fine. I guess that's fair. I was actually going to buy a sweater today anyway.",
        options: [
            { text: "Here is your card. Have a good day.", nextStep: "successScenario", isOptimal: false, moodChange: -10, feedback: "Missed opportunity! The customer explicitly mentioned buying a sweater. You missed a perfect upsell transition." },
            { text: "I can definitely help you find a great sweater! Let's get this credit issued so you can go browse the new summer collection.", nextStep: "successScenario", isOptimal: true, moodChange: 20, feedback: "Incredible! You seamlessly transitioned a difficult return into a positive sales interaction.", imageUrl: "images/happy-customer.jpg" }
        ]
    },
    managerEscalation: {
        customerText: "<em>[The customer glares at you while waiting for the manager. You lost control of the interaction.]</em>",
        options: [{ text: "Restart Simulation", nextStep: "start" }]
    },
    failScenario: {
        customerText: "<em>[Simulation Failed. The customer left the store angry and wrote a negative review.]</em>",
        options: [{ text: "Restart Simulation", nextStep: "start" }]
    },
    successScenario: {
        customerText: "<em>[Success! Return processed smoothly and customer retained.]</em>",
        options: [{ text: "Complete Simulation", nextStep: "start" }]
    }
};

// ==========================================
// 2. THE LOGIC (UI, Mood Meter & Feedback)
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
            moodBar.style.backgroundColor = '#28a745'; // Green
            moodLabel.innerText = 'Customer Mood: Happy';
        } else if (currentMood <= 35) {
            moodBar.style.backgroundColor = '#dc3545'; // Red
            moodLabel.innerText = 'Customer Mood: Frustrated';
        } else {
            moodBar.style.backgroundColor = '#ffc107'; // Yellow
            moodLabel.innerText = 'Customer Mood: Neutral';
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

    if (selectedOption.moodChange) {
        updateMoodMeter(selectedOption.moodChange);
    }

    const buttons = buttonGrid.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    if (selectedOption.isOptimal) {
        clickedBtn.style.backgroundColor = '#d4edda';
        clickedBtn.style.borderColor = '#28a745';
        clickedBtn.style.color = '#155724';
        clickedBtn.innerHTML = `✅ ${selectedOption.text}`;
    } else {
        clickedBtn.style.backgroundColor = '#f8d7da';
        clickedBtn.style.borderColor = '#dc3545';
        clickedBtn.style.color = '#721c24';
        clickedBtn.innerHTML = `❌ ${selectedOption.text}`;

        const correctIndex = allOptions.findIndex(opt => opt.isOptimal);
        if (correctIndex !== -1) {
            buttons[correctIndex].style.backgroundColor = '#d4edda';
            buttons[correctIndex].style.borderColor = '#28a745';
            buttons[correctIndex].style.color = '#155724';
            buttons[correctIndex].innerHTML = `✅ ${allOptions[correctIndex].text}`;
        }
    }

    showFeedbackPanel(selectedOption);
};

function showFeedbackPanel(selectedOption) {
    removeFeedbackPanel(); 

    const panel = document.createElement('div');
    panel.id = 'active-feedback'; 
    
    let imageHTML = '';
    if (selectedOption.imageUrl) {
        imageHTML = `<img src="${selectedOption.imageUrl}" class="feedback-image" alt="Scenario outcome">`;
    }
    
    if (selectedOption.isOptimal) {
        panel.className = 'feedback-panel panel-correct';
        panel.innerHTML = `
            ${imageHTML}
            <h4>✅ Correct Choice</h4>
            <p>${selectedOption.feedback}</p>
        `;
    } else {
        panel.className = 'feedback-panel panel-incorrect';
        panel.innerHTML = `
            ${imageHTML}
            <h4>❌ Incorrect Choice</h4>
            <p>${selectedOption.feedback}</p>
        `;
    }

    const continueBtn = document.createElement('button');
    continueBtn.className = 'continue-btn';
    continueBtn.innerText = 'Continue ➔';
    continueBtn.onclick = () => {
        removeFeedbackPanel();
        loadStep(selectedOption.nextStep);
    };

    panel.appendChild(continueBtn);
    controlsSection.appendChild(panel); 
}

function removeFeedbackPanel() {
    const existingPanel = document.getElementById('active-feedback');
    if (existingPanel) {
        existingPanel.remove();
    }
}

function loadStep(stepId) {
    if (stepId === 'start') {
        initializeMoodMeter();
    }

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

// Initialize
chatWindow.innerHTML = ''; 
loadStep('start');