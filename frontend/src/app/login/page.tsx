"use client";

import LoginForm from "./LoginForm";

const page = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-primary-300 to-primary-600">
      <LoginForm />
    </div>
  );
};

export default page;
