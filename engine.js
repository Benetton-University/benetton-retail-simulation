// ==========================================
// THE MASTER ENGINE (engine.js)
// Supports: Scenarios & Gamified Quizzes
// ==========================================

// 1. UNIQUE CONNECTION 
const dbUrl = 'https://lttebmghqpahjclycxau.supabase.co'; 
const dbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dGVibWdocXBhaGpjbHljeGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDE4NDIsImV4cCI6MjA5MzAxNzg0Mn0.bwsArSg1M4GO0mJV83jttCikkeoXj_HL_yEsRlxptzE'; 

const sbClient = window.supabase.createClient(dbUrl, dbKey);

// 2. UI VARIABLES 
const chatWindow = document.getElementById('chat-window');
const buttonGrid = document.querySelector('.button-grid');
const controlsSection = document.querySelector('.controls'); 

// 3. TELEMETRY & STATE
const sessionData = {
    employeeEmail: "", 
    moduleName: window.currentModuleName || "Unknown Module", 
    startTime: new Date().getTime(),
    endTime: null,
    finalMoodScore: 50,
    criticalErrors: 0,
    choicesLog: [] 
};

let currentMood = 50; 
let scenarioData = null;

// Gamified Quiz State
let quizState = {
    currentIndex: 0,
    score: 0,
    streak: 0,
    mistakes: 0
};

// 4. SECURITY & INITIALIZATION
async function initializeUser() {
    const { data, error } = await sbClient.auth.getSession();
    
    if (data.session) {
        sessionData.employeeEmail = data.session.user.email;
        chatWindow.innerHTML = ''; 
        fetchModuleFromCloud(); 
    } else {
        window.location.href = "index.html"; 
    }
}

// 5. CLOUD ROUTER
async function fetchModuleFromCloud() {
    try {
        chatWindow.innerHTML = '<p style="text-align:center; color:#666; margin-top: 20px;">Loading training module from the cloud...</p>';

        // Notice we are now asking for the module_type as well
        const { data, error } = await sbClient
            .from('module_content')
            .select('scenario_data, module_type')
            .eq('module_name', window.currentModuleName);

        if (error) throw error;

        if (data && data.length > 0) {
            scenarioData = data[0].scenario_data; 
            const moduleType = data[0].module_type || 'scenario'; // Default to scenario if missing

            chatWindow.innerHTML = ''; 
            
            // ROUTING LOGIC
            if (moduleType === 'quiz') {
                initQuizMode();
            } else {
                loadStep('start'); 
            }
        } else {
            chatWindow.innerHTML = '<p style="color:red; text-align:center; margin-top: 20px;">Error: Module not found.</p>';
        }
    } catch (error) {
        console.error("Cloud connection failed:", error);
        chatWindow.innerHTML = '<p style="color:red; text-align:center; margin-top: 20px;">Error connecting to the training database.</p>';
    }
}

initializeUser();

// ==========================================
// MODE A: GAMIFIED QUIZ LOGIC
// ==========================================

function initQuizMode() {
    // Ensure the chat window isn't styled like a chatbox for the quiz
    chatWindow.style.backgroundColor = '#ffffff';
    chatWindow.style.border = 'none';
    chatWindow.style.boxShadow = 'none';
    
    loadQuizQuestion();
}

