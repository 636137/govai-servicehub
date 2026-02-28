const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const conversations = [];
let convId = 1;

// Simple intent classifier
function classifyIntent(message) {
  const lower = message.toLowerCase();
  if (lower.includes('passport') || lower.includes('visa')) return 'passport';
  if (lower.includes('tax') || lower.includes('irs')) return 'tax';
  if (lower.includes('social security') || lower.includes('ssn')) return 'ssa';
  if (lower.includes('medicare') || lower.includes('medicaid')) return 'healthcare';
  return 'general';
}

// Response templates
const responses = {
  passport: "For passport services, visit travel.state.gov or call 1-877-487-2778. Processing takes 8-11 weeks.",
  tax: "For tax questions, visit irs.gov or call 1-800-829-1040. Tax filing deadline is April 15.",
  ssa: "For Social Security, visit ssa.gov or call 1-800-772-1213. Office hours are 8am-7pm weekdays.",
  healthcare: "For Medicare/Medicaid, visit medicare.gov or call 1-800-633-4227.",
  general: "I can help with passport, tax, Social Security, or healthcare questions. What do you need?"
};

app.post('/api/chat', (req, res) => {
  const { message, sessionId } = req.body;
  const intent = classifyIntent(message);
  const response = responses[intent];
  
  conversations.push({
    id: convId++,
    sessionId,
    userMessage: message,
    intent,
    botResponse: response,
    timestamp: new Date()
  });
  
  res.json({ response, intent });
});

app.get('/api/analytics', (req, res) => {
  const intentCounts = {};
  conversations.forEach(c => {
    intentCounts[c.intent] = (intentCounts[c.intent] || 0) + 1;
  });
  
  res.json({
    totalConversations: conversations.length,
    intentBreakdown: intentCounts,
    avgResponseTime: 0.5
  });
});

const PORT = 3003;
app.listen(PORT, () => console.log(`GovAI-ServiceHub API on port ${PORT}`));
