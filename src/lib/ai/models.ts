import { createAzure } from "@ai-sdk/azure";
import { createOpenAI, OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const BASE_URL = "https://als-litellm-cnfcftage7dgh9aa.canadacentral-01.azurewebsites.net";
const API_KEY = process.env.MODEL_API_KEY!;

interface ProviderConfig {
    models: {
        primaryChatModel: any,
        fallbackChatModel: any,
        titleGenerationModel: any,
        embeddingModel?: any,
        imageGenerationModel?: any,
    },
    providerOptions: any,
}

const Azure = createAzure({
    resourceName: process.env.AZURE_FOUNDRY_RESOURCE_NAME,
    apiKey: process.env.AZURE_FOUNDRY_API_KEY!,
});

const AzureImage = createAzure({
    resourceName: process.env.AZURE_FOUNDRY_IMAGE_RESOURCE_NAME,
    apiKey: process.env.AZURE_FOUNDRY_IMAGE_API_KEY!,
});

const AzureConfig: ProviderConfig = {
    models: {
        primaryChatModel: Azure("gpt-5.4-mini"),
        fallbackChatModel: Azure("gpt-5.4-nano"),
        titleGenerationModel: Azure("gpt-5.4-nano"),
        embeddingModel: Azure.embeddingModel("text-embedding-3-small"),
        imageGenerationModel: AzureImage.image("gpt-image-1-mini")
    },
    providerOptions: {
        azure: { reasoningEffort: "low" },
    }
}

// ---------------------------------------------------------------------------------------
const OpenAI = createOpenAI({
    baseURL: BASE_URL,
    apiKey: API_KEY,
});

const OpenAIConfig: ProviderConfig = {
    models: {
        primaryChatModel: OpenAI("als-gpt-5.4-mini"),
        fallbackChatModel: OpenAI("als-gpt-5.4-mini"),
        titleGenerationModel: OpenAI("als-gpt-5.4-mini"),
        embeddingModel: OpenAI.embeddingModel("text-embedding-3-small"),
        imageGenerationModel: OpenAI.image("gpt-image-1-mini")
    },
    providerOptions: {
        openai: {
            parallelToolCalls: true,
            //   store: false,
            //   user: 'user_123',
            maxToolCalls: 10,
            reasoningEffort: "medium",
        } satisfies OpenAILanguageModelResponsesOptions,
    }
}

// ---------------------------------------------------------------------------------------

const Anthropic = createAnthropic({
    baseURL: BASE_URL,
    apiKey: API_KEY,
});

const AnthropicConfig: ProviderConfig = {
    models: {
        primaryChatModel: Anthropic("als-claude-sonnet-4-6"),
        fallbackChatModel: Anthropic("als-claude-sonnet-4-6"),
        titleGenerationModel: Anthropic("als-claude-sonnet-4-6"),
    },
    providerOptions: {
        anthropic: { reasoningEffort: "low" },
    }
}



// ---------------------------------------------------------------------------------------


export const primaryChatModel = OpenAIConfig.models.primaryChatModel;
export const fallbackChatModel = OpenAIConfig.models.fallbackChatModel;
export const titleGenerationModel = OpenAIConfig.models.titleGenerationModel;
export const embeddingModel = OpenAIConfig.models.embeddingModel;
export const imageGenerationModel = OpenAIConfig.models.imageGenerationModel;
export const providerOptions = OpenAIConfig.providerOptions;