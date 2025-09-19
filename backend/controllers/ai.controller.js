const PlanCollectionModel = require('../models/PlanCollection');
const BudgetPlanModel = require('../models/BudgetPlan');

function normalizeInput(collection, plans) {
  const name = collection?.name || 'Trip Collection';
  const destinations = Array.isArray(collection?.destinations) ? collection.destinations.filter(Boolean) : [];
  const tripStart = collection?.tripStart ? new Date(collection.tripStart).toISOString().slice(0, 10) : '';
  const tripEnd = collection?.tripEnd ? new Date(collection.tripEnd).toISOString().slice(0, 10) : '';
  const days = Array.isArray(plans)
    ? plans.map((p) => {
        const date = p?.date ? new Date(p.date).toISOString().slice(0, 10) : '';
        const city = p?.city || '';
        const hotel = typeof p?.hotel === 'string' ? p.hotel : (p?.hotel?.name || p?.hotel?.title || p?.hotel || '');
        const places = Array.isArray(p?.places)
          ? p.places.map((x) => (typeof x === 'string' ? x : x?.name || x?.title)).filter(Boolean)
          : [];
        const meals = p?.meals || {};
        const totalBudget = typeof p?.totalBudget === 'number' ? p.totalBudget : undefined;
        return { id: String(p?._id || ''), date, city, hotel, places, meals, totalBudget };
      })
    : [];
  return { name, destinations, tripStart, tripEnd, days };
}

function buildPrompt(n) {
  const header = `You are a travel planning assistant. Analyze the following trip collection and provide concise, practical suggestions. Keep the tone helpful and specific.`;
  const meta = [
    `Trip name: ${n.name}`,
    `Destinations: ${n.destinations.join(', ') || '-'}`,
    `Dates: ${n.tripStart || '-'} to ${n.tripEnd || '-'}`,
    ``,
    `Day plans:`,
    ...n.days.map((d, i) => {
      const mealsStr = Object.entries(d.meals || {})
        .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : v?.name || v}`)
        .join(', ');
      return [
        `  - Day ${i + 1}:`,
        `    Date: ${d.date || '-'}`,
        `    City: ${d.city || '-'}`,
        `    Hotel: ${d.hotel || '-'}`,
        `    Places: ${d.places?.length ? d.places.join(', ') : '-'}`,
        `    Meals: ${mealsStr || '-'}`,
        `    Budget: ${typeof d.totalBudget === 'number' ? `$${d.totalBudget}` : '-'}`,
      ].join('\n');
    }),
  ].join('\n');

  const ask = `
Provide:
- 3–5 additional places per destination (avoid duplicates) with short reasons.
- A better visiting order for each day if helpful (consider distance/time).
- Food tips near the selected hotel/places (cheap or must-try).
- Transport/logistics suggestions (local commute, time windows).
- Budget-saving ideas and any safety/seasonal notes.
Return in concise bullet points grouped by day and a short general tips section.`;

  return [header, meta, ask].join('\n\n');
}

async function loadCollectionAndPlans(collectionId) {
  const collection = await PlanCollectionModel.findById(collectionId).lean();
  if (!collection) {
    const err = new Error('Collection not found');
    err.status = 404;
    throw err;
  }
  const ids = Array.isArray(collection.dayPlans)
    ? collection.dayPlans
        .map((p) => (typeof p === 'object' ? p._id || p.id : p))
        .filter(Boolean)
    : [];
  const plans = ids.length ? await BudgetPlanModel.find({ _id: { $in: ids } }).lean() : [];
  return { collection, plans };
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error('GEMINI_API_KEY is not set on the server');
    err.status = 500;
    throw err;
  }
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(
    key
  )}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 800 },
    }),
  });

  if (!resp.ok) {
    let msg = '';
    try {
      const j = await resp.json();
      msg = j?.error?.message || '';
    } catch {}
    const err = new Error(msg || `Gemini request failed (${resp.status})`);
    err.status = resp.status;
    throw err;
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  return text || 'No suggestions generated.';
}

async function generateSuggestions(req, res) {
  try {
    let collection = req.body?.collection;
    let plans = req.body?.plans;
    const collectionId = req.body?.collectionId;

    if (!collection && collectionId) {
      const loaded = await loadCollectionAndPlans(collectionId);
      collection = loaded.collection;
      plans = loaded.plans;
    } else if (!collection || !plans) {
      return res.status(400).json({ message: 'Provide either { collectionId } or both { collection, plans }.' });
    }

    const normalized = normalizeInput(collection, plans);
    const prompt = buildPrompt(normalized);
    const suggestions = await callGemini(prompt);

    return res.json({ suggestions });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Failed to generate suggestions' });
  }
}

module.exports = { generateSuggestions };