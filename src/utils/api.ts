/**
 * This is the client-side entrypoint for your tRPC API.
 * It's used to create the `api` object which contains the Next.js App-wrapper
 * as well as your typesafe react-query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  wsLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { type AppRouter } from "../server/api/root";

function getEndingLink() {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    });
  }
  const client = createWSClient({
    url: "ws://localhost:3001",
  });
  return wsLink<AppRouter>({
    client,
  });
}

/**
 * A set of typesafe react-query hooks for your tRPC API
 */
export const api = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      /**
       * Transformer used for data de-serialization from the server
       * @see https://trpc.io/docs/data-transformers
       **/
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server
       * @see https://trpc.io/docs/links
       * */
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(),
      ],

      // return req headers if existent, empty object otherwise
      headers() {
        if (ctx?.req) {
          return {
            ...ctx.req.headers,
          };
        } else {
          return {};
        }
      },
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
