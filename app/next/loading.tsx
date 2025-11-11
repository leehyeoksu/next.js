import React from "react";
import Spinner from "../components/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <Spinner label="loading..." size={24} />
    </div>
  );
}

