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

    // 2. Add user's message to thread
    await openai.beta.threads.messages.create(thread, {
      role: 'user',
      content: userMessage,
    });

    // 3. Run the Assistant
    const run = await openai.beta.threads.runs.create(thread, {
      assistant_id: 'asst_maxNaHvWR6jWHgvZNHcQvtK0', // Your Assistant ID here
    });

    // 4. Poll until the run completes
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(thread, run.id);
      await new Promise(r => setTimeout(r, 1000)); // wait 1 sec
    } while (runStatus.status !== 'completed');

    // 5. Get latest message
    const messages = await openai.beta.threads.messages.list(thread);
    const lastMessage = messages.data.find(m => m.role === 'assistant');

    res.status(200).json({ threadId: thread, reply: lastMessage.content[0].text.value });
  } catch (err) {
    console.error('Error handling GPT assistant:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
