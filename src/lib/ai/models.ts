import { createAzure } from "@ai-sdk/azure";
import { g } from "framer-motion/client";

const Azure = createAzure({
    resourceName: process.env.AZURE_FOUNDRY_RESOURCE_NAME,
    apiKey: process.env.AZURE_FOUNDRY_API_KEY!,
});

const models = {
    "gpt-4.1": {
        id: "gpt-4.1",
        name: "GPT-4.1",
        maxTokens: 32768,
        supportsStreaming: true
    },
    "gpt-5.2": {
        id: "gpt-5.2",
        name: "GPT-5.2",
        maxTokens: 32768,
        supportsStreaming: true
    },
    "gpt-5.4-mini": {
        id: "gpt-5.4-mini",
        name: "GPT-5.4 Mini",
        maxTokens: 32768,
        supportsStreaming: true
    },
    "gpt-5.4-nano": {
        id: "gpt-5.4-nano",
        name: "GPT-5.4 Nano",
        maxTokens: 32768,
        supportsStreaming: true
    },
    "text-embedding-3-small": {
        id: "text-embedding-3-small",
        name: "Text Embedding 3 Small",
        maxTokens: 8192,
        supportsStreaming: false
    }
}

export const chatModel = Azure("gpt-5.4-mini")
export const titleGenerationModel = Azure("gpt-5.4-nano");
export const embeddingModel = Azure.embeddingModel("text-embedding-3-small");