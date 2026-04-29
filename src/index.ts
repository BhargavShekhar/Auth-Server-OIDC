import http from "node:http";

import createExpressApplication from "./app/index.js";
import "dotenv/config";

async function main() {
    console.log("VERIFY SECRET:", process.env.JWT_SECRET);
    console.log("VERIFY FILE:", import.meta.url);

    const PORT = process.env.PORT || 8080;

    const server = http.createServer(createExpressApplication());

    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT} on ${process.env.NODE_ENV}`);
    })
}

main().catch((err) => {
    console.log("could not start the server", err);
    process.exit(1);
});