import DiscordClient from "./classes/client.js";

const client = new DiscordClient();
await client.connectStorage();
await client.clientLogin();

if (process.argv.includes("-i")) {
    client.updateInteractions();
}