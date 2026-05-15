// ==========================================
// THE MASTER ENGINE (engine.js)
// ==========================================

// 1. UNIQUE CONNECTION 
const dbUrl = 'https://lttebmghqpahjclycxau.supabase.co'; 
const dbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dGVibWdocXBhaGpjbHljeGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDE4NDIsImV4cCI6MjA5MzAxNzg0Mn0.bwsArSg1M4GO0mJV83jttCikkeoXj_HL_yEsRlxptzE'; 

const sbClient = window.supabase.createClient(dbUrl, dbKey);

// [NEW] Global variable to hold the downloaded scenario
let scenarioData = {}; 

// 2. UI VARIABLES 
const chatWindow = document.getElementById('chat-window');
const buttonGrid = document.querySelector('.button-grid');
const controlsSection = document.querySelector('.controls'); 
let currentMood = 50; 

// 3. TELEMETRY CLIPBOARD
const sessionData = {
    employeeEmail: "", 
    moduleName: window.currentModuleName || "Unknown Module", 
    startTime: new Date().getTime(),
    endTime: null,
    finalMoodScore: 50,
    criticalErrors: 0,
    choicesLog: [] 
};

// 4. SECURITY & INITIALIZATION
async function initializeUser() {
    const { data, error } = await sbClient.auth.getSession();
    
    if (data.session) {
        // Logged in: set email and fetch the module from the cloud
        sessionData.employeeEmail = data.session.user.email;
        chatWindow.innerHTML = ''; 
        fetchModuleFromCloud(); 
    } else {
        // Not logged in: redirect to login page immediately
        window.location.href = "index.html"; 
    }
}

// [NEW] CLOUD FETCH LOGIC
async function fetchModuleFromCloud() {
    try {
        // Show loading state
        chatWindow.innerHTML = '<p style="text-align:center; color:#666; margin-top: 20px;">Loading training module from the cloud...</p>';

        // Query the module_content table for this specific module
        const { data, error } = await sbClient
            .from('module_content')
            .select('scenario_data')
            .eq('module_name', window.currentModuleName);

        if (error) throw error;

        // Check if we got the data, then start the engine
        if (data && data.length > 0) {
            scenarioData = data[0].scenario_data; 
            chatWindow.innerHTML = ''; // Clear loading text
            loadStep('start'); // Kick off the simulation!
        } else {
            chatWindow.innerHTML = '<p style="color:red; text-align:center; margin-top: 20px;">Error: Module not found in the database.</p>';
        }
    } catch (error) {
        console.error("Cloud connection failed:", error);
        chatWindow.innerHTML = '<p style="color:red; text-align:center; margin-top: 20px;">Error connecting to the training database.</p>';
    }
}

// Trigger the security check on page load
initializeUser();

// 5. MOOD METER LOGIC
function updateMoodMeter(change) {
    currentMood += change;
    if (currentMood > 100) currentMood = 100;
    if (currentMood < 0) currentMood = 0;

    const moodBar = document.getElementById('dynamic-mood-bar');
    const moodLabel = document.getElementById('dynamic-mood-label');
    
    if (moodBar) {
        moodBar.style.width = currentMood + '%';
        if (currentMood >= 70) {
            moodBar.style.backgroundColor = '#28a745'; moodLabel.innerText = 'Customer Mood: Positive';
        } else if (currentMood <= 35) {
            moodBar.style.backgroundColor = '#dc3545'; moodLabel.innerText = 'Customer Mood: Negative';
        } else {
            moodBar.style.backgroundColor = '#ffc107'; moodLabel.innerText = 'Customer Mood: Neutral';
        }
    }
}

function initializeMoodMeter() {
    if (!document.getElementById('mood-meter-container')) {
        const meterHTML = `
            <div id="dynamic-mood-label" class="mood-label" style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 0.95rem;">Customer Mood: Neutral</div>
            <div id="mood-meter-container" class="mood-container">
                <div id="dynamic-mood-bar" class="mood-bar"></div>
            </div>
        `;
        chatWindow.insertAdjacentHTML('beforebegin', meterHTML);
    }
    currentMood = 50;
    updateMoodMeter(0); 
}

// 6. CHAT LOGIC
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

    if (selectedOption.nextStep === 'endModule') {
        completeSimulation();
        return;
    }

    addMessage(selectedOption.text, 'employee');

    sessionData.choicesLog.push({
        action: selectedOption.text,
        wasOptimal: selectedOption.isOptimal,
        moodImpact: selectedOption.moodChange || 0,
        timestamp: new Date().toISOString()
    });

    if (selectedOption.isOptimal === false) {
        sessionData.criticalErrors += 1;
    }

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

// 7. SILENT DATA EXPORT
async function completeSimulation() {
    sessionData.endTime = new Date().getTime();
    sessionData.finalMoodScore = currentMood;

    let finalScore = 100 - (sessionData.criticalErrors * 20);
    if (finalScore < 0) finalScore = 0;

    buttonGrid.innerHTML = '<p style="text-align:center; color:#666;">Saving your results to the HR Database...</p>';

    const { data, error } = await sbClient
        .from('training_logs')
        .insert([{
            email: sessionData.employeeEmail, 
            module_name: sessionData.moduleName,
            score: finalScore,
            final_mood_score: sessionData.finalMoodScore,
            mistakes: sessionData.criticalErrors.toString() 
        }]);

    if (error) {
        console.error("SUPABASE CONNECTION ERROR:", error);
        buttonGrid.innerHTML = '<p style="color:red; text-align:center;">Error saving data. Please contact IT.</p>';
    } else {
        buttonGrid.innerHTML = `
            <div style="text-align:center;">
                <p style="color:green; font-weight:bold; margin-bottom: 15px;">✅ Success! Module Completed.</p>
                <a href="index.html" style="padding: 10px 20px; background: #00563f; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Return to Training Hub</a>
            </div>`;
    }
}