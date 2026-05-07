// Tell the Engine what to name this in the HR Database
window.currentModuleName = "Suggestive Selling (Complete the Look)";

// ==========================================
// THE DATABASE: "Complete the Look" (Cross-selling)
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
    passiveMiss: {
        customerText: "Awesome, here is my card.",
        options: [
            { text: "[Process the payment and hand them the receipt]", nextStep: "partialSuccess", isOptimal: false, moodChange: 0, feedback: "You secured the primary sale, but completely failed to maximize the basket size or provide styling value." },
            { text: "Before I swipe this, I noticed you mentioned an outdoor wedding. Do you already have a pocket square to add a pop of color to the navy?", nextStep: "activeDiscovery", isOptimal: true, moodChange: 15, feedback: "Great save! You caught the interaction before the payment processed and offered a highly relevant, low-pressure suggestion." }
        ]
    },
    pushyReaction: {
        customerText: "Actually, the invitation says 'Smart Casual', so I wasn't even planning on wearing a tie. I'll just take the suit, thanks.",
        options: [
            { text: "Suit yourself. I'll ring it up.", nextStep: "partialSuccess", isOptimal: false, moodChange: -15, feedback: "You let the customer's defensiveness shut down the interaction. Always try to pivot smoothly." },
            { text: "Smart casual is a great look. In that case, skip the tie! Have you thought about a crisp white linen shirt underneath instead of a standard dress shirt?", nextStep: "activeDiscovery", isOptimal: true, moodChange: 20, feedback: "Excellent pivot. You validated their choice, dropped the tie, and suggested an item that actually fits their specific dress code." }
        ]
    },
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
    failScenario: {
        customerText: "<em>[Simulation Failed. The customer left without buying anything.]</em>",
        options: [{ text: "Exit Scenario", nextStep: "endModule" }]
    },
    partialSuccess: {
        customerText: "<em>[Partial Success. You sold the suit, but missed the optimal 'Complete the Look' styling opportunity.]</em>",
        options: [{ text: "Exit Scenario", nextStep: "endModule" }]
    },
    successScenario: {
        customerText: "<em>[Success! You acted as a true stylist, increasing the basket size and building customer loyalty.]</em>",
        options: [{ text: "Exit Scenario", nextStep: "endModule" }]
    },
    doubleUpsellSuccess: {
        customerText: "<em>[Incredible Success! Suit, Belt, and Sunglasses sold. Perfect consultative styling.]</em>",
        options: [{ text: "Exit Scenario", nextStep: "endModule" }]
    }
};