"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { CircleChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center min-h-screen w-full max-w-full overflow-x-hidden p-4">
        {/* TITLE FOR LANDING PAGE */}
        <div className="flex flex-col items-center gap-16 py-16">
          <h1 className="flex flex-col text-6xl font-bold gap-4">
            <span className="bg-orange-200 px-2 py-1 rounded-md">
              Read Better
            </span>
            <span className="bg-green-200 px-2 py-1 rounded-md">
              Live Brighter
            </span>
            <span className="bg-yellow-200 px-2 py-1 rounded-md">
              For Dyslexia
            </span>
          </h1>
          <h2 className="text-2xl font-regular">
            AI-Powered Tool for Dyslexia-Friendly Reading
          </h2>
        </div>
        {/* START BUTTON */}
        <div className="">
          <Card className="w-full max-w-sm flex flex-col items-center py-4 px-4 text-[#020402]">
            <Image
              className="rounded-lg"
              src="/card.png"
              width={300}
              height={200}
              alt=""
            ></Image>

            <div className="flex flex-row items-center gap-2 px-2 h-full w-full border-t pt-4">
              <div className="px-2 text-sm ">
                {" "}
                Convert text into dyslexia-friendly font
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link href="/upload">Go</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/leximate">Try LexiMate</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
