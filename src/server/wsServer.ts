// web socket server
import { Server } from "ws";

import { applyWSSHandler } from "@trpc/server/adapters/ws";

import { appRouter } from "./api/root";
import { createTRPCContext } from "./api/trpc";

// create new web socket server on port 3001
const wss = new Server({
  port: 3001,
});

// create a trpc ws handler using ws server, trpc context, and app router
const handler = applyWSSHandler({
  wss,
  createContext: createTRPCContext,
  router: appRouter,
});

// log ws connection/close
wss.on("connection", () => {
  console.log(`++ ws connection ${wss.clients.size}`);

  wss.on("close", () => {
    console.log(`-- ws connection ${wss.clients.size}`);
  });
});

console.log("ws server started");

// when getting a kill signal
process.on("SIGTERM", () => {
  console.log("KILL SIGNAL");

  // issue a reconnect notification
  handler.broadcastReconnectNotification();

  // close web socket connection
  wss.close();
});
