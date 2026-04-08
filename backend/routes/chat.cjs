const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
// Mongoose Models
const Event = require('../models/ScrapeRun'); // Using whatever models exist
const User = require('../models/User');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'MISSING_API_KEY'
});

// A simple Web Search completely free via DuckDuckGo HTML parsing
async function performWebSearch(query) {
    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
        const html = await response.text();
        
        // Very basic regex extraction of results
        const snippetRegex = /<a class="result__snippet[^>]*>(.*?)<\/a>/g;
        let match;
        let results = [];
        let count = 0;
        
        while ((match = snippetRegex.exec(html)) !== null && count < 5) {
            // Strip HTML tags
            const text = match[1].replace(/<\/?[^>]+(>|$)/g, "");
            results.push(text);
            count++;
        }
        
        return results.length > 0 ? results.join('\n') : 'No results found on the web.';
    } catch (e) {
        return 'Web search failed.';
    }
}

const ScrapedEvent = require('../models/ScrapedEvent');

// Database query function
async function queryDatabaseInfo(queryType) {
    if (queryType === 'athletes') {
        const count = await User.countDocuments();
        return `We currently have ${count} registered athletes in the AthNexus database.`;
    } else if (queryType === 'events') {
        const recentEvents = await ScrapedEvent.find().sort({ start_date: 1 }).limit(5);
        if (!recentEvents || recentEvents.length === 0) {
            return "There are currently no upcoming events found in the database.";
        }
        
        const eventSummaries = recentEvents.map(e => 
            `- ${e.title} (${e.sport}) occurring from ${new Date(e.start_date).toLocaleDateString()} to ${new Date(e.end_date).toLocaleDateString()} at ${e.location.venue}. Format: ${e.format}. Level: ${e.level.join(', ')}.`
        ).join('\n');
        
        return "Here is a list of the 5 most upcoming events:\n" + eventSummaries;
    }
    return 'Unknown database query type. Valid types are "athletes" and "events".';
}

router.post('/', async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ reply: 'Please add GROQ_API_KEY to your backend/.env file to enable the AI.' });
        }

        const { message, history } = req.body;
        
        // Convert history to Groq format
        const messages = [
            { role: "system", content: "You are the AthNexus Assistant, an AI built to help athletes find events and scout opportunities. You have access to the database and can search the web." },
            ...history.map(msg => ({ 
                role: msg.sender === 'bot' ? 'assistant' : 'user', 
                content: msg.text 
            })),
            { role: "user", content: message }
        ];

        // 1. Initial Call allowing tools
        const runner = await groq.chat.completions.create({
            model: "llama-3.1-70b-versatile",
            messages: messages,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "search_web",
                        description: "Search the external browser/web for real-time information",
                        parameters: {
                            type: "object",
                            properties: {
                                query: { type: "string", description: "The search query" }
                            },
                            required: ["query"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "query_database",
                        description: "Query the AthNexus MongoDB database for platform data",
                        parameters: {
                            type: "object",
                            properties: {
                                type: { type: "string", description: "Type of data to fetch: 'athletes' or 'events'" }
                            },
                            required: ["type"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        });

        const responseMessage = runner.choices[0].message;
        
        // 2. Process tool calls if any
        if (responseMessage.tool_calls) {
            messages.push(responseMessage);
            
            for (const toolCall of responseMessage.tool_calls) {
                const args = JSON.parse(toolCall.function.arguments);
                let funcResult = "";
                
                if (toolCall.function.name === "search_web") {
                    funcResult = await performWebSearch(args.query);
                } else if (toolCall.function.name === "query_database") {
                    funcResult = await queryDatabaseInfo(args.type);
                }
                
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: funcResult
                });
            }
            
            // 3. Get final response
            const finalResponse = await groq.chat.completions.create({
                model: "llama-3.1-70b-versatile",
                messages: messages
            });
            
            return res.json({ reply: finalResponse.choices[0].message.content });
        }

        // Return standard response
        res.json({ reply: responseMessage.content });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ reply: 'Sorry, I encountered an error connecting to the intelligence engine. Please ensure your API key limits aren\'t reached.' });
    }
});

module.exports = router;
