import { Agent, run } from "@openai/agents";
import 'dotenv/config';

const agent = new Agent({
    name: "My Agent",
    instructions: "An example agent using OpenAI SDK and your job is to just tell a joke",
});

console.log("Running agent...");

const result = await run(agent, "What is up? my friend");
//console.log("Agent response the whole thing:", result);
console.log("final output", result.finalOutput);



console.log("Done.");
console.log("Tracking usage from the last response.", result.state._lastTurnResponse.usage);