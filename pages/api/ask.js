import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // NEVER expose this in the frontend
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { threadId, userMessage } = req.body;

  try {
    let thread = threadId;

    // 1. Create a new thread if none exists
    if (!thread) {
      const threadResponse = await openai.beta.threads.create();
      thread = threadResponse.id;
    }

    // 2. Add user's message to the thread
    await openai.beta.threads.messages.create(thread, {
      role: 'user',
      content: userMessage,
    });

    // 3. Run the assistant
    const run = await openai.beta.threads.runs.create(thread, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID, // safer + cleaner
    });

    // 4. Poll until the run completes (with timeout)
    let runStatus;
    let attempts = 0;
    const maxAttempts = 30;

    do {
      await new Promise(r => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread, run.id);
      attempts++;
    } while (runStatus.status !== 'completed' && attempts < maxAttempts);

    if (runStatus.status !== 'completed') {
      throw new Error('Assistant response timed out.');
    }

    // 5. Get the latest assistant reply
    const messages = await openai.beta.threads.messages.list(thread, { limit: 5 });
    const assistantReply = messages.data.find(m => m.role === 'assistant');

    if (!assistantReply) {
      throw new Error('No assistant reply found.');
    }

    const responseText = assistantReply.content
      .map(part => part?.text?.value)
      .filter(Boolean)
      .join('\n');

    res.status(200).json({ threadId: thread, reply: responseText });
  } catch (err) {
    console.error('Error handling GPT assistant:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
