import React from "react";
import type { Metadata } from "next";
import { SkiddleVenue, IPhoneFrame } from '../../../components/SkiddleVenue';

export const metadata: Metadata = {
  title: "Hare And Hounds Kings Heath | Skiddle Venue",
  description: "Skiddle venue 3D view",
};

const venue = {
  id: "38952",
  name: "Hare And Hounds Kings Heath",
  address: "106 High Street, Kings Heath",
  town: "Birmingham",
  postcode: "B14 7JZ",
  countrycode: "GB",
  cityname: "Birmingham",
  phone: "0121 444 2081",
  latitude: "52.43462200",
  longitude: "-1.89298000",
  link: "https://www.skiddle.com/whats-on/Birmingham/Hare-And-Hounds-Kings-Heath/",
};

export default function GpxRouteSkiddleVenuePage() {
  const host = process.env.NEXT_PUBLIC_GPXROUTE_HOST || "http://localhost:3001";

  return (
    <main
      className="w-full h-[100dvh] min-h-screen flex items-center justify-center p-0 md:p-4 bg-slate-950 overflow-hidden"
      style={{
        width: "100%",
        height: "100dvh",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        overflow: "hidden",
      }}
    >
      <IPhoneFrame variant="dark">
        <SkiddleVenue
          host={host}
          venue={venue}
          width="100%"
          height="100%"
          borderRadius={0}
        />
      </IPhoneFrame>
    </main>
  );
}
