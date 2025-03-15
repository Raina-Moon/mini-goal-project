'use client';

import React, { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import { getStoredUser } from "@/utils/api";

const page = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser)
  },[]);

  return <ProfileForm username={user.username} />;
};

export default page;
