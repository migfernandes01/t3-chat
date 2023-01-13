import { type Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type FormEvent, useState } from "react";

import { type Message } from "../../constants/schemas";
import { api } from "../../utils/api";

export default function RoomPage(): React.ReactElement {
  const { query } = useRouter();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const roomId = query.roomId as string;

  const { mutateAsync: sendMessage } = api.room.sendMessage.useMutation();

  // useSubscription to SEND_MESSAGE events and add it to messages if successful
  api.room.onSendMessage.useSubscription(
    { roomId },
    {
      onData(messages) {
        setMessages((m) => [...m, messages]);
      },
      onError(err) {
        console.error("Subscription error:", err);
      },
    }
  );

  if (!session) {
    return (
      <div>
        You need to be logged in to access a room
        <br />
        <button
          onClick={() => {
            void signIn();
          }}
        >
          Login
        </button>
      </div>
    );
  }

  async function onSubmitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await sendMessage({ roomId, message });

    console.log("onSubmitMessage");

    setMessage("");
  }

  return (
    <div className="flex h-screen flex-col">
      <h2>Welcome to room {roomId}</h2>
      <div className="flex-1">
        <ul className="flex flex-col p-4">
          {messages.map((m) => {
            return <MessageItem key={m.id} message={m} session={session} />;
          })}
        </ul>
        <form
          onSubmit={(e) => {
            void (async () => {
              await onSubmitMessage(e);
            })();
          }}
          className="flex flex-col"
        >
          <textarea
            className="black w-full rounded-md border border-gray-700 bg-gray-50 p-2.5 text-gray-700"
            placeholder="message"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          ></textarea>
          <button className="flex-1 bg-gray-900 p-2.5 text-white" type="submit">
            send message
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageItem({
  message,
  session,
}: {
  message: Message;
  session: Session;
}): React.ReactElement {
  const baseStyles =
    "mb-4 text-md w-7/12 p-4 text-gray-700 border border-gray-700 rounded-md";

  const liStyles =
    message.sender.name === session.user?.name
      ? baseStyles
      : baseStyles.concat(" self-end bg-grey-700 text-white");

  return (
    <li className={liStyles}>
      <div className="flex">
        <time>
          {message.sentAt.toLocaleTimeString("en-US", { timeStyle: "short" })}
        </time>
        <p> - </p>
        <p>
          {message.sender.name}: {message.message}
        </p>
      </div>
    </li>
  );
}
