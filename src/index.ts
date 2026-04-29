import http from "node:http";

import createExpressApplication from "./app/index.js";

async function main() {
    try {
        const PORT = process.env.PORT || 8080;

        const server = http.createServer(createExpressApplication());

        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        })
    } catch (error) {
        console.log("Could not start server");
        throw error;
    }
}

main();