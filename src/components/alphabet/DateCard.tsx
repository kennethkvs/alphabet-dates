"use client";
import React from "react";
import Link from "next/link";

type Props = {
  date: any;
};

export default function DateCard({ date }: Props) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{date.letter}</div>
          <div className="text-lg">{date.title}</div>
          {date.scheduled_at && (
            <div className="text-sm text-gray-500">
              Scheduled: {new Date(date.scheduled_at).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Link href={`/alphabet-dates/${date.id}`} className="text-indigo-600">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
