// Tell the Engine what to name this in the HR Database
window.currentModuleName = "The Difficult Return (Exchange Policy)";

// ==========================================
// THE DATABASE: "The Difficult Exchange"
// ==========================================

const scenarioData = {
    start: {
        customerText: "Hi, I bought this Benetton polo here a while ago. It doesn't fit right, so I just want my money back. I have the invoice right here.",
        options: [
            { text: "Sure, let me check the invoice and get your cash refund processed.", nextStep: "refundRecovery", isOptimal: false, moodChange: -40, feedback: "You just promised a cash refund, violating the strict 'No Cash Refund' policy. Now you have to walk it back." },
            { text: "I can certainly help you with an exchange! However, please note that we do not offer cash refunds.", nextStep: "checkCondition", isOptimal: true, moodChange: 10, feedback: "Great start. You maintained a positive tone while setting expectations." },
            { text: "We don't do refunds, only exchanges. Hand me the invoice.", nextStep: "refundRecovery", isOptimal: false, moodChange: -20, feedback: "Too blunt. You created immediate friction. Prepare to de-escalate." }
        ]
    },
    refundRecovery: {
        customerText: "Wait, what? Are you giving me my money back or not? I just want to return this, it's 22 days old.",
        options: [
            { text: "I apologize for the confusion. We can only offer an exchange. Let me check the garment to see if it qualifies.", nextStep: "checkCondition", isOptimal: true, moodChange: 15, feedback: "Good recovery. You owned the mistake, apologized, and moved the process forward." },
            { text: "No cash. It's store policy. But I can exchange it since it's 22 days old.", nextStep: "failTierRecovery", isOptimal: false, moodChange: -30, feedback: "You are still being combative AND you just assumed you can take it without checking if they are a Green Tier member!" }
        ]
    },
    checkCondition: {
        customerText: "Fine, an exchange. As I said, it's 22 days old. The tags are still on and it's unworn.",
        options: [
            { text: "It looks perfectly re-saleable. May I ask, are you a Green Tier member with us?", nextStep: "evaluateTimeline", isOptimal: true, moodChange: 10, feedback: "Excellent. You verified the condition and checked their tier status." },
            { text: "Since it's 22 days old, you missed the standard 15-day window. I can't take this.", nextStep: "failTierRecovery", isOptimal: false, moodChange: -30, feedback: "You forgot to ask if they are Green Tier! They get 30 days. Now they are angry." }
        ]
    },
    failTierRecovery: {
        customerText: "Are you kidding me? I spend so much money here, I am a Green Tier member! Don't I get 30 days?!",
        options: [
            { text: "You are absolutely right, I sincerely apologize. Green Tier does get 30 days. Let's continue processing this.", nextStep: "evaluateTimeline", isOptimal: true, moodChange: 20, feedback: "Excellent de-escalation. You admitted fault and validated their loyalty." },
            { text: "Oh. Well, you still bought it online, so I can't take it here anyway.", nextStep: "explainPolicy", isOptimal: false, moodChange: -40, feedback: "Never stack bad news defensively. You just destroyed the customer's trust." }
        ]
    },
    evaluateTimeline: {
        customerText: "Actually, I just remembered I bought this polo on the Benetton website, but figured I could just swap it here in the store.",
        options: [
            { text: "Because this is an online order, policy requires it to be exchanged through the E-com portal, not an exclusive store.", nextStep: "explainPolicy", isOptimal: true, moodChange: 5, feedback: "Perfect application of the channel policy (E-com to E-com)." },
            { text: "I'm not supposed to, but I guess I can just swap it for you to save time.", nextStep: "explainPolicy", isOptimal: false, moodChange: -25, feedback: "You just broke the channel constraint policy! Store inventory will be heavily impacted." }
        ]
    },
    explainPolicy: {
        customerText: "This is so frustrating and strict! What if it was torn? Would you have taken it then?",
        options: [
            { text: "Yes, we accept all damaged goods for up to 180 days.", nextStep: "finalResolution", isOptimal: false, moodChange: -10, feedback: "Incorrect. Exchanges are ONLY valid for 180 days if there is a 'Manufacturing Defect'." },
            { text: "If it had a manufacturing defect, we could exchange it within 180 days. But standard damaged goods are not accepted.", nextStep: "finalResolution", isOptimal: true, moodChange: 10, feedback: "Spot on. You clearly distinguished between a defect and user damage." }
        ]
    },
    finalResolution: {
        customerText: "Whatever. I'll just keep the polo and give it to my brother. This took way too long.",
        options: [
            { text: "Have a good day.", nextStep: "endModule", isOptimal: false, moodChange: 0, feedback: "A missed opportunity to end on a high note." },
            { text: "I completely understand your frustration today. Thank you for your patience, and please let me know if I can help you find something else.", nextStep: "endModule", isOptimal: true, moodChange: 15, feedback: "Great final effort to salvage the customer relationship." }
        ]
    }
};