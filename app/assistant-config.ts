export let assistantId = "asst_5D5B1w7U2iMYGPcNtBkADIW9"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
