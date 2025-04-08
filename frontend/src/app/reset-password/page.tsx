"use client";

import React, { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

const page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      }
    >
      <div className="bg-primary-500 min-h-screen font-inter">
        <ResetPasswordForm />
      </div>
    </Suspense>
  );
};

export default page;
