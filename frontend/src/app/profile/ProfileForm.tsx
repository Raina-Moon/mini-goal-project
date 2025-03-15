import React from 'react'

interface ProfileFormProps {
  username: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ username }) => {
  return (
    <div>
      <h1>${username}'s Profile</h1>
      <form>
        <div>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default ProfileForm