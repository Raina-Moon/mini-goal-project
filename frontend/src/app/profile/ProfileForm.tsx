"use client";

import React, { useState } from "react";

interface ProfileFormProps {
  username: string;
  onUpdate: (nickname: string) => void;
}

const ProfileForm = ({ username,onUpdate}:ProfileFormProps) => {
  const [nickname, setNickname] = useState(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(nickname);
  };

  return (
    <div>
      <h1>{username}'s Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Username</button>
      </form>
    </div>
  );
};

export default ProfileForm;
