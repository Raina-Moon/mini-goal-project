interface PostContentProps {
    title: string;
    duration: number;
    imageUrl?: string;
    description: string;
  }
  
  const PostContent = ({ title, duration, imageUrl, description }: PostContentProps) => (
    <>
      <h2 className="font-semibold text-gray-900">title : {title}</h2>
      <p className="text-sm text-gray-600 mb-2">duration: {duration} min</p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post Image"
          className="w-full max-w-[600px] max-h-[750px] object-cover rounded-lg mb-2 mx-auto block"
        />
      )}
      <p className="text-sm text-gray-900">{description}</p>
    </>
  );
  
  export default PostContent;