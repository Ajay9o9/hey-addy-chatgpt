"use strict"

const globalConfig = require("../config/config");
const EMAIL = globalConfig.EMAIL;
const PASSWORD = globalConfig.PASSWORD;



class ChatGPTClient {
    constructor() {
        this.email = EMAIL;
        this.password = PASSWORD;
    }

    async ask(prompt) {
        return await (async () => {
            const { ChatGPTAPI, getOpenAIAuth } = await import("chatgpt");
            const openAIAuth = await getOpenAIAuth({
                email: this.email,
                password: this.password,
            });

            const api = new ChatGPTAPI({...openAIAuth});
            await api.ensureAuth();

            const response = await api.sendMessage(
                prompt
            );
            return response;
          })();
    }
}

module.exports = ChatGPTClient;
