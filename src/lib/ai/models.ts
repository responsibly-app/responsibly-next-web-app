import { createAzure } from "@ai-sdk/azure";

const Azure = createAzure({
    resourceName: process.env.AZURE_FOUNDRY_RESOURCE_NAME,
    apiKey: process.env.AZURE_FOUNDRY_API_KEY!,
});

export const primaryChatModel = Azure("gpt-5.4-mini");
export const fallbackChatModel = Azure("gpt-5.4-nano");
export const titleGenerationModel = Azure("gpt-5.4-nano");
export const embeddingModel = Azure.embeddingModel("text-embedding-3-small");
