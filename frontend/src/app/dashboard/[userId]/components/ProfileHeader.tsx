import Link from "next/link";

interface ProfileHeaderProps {
  userId: number;
  storedId: number | null;
  username: string;
  profileImage: string | null;
}

const ProfileHeader = ({
  userId,
  username,
  storedId,
  profileImage,
}: ProfileHeaderProps) => (
  <>
    {userId === storedId ? (
      <Link href={`/profile/${userId}`}>
        <img
          src={profileImage ?? "/images/DefaultProfile.png"}
          className="w-[70px] h-[70px] rounded-full"
          alt={`${username}'s profile`}
        />
      </Link>
    ) : (
      <img
        src={profileImage ?? "/images/DefaultProfile.png"}
        className="w-[70px] h-[70px] rounded-full"
        alt={`${username}'s profile`}
      />
    )}
  </>
);

export default ProfileHeader;
