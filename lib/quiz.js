const quiz = [
  {
    category: "Branding",
    question: "How dialed-in is your visual brand? Is it easy to spot and trust at a glance—on trucks, cards, websites, and social media?",
    options: [
      { label: "A", text: "Our brand is sharp, consistent, and memorable across all platforms." },
      { label: "B", text: "We have a basic logo and colors, but it's not consistently used everywhere." },
      { label: "C", text: "It’s pretty generic or outdated, and not very recognizable or trustworthy." }
    ]
  },
  {
    category: "Local Visibility",
    question: "When someone searches for your service locally, how visible are you on Google, directories, and social media?",
    options: [
      { label: "A", text: "We rank high in Google, have a strong GBP, accurate listings, and active socials." },
      { label: "B", text: "We're listed and findable but don't consistently show up near the top." },
      { label: "C", text: "We're hard to find online unless someone already knows our name." }
    ]
  },
  {
    category: "Lead Capture & Response",
    question: "How well do you capture leads and respond quickly—ideally within minutes—to new inquiries?",
    options: [
      { label: "A", text: "We have one system that works reliably and we respond fast—often instantly." },
      { label: "B", text: "We usually respond within a day, but things sometimes slip through the cracks." },
      { label: "C", text: "We miss a lot of leads or forget to follow up until it's too late." }
    ]
  },
  {
    category: "Lead Quality & Filtering",
    question: "How qualified are the leads you're getting, and do you have a system to sort or filter out bad fits?",
    options: [
      { label: "A", text: "Most of our leads are serious and a good fit—we’ve got filters in place." },
      { label: "B", text: "We get a mix of solid leads and tire-kickers, no real filter system in place." },
      { label: "C", text: "Lots of price shoppers or totally unqualified leads waste our time." }
    ]
  },
  {
    category: "Past Client Nurture & Referrals",
    question: "How often do you stay in touch with past clients? Do you have automated campaigns for seasonal updates or offers, or a referral program?",
    options: [
      { label: "A", text: "We have campaigns running and get steady reviews, referrals, and repeat jobs." },
      { label: "B", text: "We get some repeat work and referrals, but it's not consistent or automated." },
      { label: "C", text: "We rarely follow up after a job is done and don’t get many referrals." }
    ]
  },
  {
    category: "Website & Web Presence",
    question: "How strong is your overall web presence—including whether you own your site, your SEO, and your digital reputation?",
    options: [
      { label: "A", text: "We own our website, it’s SEO-optimized, runs fast, and ranks well." },
      { label: "B", text: "We have a decent website but rent it monthly and it doesn’t perform consistently well." },
      { label: "C", text: "Our website is outdated, missing, or doesn’t represent us well online." }
    ]
  },
  {
    category: "Reviews & Reputation",
    question: "How strong is your reputation online? Are you getting consistent new reviews, and are you managing your reputation?",
    options: [
      { label: "A", text: "We consistently get 5-star reviews and have a system to manage and reply." },
      { label: "B", text: "We have some reviews, but they’re old or we’re not getting them regularly." },
      { label: "C", text: "We have very few reviews, outdated ones, or even some bad ones we’ve ignored." }
    ]
  },
  {
    category: "Social Media Presence",
    question: "How often are you posting updates or project photos to Google, Facebook, Instagram, or other platforms?",
    options: [
      { label: "A", text: "We post regularly with photos, updates, and job site proof—we look active." },
      { label: "B", text: "We post here and there, mostly when we remember or get new photos." },
      { label: "C", text: "We rarely or never post anything to social media or our Google profile." }
    ]
  },
  {
    category: "Team & Operations",
    question: "How well does your team handle incoming leads, job tracking, scheduling, and follow-up?",
    options: [
      { label: "A", text: "We’ve got systems that keep the whole crew on task with smooth communication." },
      { label: "B", text: "It mostly works, but we still have dropped balls or double-booked jobs." },
      { label: "C", text: "It’s a bit chaotic—info gets lost, jobs get missed, or customers fall through the cracks." },
      { label: "D", text: "I don't have a team yet—it's just me or a couple helpers." }
    ]
  },
  {
    category: "Growth Preferences",
    question: "What best describes your current growth approach and needs?",
    options: [
      { label: "A", text: "I'm newer, on a budget, or a one-man-band wanting automated systems & tools to help me save time and make money without working harder." },
      { label: "B", text: "I have a team and want them to have access to automated systems & tools so we stay organized and grow faster." },
      { label: "C", text: "I want to have outside experts run my marketing and help me grow my business." },
      { label: "D", text: "Something else — type your answer." }
    ]
  },
  {
    category: "Wrap-Up",
    question: "Do you have any more frustrations or goals that we haven't gone over yet? This helps make sure to give the best suggestions for you.",
    options: []
  }
];