function loadQuizQuestion() {
    const q = scenarioData.questions[quizState.currentIndex];
    const total = scenarioData.questions.length;

    // Render Gamified Header and Question
    chatWindow.innerHTML = `
        <div style="padding: 10px; text-align: center; animation: slideIn 0.3s ease-out;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding: 15px 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid #eaeaea; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <span style="color: #666; font-size: 1.1rem;">📝 Q ${quizState.currentIndex + 1} / ${total}</span>
                <span style="color: #ff5722; font-size: 1.2rem; font-weight: 800;">🔥 Streak x${quizState.streak}</span>
                <span style="color: #00563f; font-size: 1.2rem; font-weight: 800;">🏆 ${quizState.score}</span>
            </div>
            <h2 style="color: #333; line-height: 1.5; font-size: 1.6rem; margin-bottom: 20px;">${q.question}</h2>
        </div>
    `;

    // Render a 2x2 Grid for the answers
    buttonGrid.innerHTML = ''; 
    buttonGrid.style.gridTemplateColumns = '1fr 1fr'; 

    q.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.textAlign = 'center';
        btn.style.fontSize = '1.1rem';
        btn.style.padding = '20px';
        btn.innerText = optText;
        btn.onclick = (e) => handleQuizAnswer(index, q, e.target);
        buttonGrid.appendChild(btn);
    });
}

function handleQuizAnswer(selectedIndex, qData, clickedBtn) {
    const buttons = buttonGrid.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedIndex === qData.correctIndex);
    let ptsEarned = 0;

    if (isCorrect) {
        quizState.streak++;
        ptsEarned = 100 + (quizState.streak * 25); // Combo multiplier!
        quizState.score += ptsEarned;
        
        clickedBtn.style.backgroundColor = '#d4edda'; 
        clickedBtn.style.borderColor = '#28a745'; 
        clickedBtn.style.color = '#155724'; 
        clickedBtn.innerHTML = `✅ ${qData.options[selectedIndex]}`;
    } else {
        quizState.streak = 0; // Break the combo
        quizState.mistakes++;
        
        clickedBtn.style.backgroundColor = '#f8d7da'; 
        clickedBtn.style.borderColor = '#dc3545'; 
        clickedBtn.style.color = '#721c24'; 
        clickedBtn.innerHTML = `❌ ${qData.options[selectedIndex]}`;

        // Reveal the right answer
        const correctBtn = buttons[qData.correctIndex];
        if (correctBtn) {
            correctBtn.style.backgroundColor = '#d4edda'; 
            correctBtn.style.borderColor = '#28a745'; 
            correctBtn.style.color = '#155724'; 
            correctBtn.innerHTML = `✅ ${qData.options[qData.correctIndex]}`;
        }
    }
    
    showQuizFeedbackPanel(isCorrect, ptsEarned, qData.feedback);
}

function showQuizFeedbackPanel(isCorrect, ptsEarned, feedbackText) {
    removeFeedbackPanel(); 
    const panel = document.createElement('div');
    panel.id = 'active-feedback'; 
    panel.className = isCorrect ? 'feedback-panel panel-correct' : 'feedback-panel panel-incorrect';
    
    let icon = isCorrect ? `🎉 Correct! (+${ptsEarned} pts)` : '❌ Incorrect';
    panel.innerHTML = `<h4 style="margin-top:0; margin-bottom:10px;">${icon}</h4> <p style="margin-bottom:15px;">${feedbackText}</p>`;

    const actionBtn = document.createElement('button');
    actionBtn.className = 'continue-btn';
    
    if (quizState.currentIndex + 1 >= scenarioData.questions.length) {
        actionBtn.innerText = 'Finish Challenge ✔';
        actionBtn.onclick = () => { 
            removeFeedbackPanel(); 
            completeQuizSimulation(); 
        };
    } else {
        actionBtn.innerText = 'Next Question ➔';
        actionBtn.onclick = () => { 
            removeFeedbackPanel(); 
            quizState.currentIndex++;
            loadQuizQuestion(); 
        };
    }
    
    panel.appendChild(actionBtn);
    controlsSection.appendChild(panel); 
}

