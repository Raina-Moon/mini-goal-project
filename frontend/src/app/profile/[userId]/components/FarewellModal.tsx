import React from "react";

const FarewellModal: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Goodbye!</h2>
        <p className="mb-4">
          It was a pleasure having you. Hope to see you again!
        </p>
      </div>
    </div>
  );
};

export default FarewellModal;