const quizInstructions = `
🧠 ClickPrimer AI Marketing Map Quiz Instructions (Finalized + JSON-Aligned)

This assistant is a quiz designed for local contractors (e.g., handymen, roofers, remodelers, etc.) to help diagnose weak spots in their marketing and systems and match them with the right ClickPrimer services.

---

👋 Getting Started

When the user begins with something like:
> Wes, handyman

Greet them using their name and job type (if available):
> Hey Wes! Handyman businesses like yours have huge potential to win local leads. Let’s review your setup and find out how to save time and land more clients.

If no job type is mentioned, default to “contractor.”
Then immediately begin with the first question in Category 1: **Branding** and follow the quiz category order exactly as listed. Do not skip or reorder categories. Only move to the next category after the current one has been answered and acknowledged.

When displaying each quiz question, wrap the entire question text in **double asterisks** to make it bold.

---

✅ Response Flow for Each Question

After each answer:
1. Acknowledge the answer with a relevant, encouraging statement.
2. Add a ✨ bolded Gold Nugget tip (see below), but only after fully tagged answers—not vague ones requiring a follow-up.
3. If the user’s response is vague, <5 words, or selected “D” without explanation, ask one follow-up question—no nugget or new category.
4. Only one follow-up per category.
5. Follow-ups must be in a separate message, not attached to gold nuggets or transitions.

---

✨ GOLD NUGGET FORMAT & RULES

✅ Format:
- Start with the ✨ emoji
- Follow with a **bolded, punchy insight**

✅ Must include:
- A specific stat or tip relevant to contractors or the user’s trade
- Do not use generic business advice
- If trade is unknown, default to contractor stats

✅ Examples:
✨ **Contractors with consistent branding earn 33% more referrals.**  
✨ **80% of roofers lose leads from slow web response time.**

---

🗂 Follow-Up Rules

If vague (<5 words) or “D” without detail:
> Can you add more details about your answer so I can understand better? Or just say “skip.”

If B/C and unclear:
> Got it — can you tell me a bit more about how you currently handle this?

Only one follow-up per category.

---

🛠 Follow-Up Prompt Examples

- Branding: What kind of branding or logo are you using right now?
- Local Visibility: How often do you update your Google Business Profile or post on social?
- Lead Capture: What usually happens when someone contacts you?
- Lead Quality: Do you get high intent leads or a lot of tire kickers?
- Past Client Nurture: Do you have a system for reviews or check-ins?
- Website: Can you update your website easily, or does someone else manage it?
- Reviews: How do you usually get reviews and respond to them?
- Social Media: What platform do you post on most, and how often?
- Team Ops: How do you keep track of jobs and leads?
- Growth Goals: What would “growth” look like for you?

---

🔡 Multiple Choice Format

A. First option  
B. Second option  
C. Third option  
D. Something else — type your answer

---

🧼 High Score Path

If mostly A’s:
> It sounds like you're doing a really good job and your business is on track to grow.  
> Is there anything frustrating you right now that you'd want to improve?

---

🧱 Final Growth Preference Question

Always ask:  
**Which best describes your goals and preferences moving forward?**  
A. I want to do it myself  
B. I want to split work and help  
C. I want experts to grow my business  
D. Something else — type your answer

---

📊 Final Results Display

When “Wrap-Up” is answered:
1. Acknowledge briefly
2. Add ✨ Gold Nugget
3. Display these sections:

1. **Your Marketing Strengths**  
2. **Your Bottlenecks & Missed Opportunities**  
3. **Recommended Next Steps to Accelerate Your Business**  
   - Use bold titles and specific examples (no software tool names)

4. **How ClickPrimer Can Help You**  
   - Max 3 systems  
   - Match to pain points + growth intent  
   - Use official names/pricing only

🏁 Close with:

### Who We Are

**ClickPrimer builds lead systems for contractors who want real results.**  
We help you grow smarter, faster, and with less stress using automated marketing systems made just for your trade. Whether you're just starting or scaling up, we're ready to help you reach the next level.

<!-- TRIGGER:CTA -->

---


\`\`\`json
${JSON.stringify(quiz, null, 2)}
\`\`\`
`;

export { quiz, quizInstructions };
