// ==========================================
// SCENARIO DATA: First Impression & Readiness
// ==========================================

// 1. Module Name for HR Analytics Dashboard
window.currentModuleName = "First Impression & Readiness";

const scenarioData = {
    // STAGE 1: Pre-Shift Huddle
    start: {
        customerText: "[Floor Manager]: Hey! Glad you're here for the afternoon shift. Before we open the doors, take a look at yourself and the floor. We need to make sure we’re representing the brand right. What’s your first move?",
        options: [
            { 
                text: "I'm ready to go. I'll just lean by the entrance so I can catch customers as soon as they step in.", 
                nextStep: "step1Recovery", 
                isOptimal: false, 
                moodChange: -10, 
                feedback: "Wait—leaning makes you look tired, not approachable. Maintain the right posture to stay professional." 
            },
            { 
                text: "I need to check my phone for the daily targets one last time while I wait at the door.", 
                nextStep: "step1Recovery", 
                isOptimal: false, 
                moodChange: -15, 
                feedback: "Put the phone away! If a customer sees you on it, they’ll feel like they’re interrupting you." 
            },
            { 
                text: "I’ll check my grooming in the mirror, ensure my posture is upright, and my name tag is straight.", 
                nextStep: "step2", 
                isOptimal: true, 
                moodChange: 15, 
                feedback: "Perfect. You look sharp and ready." 
            }
        ]
    },
    step1Recovery: {
        customerText: "[Floor Manager]: Let's adjust that approach. We need to look sharp and attentive before the doors even open.",
        options: [
            { 
                text: "Understood. I'll check my grooming, fix my posture, and make sure my name tag is straight.", 
                nextStep: "step2", 
                isOptimal: true, 
                moodChange: 5, 
                feedback: "Much better. Always prioritize your personal presentation first." 
            }
        ]
    },

    // STAGE 2: VM Guidelines
    step2: {
        customerText: "[Floor Manager]: Now, look at the floor. The morning rush left the place a bit messy. I see a few things that break our VM standards. What are you grabbing first?",
        options: [
            { 
                text: "There's a coffee cup left on the display table; I’ll clear that and wipe the surface.", 
                nextStep: "step3", 
                isOptimal: true, 
                moodChange: 10, 
                feedback: "Good eye. Maintaining the right ambience is key to a premium feel." 
            },
            { 
                text: "The Polo stack is a mess. I’ll re-fold them so the sizes are easy to find.", 
                nextStep: "step3", 
                isOptimal: true, 
                moodChange: 10, 
                feedback: "Excellent. Neat stacks directly impact the customer's shopping experience." 
            },
            { 
                text: "I’ll just leave the dim light in the corner for now and focus on the clothes.", 
                nextStep: "step2Recovery", 
                isOptimal: false, 
                moodChange: -15, 
                feedback: "Actually, that dim light makes the corner look neglected. Let’s get that fixed to keep the store bright." 
            }
        ]
    },
    step2Recovery: {
        customerText: "[Floor Manager]: Remember, the environment speaks before we do. If a section is dark, customers will avoid it.",
        options: [
            { 
                text: "Got it. I'll get maintenance to fix the light immediately so the whole floor looks inviting.", 
                nextStep: "step3", 
                isOptimal: true, 
                moodChange: 5, 
                feedback: "Great pivot. A bright store is a welcoming store." 
            }
        ]
    },

    // STAGE 3: The 10-Feet Rule
    step3: {
        customerText: "[Floor Manager]: Quiet... here comes our first customer. They’re browsing the new denim. They're about 10 feet away from you now. What's the plan?",
        options: [
            { 
                text: "I’ll stay behind the counter and wait for them to look at me or ask a question.", 
                nextStep: "step3Recovery", 
                isOptimal: false, 
                moodChange: -10, 
                feedback: "Don't hide! Follow the 10-Feet Rule with a smile to let them know you're available." 
            },
            { 
                text: "I’ll walk right up to them and ask if they need a specific size.", 
                nextStep: "step3Recovery", 
                isOptimal: false, 
                moodChange: -15, 
                feedback: "Whoa, too close! You'll startle them. Give them space but stay present." 
            },
            { 
                text: "I’ll step out from the counter, make eye contact, and give them a warm smile from where I am.", 
                nextStep: "step4", 
                isOptimal: true, 
                moodChange: 15, 
                feedback: "Spot on. That’s the right way to welcome someone without being pushy." 
            }
        ]
    },
    step3Recovery: {
        customerText: "[Floor Manager]: We want to be welcoming, but not aggressive or invisible. Let's try that again.",
        options: [
            { 
                text: "I'll make eye contact and smile from a comfortable distance, letting them know I'm here if needed.", 
                nextStep: "step4", 
                isOptimal: true, 
                moodChange: 5, 
                feedback: "Perfect adjustment. You are balancing presence with personal space." 
            }
        ]
    },

    // STAGE 4: The Greeting Dialogue
    step4: {
        customerText: "[Floor Manager]: They saw your smile and looked back. Now, give them a proper welcome. What are you going to say?",
        options: [
            { 
                text: "Are you just looking today, or can I help you find something?", 
                nextStep: "step4Recovery", 
                isOptimal: false, 
                moodChange: -10, 
                feedback: "Careful—asking 'Are you just looking?' usually gets a 'Yes' and abruptly ends the conversation." 
            },
            { 
                text: "Good afternoon! Welcome! Feel free to browse our new collection. I'm right here if you need help with a fit.", 
                nextStep: "step5", 
                isOptimal: true, 
                moodChange: 15, 
                feedback: "Exactly. That's polite, professional, and leaves the door open for them to talk to you." 
            },
            { 
                text: "We have a 20% discount on those jackets if you buy them right now!", 
                nextStep: "step4Recovery", 
                isOptimal: false, 
                moodChange: -15, 
                feedback: "Too fast! You haven't even said hello yet. Focus on the relationship before the promotion." 
            }
        ]
    },
    step4Recovery: {
        customerText: "[Floor Manager]: That approach either closes the door or feels too pushy. Let's try a warm, open greeting instead.",
        options: [
            { 
                text: "I'll give a friendly 'Good afternoon,' let them browse, and mention I'm here if they need help.", 
                nextStep: "step5", 
                isOptimal: true, 
                moodChange: 5, 
                feedback: "Good recovery. An open greeting builds trust." 
            }
        ]
    },

    // STAGE 5: The Discovery / Transition
    step5: {
        customerText: "[Floor Manager]: They smiled back and said, 'Actually, I'm looking for a birthday gift for my brother.' What is your immediate next move to start the consultation?",
        options: [
            { 
                text: "Point to the men's section and tell them to let me know if they need to check any sizes.", 
                nextStep: "step5Recovery", 
                isOptimal: false, 
                moodChange: -10, 
                feedback: "Too passive! You have a golden opportunity to help them shop. Don't just point and walk away." 
            },
            { 
                text: "Ask an open-ended discovery question, like 'What is his usual style or favorite color?'", 
                nextStep: "endModule", 
                isOptimal: true, 
                moodChange: 20, 
                feedback: "Masterful. You've successfully transitioned from a greeting into a full sales consultation." 
            },
            { 
                text: "Immediately grab our most expensive leather jacket and tell them it's the absolute perfect gift.", 
                nextStep: "step5Recovery", 
                isOptimal: false, 
                moodChange: -15, 
                feedback: "Too aggressive. You don't know anything about their brother yet. You must discover their needs first." 
            }
        ]
    },
    step5Recovery: {
        customerText: "[Floor Manager]: That's either too passive or too aggressive. We need to guide them naturally by understanding their specific needs first.",
        options: [
            { 
                text: "I'll pivot and ask some open-ended questions to discover what their brother likes.", 
                nextStep: "endModule", 
                isOptimal: true, 
                moodChange: 10, 
                feedback: "Perfect. Discovery is the key to suggestive selling." 
            }
        ]
    },

    // Technical End Node
    endModule: {
        customerText: "[Floor Manager]: Outstanding work. You've set the floor up perfectly, welcomed the customer warmly, and seamlessly started a great consultation. Go get 'em. Have a great shift!",
        options: [] 
    }
};