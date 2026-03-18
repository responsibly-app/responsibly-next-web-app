
interface configItem {
    app_name?: string;
    frontend_base_url: string; // exclude trailing slash (e.g., "http://localhost:3000")
    backend_base_url: string; // exclude trailing slash (e.g., "http://localhost:8000")
    landing_page_url: string; // exclude trailing slash (e.g., "http://localhost:3001")
}

// -------------------------------------------------------------------------------------
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || "local";
// console.log("USING CONFIG ENV:", ENVIRONMENT);
// -------------------------------------------------------------------------------------
export const appName = "Alvintech AI";
// -------------------------------------------------------------------------------------
export const config: { [env: string]: configItem } = {
    test: {
        app_name: appName,
        frontend_base_url: "https://app.alvintech.ca",
        backend_base_url: "https://api.alvintech.ca",
        landing_page_url: "https://alvintech.ca",
    },
    prod: {
        app_name: appName,
        frontend_base_url: "https://app.alvintech.ca",
        backend_base_url: "https://api.alvintech.ca",
        landing_page_url: "https://alvintech.ca",
    },
    local: {
        app_name: appName,
        frontend_base_url: "http://localhost:3000",
        backend_base_url: "http://localhost:8001",
        landing_page_url: "http://localhost:3001",
    },
    ngrok: {
        app_name: appName,
        frontend_base_url: "",
        backend_base_url: "https://3144-2001-569-7bfc-3a00-f1f4-1327-a19e-63c9.ngrok-free.app",
        landing_page_url: "",
    },
};

// -------------------------------------------------------------------------------------
// EXAMPLE USAGE:
const ENVConfig = config[ENVIRONMENT];

export default ENVConfig;