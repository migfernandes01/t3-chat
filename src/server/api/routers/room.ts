import { randomUUID } from "crypto";

import { observable } from "@trpc/server/observable";

import { Events } from "../../../constants/events";
import {
  type Message,
  sendMessageSchema,
  messageSubSchema,
} from "../../../constants/schemas";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const roomRouter = createTRPCRouter({
  // mutation to send a message (protectedProcedure since user needs to be auth'd)
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(({ ctx, input }) => {
      // create a message
      const message: Message = {
        id: randomUUID(),
        roomId: input.roomId,
        message: input.message,
        sentAt: new Date(),
        sender: {
          name: ctx.session?.user?.name ?? "unknown",
        },
      };

      // emit an event of type "SEND_MESSAGE"
      ctx.eventEmitter.emit(Events.SEND_MESSAGE, message);

      return message;
    }),

  // subscription that listens to SEND_MESSAGE events
  onSendMessage: publicProcedure
    .input(messageSubSchema)
    .subscription(({ ctx, input }) => {
      return observable<Message>((emit) => {
        // handler to emit data to client
        function onMessage(message: Message) {
          if (input.roomId === message.roomId) {
            //
            emit.next(message);
          }
        }

        // when SEND_MESSAGE event is received, call onMessage
        ctx.eventEmitter.on(Events.SEND_MESSAGE, onMessage);

        // function to unsubscribe when client disconnects
        return () => {
          ctx.eventEmitter.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    }),
});
