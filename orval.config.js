import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
console.log("USING CONFIG ENV:", process.env.NEXT_PUBLIC_ENV);

import { config } from "./src/config";
import { defineConfig } from 'orval';

const orvalOutputPath = "src/orval";
const backendBaseURL = config[process.env.NEXT_PUBLIC_ENV].backend_base_url;

export default defineConfig({
    api: {
        input: {
            target: `${backendBaseURL}/api/v1/openapi.json`,
        },
        output: {
            mode: 'tags-split',
            target: `${orvalOutputPath}/hooks/index.ts`,
            schemas: `${orvalOutputPath}/model`,
            client: 'react-query',
            mock: false,
            baseUrl: {
                getBaseUrlFromSpecification: true,
            },
            prettier: true,
            override: {
                mutator: {
                    path: './src/lib/orval-clients/orval-client-fetch.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
