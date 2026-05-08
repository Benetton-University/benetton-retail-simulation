// ==========================================
// SCENARIO DATA: Outdoor Wedding (Restored)
// ==========================================

window.currentModuleName = "Suggestive Selling (Outdoor Wedding)";

const scenarioData = {
    start: {
        customerText: "I'll take the navy blue suit. It fits perfectly and it's exactly what I need for my friend's outdoor wedding next weekend.",
        options: [
            { 
                text: "Great choice! The register is right over here, I can ring that up for you.", 
                nextStep: "endModule", 
                isOptimal: false, 
                moodChange: -10, 
                feedback: "You missed an opportunity to 'Complete the Look'. Try to identify another need before ending the sale." 
            },
            { 
                text: "It looks fantastic on you. Just out of curiosity, what color shoes are you planning to wear with it?", 
                nextStep: "shoeResponse", 
                isOptimal: true, 
                moodChange: 15, 
                feedback: "Excellent! Probing about shoes is a natural way to transition into accessories." 
            },
            { 
                text: "You should also buy this black silk tie to go with it. Everyone needs a tie for a wedding.", 
                nextStep: "endModule", 
                isOptimal: false, 
                moodChange: -20, 
                feedback: "Too pushy. Directing a customer to buy an expensive item without explaining why creates friction." 
            }
        ]
    },
    shoeResponse: {
        customerText: "I'm wearing a pair of light brown leather loafers I already have at home.",
        options: [
            { 
                text: "Light brown is perfect with navy. We actually just got these woven leather belts in that match that shade exactly. It ties the whole outfit together.", 
                nextStep: "beltResponse", 
                isOptimal: true, 
                moodChange: 15, 
                feedback: "Perfect recommendation. Matching the belt to the shoes is a classic Benetton style standard." 
            },
            { 
                text: "You definitely need a new belt then. Pick one from that wall over there.", 
                nextStep: "endModule", 
                isOptimal: false, 
                moodChange: -5, 
                feedback: "Too passive. Guide the customer to a specific item rather than making them do the work." 
            }
        ]
    },
    beltResponse: {
        customerText: "That belt does match nicely. But I already have a black belt at home I usually wear. I'll probably just use that.",
        options: [
            { 
                text: "A black belt with brown shoes? You can't do that, it clashes terribly.", 
                nextStep: "endModule", 
                isOptimal: false, 
                moodChange: -25, 
                feedback: "Never criticize a customer's choices directly. It destroys the rapport you built." 
            },
            { 
                text: "A black belt is a classic, but traditionally, matching your belt to your shoes creates a much cleaner, elevated look for photos.", 
                nextStep: "photoResponse", 
                isOptimal: true, 
                moodChange: 10, 
                feedback: "Great job. You used a 'benefit' (looking good in photos) to justify the matching belt." 
            },
            { 
                text: "Okay, no problem. Just the suit then.", 
                nextStep: "endModule", 
                isOptimal: false, 
                moodChange: -5, 
                feedback: "You gave up on the upsell too early. A gentle explanation often wins the sale." 
            }
        ]
    },
    photoResponse: {
        customerText: "You know what, you're right. I'll be in a lot of photos next weekend. Toss the brown belt in there too.",
        options: [
            { 
                text: "Will do. That's a great looking outfit.", 
                nextStep: "endModule", 
                isOptimal: true, 
                moodChange: 10, 
                feedback: "Success! You successfully upsold the belt." 
            },
            { 
                text: "Done. And since it's an outdoor wedding, grab a pair of these tortoiseshell sunglasses on your way to the register. You'll thank me when the sun is in your eyes during the ceremony!", 
                nextStep: "endModule", 
                isOptimal: true, 
                moodChange: 20, 
                feedback: "Masterful! A double upsell by addressing a specific environmental factor (the sun)." 
            }
        ]
    }
};