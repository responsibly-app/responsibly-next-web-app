
interface configItem {
    app_name?: string;
    // frontend_base_url: string; // exclude trailing slash (e.g., "http://localhost:3000")
    backend_base_url: string; // exclude trailing slash (e.g., "http://localhost:8000")
    landing_page_url: string; // exclude trailing slash (e.g., "http://localhost:3001")
};


// -------------------------------------------------------------------------------------
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || "local";
// console.log("USING CONFIG ENV:", ENVIRONMENT);
// -------------------------------------------------------------------------------------
export const appName = "Alvintech AI";
// -------------------------------------------------------------------------------------
export const config: { [env: string]: configItem } = {
    test: {
        app_name: appName,
        backend_base_url: "https://api.alvintech.ca",
        landing_page_url: "https://alvintech.ca",
    },
    prod: {
        app_name: appName,
        backend_base_url: "https://responsibly-next-web-app-yh7q.vercel.app",
        landing_page_url: "https://alvintech.ca",
    },
    local: {
        app_name: appName,
        backend_base_url: "http://localhost:3000",
        landing_page_url: "http://localhost:3001",
    },
    local_https: {
        app_name: appName,
        backend_base_url: "https://localhost:3000",
        landing_page_url: "https://localhost:3001",
    },
    ngrok: {
        app_name: appName,
        backend_base_url: "https://responsibly-next-web-app-yh7q.vercel.app",
        landing_page_url: "",
    },
};

// -------------------------------------------------------------------------------------
// EXAMPLE USAGE:
const ENVConfig = config[ENVIRONMENT];

export default ENVConfig;