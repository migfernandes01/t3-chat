import { type NextPage } from "next";
import Head from "next/head";

import { customAlphabet } from "nanoid";
import { useRouter } from "next/router";

const createRandomId = customAlphabet("abcdefghijklmonpqrstuvxyz0123456789", 4);

const Home: NextPage = () => {
  const router = useRouter();

  async function createRoom() {
    const roomId = createRandomId();

    await router.push(`/rooms/${roomId}`);
  }

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <button
          onClick={() => {
            void (async () => {
              await createRoom();
            })();
          }}
          className="text-white"
        >
          create chat room
        </button>
      </main>
    </>
  );
};

export default Home;
