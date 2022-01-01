import Head from "next/head";
import Center from "../components/Center";
import Sidebar from "../components/Sidebar";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import Player from "../components/Player";
import { useSpotify } from "../hooks/useSpotify";
import { availableDevices } from "../atoms/availabelDevicesAtom";
import { useRecoilState } from "recoil";

export default function Home() {
  const spotifyApi = useSpotify();
  const [availableDeviceId, setAvailableDeviceId] =
    useRecoilState(availableDevices);

  useEffect(() => {
    spotifyApi.getMyDevices().then(
      function (data) {
        let availableDevices = data.body.devices;
        setAvailableDeviceId(availableDevices?.[0]?.id);
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  }, []);

  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Spotify 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex ">
        <Sidebar />
        <Center />
      </main>

      <div className="sticky bottom-0">
        <Player />
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
