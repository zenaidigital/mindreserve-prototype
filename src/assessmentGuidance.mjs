export const assessmentGuidance = {
  "Trade-off analysis": {
    "trap": "Following the model's preference when options look similar hands the judgement to the tool.",
    "explanation": "Good comparisons weigh more than the headline benefit. Reversibility matters because a decision you can undo carries less risk than one you cannot."
  },
  "Approval gates": {
    "trap": "Recording only that someone clicked approve shows that a decision happened, not how it was made.",
    "explanation": "A useful record lets someone later understand who decided, why, on what conditions and based on what evidence. That supports audit, learning and accountability."
  },
  "Clarification": {
    "trap": "Asking for a more confident tone hides uncertainty instead of resolving it.",
    "explanation": "Vague output usually reflects a vague request. A precise follow-up that names the evidence you need gives the model something concrete to answer."
  },
  "Metacognition": {
    "trap": "Reducing your own analysis because the tool proposed an answer is the opposite of metacognition.",
    "explanation": "Metacognition is thinking about your own thinking. With AI it means noticing when you are accepting an answer too easily and deciding what to check."
  },
  "Counter-argument": {
    "trap": "Using a counter-argument to make a response look rigorous treats it as decoration rather than a test.",
    "explanation": "A counter-argument is a stress test. Its purpose is to reveal where your reasoning is thin, so you can strengthen it or change course."
  },
  "Quality criteria": {
    "trap": "Measuring quality only after full deployment finds problems when they are most expensive to fix.",
    "explanation": "Defining quality up front stops the goalposts moving after results arrive, and checking it alongside speed catches gains that come from cutting corners."
  },
  "AI-output verification": {
    "trap": "A claim that fits a plausible business case is still unverified; plausibility is not evidence.",
    "explanation": "AI can produce confident numbers with no basis. Find where the figure came from and check it against your own measured baseline before anyone relies on it."
  },
  "Deliberate practice": {
    "trap": "A questionnaire that reports a score without practice measures but does not improve.",
    "explanation": "Skills improve fastest with realistic practice, immediate feedback and a chance to try again. That combination builds judgement that transfers to real work."
  },
  "Feedback loops": {
    "trap": "Usage volume and latency show the tool is being used, not that it is still working well.",
    "explanation": "AI systems can change behaviour over time as data and usage shift. Reviews should look for new risks and drift, not only confirm the launch went well."
  },
  "Context selection": {
    "trap": "Supplying every available document dilutes the relevant material and shifts your judgement onto the model.",
    "explanation": "Relevant context and clear constraints let the model fit its answer to your situation, and stating uncertainty prompts it to flag gaps rather than guess."
  },
  "Transfer": {
    "trap": "A workflow that looks similar may hide differences in data, risk or users that change the result.",
    "explanation": "A pattern that worked in one setting may fail in another if the context, constraints or data differ. Check they are comparable before reusing it."
  },
  "Uncertainty handling": {
    "trap": "Removing limitations to avoid confusion leaves leaders confident in something they should question.",
    "explanation": "Decision-makers need to know how confident to be. Stating the uncertainty and proposing a small test lets them act without betting everything on an unproven claim."
  },
  "Constructive challenge": {
    "trap": "Skipping challenge when delivery speed matters is exactly when weak recommendations slip through.",
    "explanation": "Useful challenges point to specific evidence and aim to improve the decision. That keeps the discussion productive rather than personal."
  },
  "Communication": {
    "trap": "Recording only the final answer keeps the record short but loses the reasoning others need.",
    "explanation": "Someone reading the record later should be able to follow why the decision was made and what happens next, without having been in the room."
  },
  "Source traceability": {
    "trap": "A recent, authoritative-looking title tells you nothing about whether the content supports the claim.",
    "explanation": "AI tools can cite real sources that do not say what is claimed, or cite sources that do not exist. Open the source and confirm it supports the claim in your context."
  },
  "Stakeholder awareness": {
    "trap": "Inviting comment only at launch turns stakeholders into reviewers of a decision already made.",
    "explanation": "The people who do the work, own the process, manage the risk and approve the change each see problems the others miss. Involving them early is cheaper than reworking after launch."
  },
  "Human accountability": {
    "trap": "An automatically generated recommendation does not remove the need for a human owner.",
    "explanation": "AI can inform a decision but cannot be held accountable for it. Responsibility stays with the person or body that approves it."
  },
  "Systems thinking": {
    "trap": "Measuring only the tool's own response misses the downstream effects on other teams.",
    "explanation": "Processes share data, depend on each other's outputs and are shaped by incentives and controls. A change in one place often creates effects elsewhere."
  },
  "Workload awareness": {
    "trap": "Asking an AI tool to diagnose distress is not a substitute for human support.",
    "explanation": "Overload and distress need human support and a real change to workload. Raising it early with the responsible manager protects both the person and the quality of the work."
  },
  "Problem framing": {
    "trap": "Generating several ideas feels productive, but without a success measure you have no basis for choosing between them.",
    "explanation": "Without a clear objective, limits and a way to judge success, you cannot tell whether an AI answer is useful. Framing the problem first keeps the output tied to the real business need."
  },
  "Outcome measures": {
    "trap": "User enthusiasm and prompt counts measure activity and sentiment, not outcomes.",
    "explanation": "A claim is only credible if you know the starting point, compare like with like, and check that quality held up. Speed gains that reduce quality are not productivity gains."
  },
  "Question formulation": {
    "trap": "Asking for a persuasive case for your preferred option produces confirmation, not insight.",
    "explanation": "For high-stakes decisions, the value of AI is in surfacing what you have not checked, not in confirming what you already believe. Asking about assumptions and alternatives does that."
  },
  "Escalation": {
    "trap": "Using the output because it is faster turns a policy question into an unapproved exception.",
    "explanation": "A conflict with policy needs a human decision from someone with authority, and keeping the evidence lets them see exactly what happened."
  },
  "Scope control": {
    "trap": "Starting broad and narrowing later means users absorb the cost of your learning.",
    "explanation": "A bounded use case limits risk and makes results measurable, and a named owner makes someone accountable for the outcome. You can expand once the pilot shows value."
  },
  "Data responsibility": {
    "trap": "A tool being widely available does not mean it is approved for sensitive information.",
    "explanation": "Before sharing sensitive data, confirm you are allowed to, that the purpose is legitimate, how long the tool keeps it, and whether this use is approved."
  }
};