async function completeQuizSimulation() {
    sessionData.endTime = new Date().getTime();

    // Reset grid layout for the save screen
    buttonGrid.style.gridTemplateColumns = '1fr'; 
    buttonGrid.innerHTML = '<p style="text-align:center; color:#666;">Saving your high score to the HR Database...</p>';
    
    chatWindow.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
            <h1 style="font-size: 4rem; margin-bottom: 10px;">🏆</h1>
            <h2 style="color: #00563f; margin-bottom: 15px; font-size: 2rem;">Challenge Complete!</h2>
            <p style="font-size: 1.3rem; color: #555;">Final Score: <strong style="color: #333;">${quizState.score}</strong></p>
        </div>
    `;

    // Calculate a standard 0-100% for the analytics dashboard
    const totalQ = scenarioData.questions.length;
    const correctAnswers = totalQ - quizState.mistakes;
    const percentageScore = Math.round((correctAnswers / totalQ) * 100);

    const { data, error } = await sbClient
        .from('training_logs')
        .insert([{
            email: sessionData.employeeEmail, 
            module_name: sessionData.moduleName,
            score: percentageScore,
            final_mood_score: 50, // N/A for quizzes
            mistakes: quizState.mistakes.toString() 
        }]);

    if (error) {
        console.error("SUPABASE CONNECTION ERROR:", error);
        buttonGrid.innerHTML = '<p style="color:red; text-align:center;">Error saving data. Please contact IT.</p>';
    } else {
        buttonGrid.innerHTML = `
            <div style="text-align:center;">
                <a href="index.html" style="padding: 12px 24px; background: #00563f; color: white; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 1.1rem;">Return to Hub</a>
            </div>`;
    }
}


// ==========================================
// MODE B: SCENARIO LOGIC (Untouched)
// ==========================================

function updateMoodMeter(change) {
    currentMood += change;
    if (currentMood > 100) currentMood = 100;
    if (currentMood < 0) currentMood = 0;

    const moodBar = document.getElementById('dynamic-mood-bar');
    const moodLabel = document.getElementById('dynamic-mood-label');
    
    if (moodBar && moodLabel) {
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
            <div id="dynamic-mood-label" style="font-size: 0.95rem; font-weight: bold; color: #555; margin-bottom: 8px; display: block;">Customer Mood: Neutral</div>
            <div id="mood-meter-container" style="background: #e9ecef; height: 12px; border-radius: 6px; margin-bottom: 20px; overflow: hidden; width: 100%; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                <div id="dynamic-mood-bar" style="height: 100%; width: 50%; background: #ffc107; transition: width 0.5s ease-in-out, background-color 0.5s ease;"></div>
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
    panel.className = selectedOption.isOptimal ? 'feedback-panel panel-correct' : 'feedback-panel panel-incorrect';
    
    let icon = selectedOption.isOptimal ? '✅ Correct Choice' : '❌ Incorrect Choice';
    panel.innerHTML = `<h4 style="margin-top:0; margin-bottom:10px;">${icon}</h4> <p style="margin-bottom:15px;">${selectedOption.feedback}</p>`;

    const actionBtn = document.createElement('button');
    actionBtn.className = 'continue-btn';
    
    if (selectedOption.nextStep === 'endModule') {
        actionBtn.innerText = 'Finish Simulation ✔';
        actionBtn.onclick = () => { 
            removeFeedbackPanel(); 
            completeSimulation(); 
        };
    } else {
        actionBtn.innerText = 'Continue ➔';
        actionBtn.onclick = () => { 
            removeFeedbackPanel(); 
            loadStep(selectedOption.nextStep); 
        };
    }
    
    panel.appendChild(actionBtn);
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
    buttonGrid.style.gridTemplateColumns = '1fr'; // Ensure scenarios stay full width
    
    stepData.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = option.text;
        btn.onclick = (e) => handleChoice(option, stepData.options, e.target);
        buttonGrid.appendChild(btn);
    });
}

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
                <p style="color:green; font-weight:bold; margin-bottom: 15px; font-size: 1.2rem;">✅ Success! Module Completed.</p>
                <a href="index.html" style="padding: 12px 24px; background: #00563f; color: white; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Return to Training Hub</a>
            </div>`;
    }
}