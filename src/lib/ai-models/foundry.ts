import { createAzure } from "@ai-sdk/azure";

  const Azure = createAzure({
    resourceName: process.env.AZURE_FOUNDRY_RESOURCE_NAME,
    apiKey: process.env.AZURE_FOUNDRY_API_KEY!,
  });

export const chatModel = Azure("gpt-5.2")
export const titleGenerationModel = Azure("gpt-5.2");
export const embeddingModel = Azure.embeddingModel("text-embedding-3-small");