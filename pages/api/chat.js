// pages/api/chat.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview', // or 'gpt-4o' if you want faster re
