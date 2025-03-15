"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const page = () => {
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId && storedUserId !== "undefined") {
      try {
        setUserId(JSON.parse(storedUserId));
      } catch (error) {
        console.error("Failed to parse userId:", error);
        setUserId(null); // Reset userId if parsing fails
      }
    }
  }, []);

  return (
    <div>
      <Link href="/signup">
        <button>Sign Up</button>
      </Link>
      <Link href={`/profile/${userId}`}>
        <button>Profile</button>
      </Link>
    </div>
  );
};

export default page;
