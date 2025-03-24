import Link from "next/link";

interface ProfileHeaderProps {
  userId: number;
  storedId: number | null;
  username: string;
  profileImage: string | null;
}

const ProfileHeader = ({ userId, storedId, username, profileImage }: ProfileHeaderProps) => (
  <>
    {userId === storedId ? (
      <Link href={`/profile/${userId}`}>
        <img src={profileImage ?? "/default-profile.png"} className="w-[70px] h-[70px] rounded-full" />
      </Link>
    ) : (
      <img src={profileImage ?? "/default-profile.png"} className="w-[70px] h-[70px] rounded-full" />
    )}
    <h1 className="text-2xl font-bold mb-4 text-emerald-600">📋 {username}&apos;s grab goals</h1>
  </>
);

export default ProfileHeader;