"use client";

import React, { useState } from "react";

interface ProfileFormProps {
  username: string;
  onUpdate: (nickname: string) => void;
  onCancel: () => void;
}

const ProfileForm = ({ username, onUpdate,onCancel }: ProfileFormProps) => {
  const [nickname, setNickname] = useState(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() === "") return;
    onUpdate(nickname);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-lg font-semibold text-center">{username}'s Profile</h1>
      <form onSubmit={handleSubmit} className="mt-2">
        <label htmlFor="name" className="block text-sm font-medium">Name</label>
        <input
          type="text"
          id="name"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <div className="mt-3 flex justify-between">
          <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded-md">Save</button>
          <button
            type="button"
            className="bg-gray-200 text-black px-4 py-2 rounded-md"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
