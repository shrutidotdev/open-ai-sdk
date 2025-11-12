import 'dotenv/config';
import { Agent, tool, run } from '@openai/agents';
import {z} from 'zod';
import fs from 'node:fs/promises';

// Define shoes data
const shoes = [
    { shoe_id: 1, name_of_the_shoe: "Running Shoes", price: 59.99, sizes: [7, 8, 9, 10, 11] },
    { shoe_id: 2, name_of_the_shoe: "Basketball Shoes", price: 89.99, sizes: [8, 9, 10, 11, 12] },
    { shoe_id: 3, name_of_the_shoe: "Casual Sneakers", price: 49.99, sizes: [6, 7, 8, 9, 10] },
    { shoe_id: 4, name_of_the_shoe: "Formal Shoes", price: 79.99, sizes: [7, 8, 9, 10, 11] },
    { shoe_id: 5, name_of_the_shoe: "Sandals", price: 29.99, sizes: [6, 7, 8, 9, 10] }
];

// List shoes 
const shoe_store = tool({
    name: 'show_store',
    description: "List all available shoes in the store along with their details.",
    parameters: z.object({}),
    execute: async function () {
        return JSON.stringify(shoes, null, 2);
    }
})

const customer_details = tool({
    name: 'log_customer_inquiry',
    description: "Log customer shoe inquiries.",
    parameters: z.object({
        shoe_id: z.number().nullable().describe("The id of the shoe, or null if not specified"),
        purpose: z.string().describe("The purpose of the shoe"),
        range: z.string().nullable().describe("The price range, or null if not specified"),
    }), 
    execute: async function ({ shoe_id, purpose, range }) {
        await fs.appendFile(
            './shoe_store_log.txt',
            `Customer Inquiry: Show ID - ${shoe_id || 'N/A'}, Purpose - ${purpose}, Range - ${range || 'N/A'}\n`,
            'utf-8'
        );
        return { message: "Customer inquiry logged successfully.", resolved: true };
    }
});



const shoe_store_agent = new Agent({
    name: 'Shoe Store Agent',
    instructions: "You are a helpful shoe store agent. Your job is to assist customers in finding the perfect pair of shoes based on their preferences and needs.",
    tools: [shoe_store, customer_details]
})

const customer_support_agent = new Agent({
    name: "Customer Support Agent",
    instructions: "You are a helpful customer support agent. For shoe-related inquiries, hand off to the Shoe Store Agent",
    handoffs: [shoe_store_agent]
})

async function getShoeStoreAgent() {
    try {
        const result = await run(customer_support_agent, "I need a running shoes for running within a budget of $60. Can you help me?")
        console.log("Final Output from the agent is: ", result.finalOutput);
    } catch (error) {
        console.error("Error running the agent:", error);
    }
}
getShoeStoreAgent();