const ChatGPTClient = require("../services/chatgpt");


const chatGPT = new ChatGPTClient();

class Thread {
    constructor() {}

    static async runTestExample() {
        await chatGPT.testExample();
    }

    static async getResponse(receivedThread, sentiment) {
        // Get the prompt
        const prompt = Thread.getPrompt(receivedThread, sentiment);
        const response = await chatGPT.ask(prompt);
        
        // ChatGPT sometimes tries to justify its response
        // Filter the justification out

        const isJustifying = response.includes(`"`)
        let filteredResponse = response;

        if (isJustifying) {
            const results = response.split(`"`)
            if (results.length > 1) {
                filteredResponse = results[1];
            }
        }
        console.log("raw ", response);
        console.log("filtered ", filteredResponse);

        return filteredResponse;
    }

    static getPrompt(receivedThread, sentiment) {
        const prompt = [];
        // Iterate through the thread to build the prompt
        for (let i = 0; i < receivedThread.length; i++) {
            const email = receivedThread[i];
            const text = email.text;
            const sender = email.sender;
            const receiver = email.receiver;
            
            // For first email in thread:
            if (i == 0) {
                prompt.push(
                    `${sender} sends the following email to 
                    ${receiver}: \n"${text}"
                `);
            } else { // For every other email in thread:
                prompt.push(
                    `${sender} responds to ${receiver} with: 
                    \n"${text}"
                `);
            }
        }
        // Get the last email in thread, add a call to action for chat gpt
        const lastEmail = receivedThread[receivedThread.length - 1];
        prompt.push(
            `what should ${lastEmail.receiver} say to sound ${sentiment}`
        );
        return prompt.join(" ");
    }

    
}
module.exports = Thread;
