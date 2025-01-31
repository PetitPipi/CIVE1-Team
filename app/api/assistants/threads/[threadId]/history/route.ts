import { openai } from "@/app/openai";

export async function GET(request, { params: { threadId } }) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return Response.json({
      threadId,
      messages: messages.data
    });
  } catch (error) {
    console.error('Failed to load thread history:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}