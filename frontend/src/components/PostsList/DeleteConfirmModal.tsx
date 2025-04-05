interface DeleteConfirmModalProps {
    onConfirm: () => void;
    onCancel: () => void;
  }
  
  const DeleteConfirmModal = ({ onConfirm, onCancel }: DeleteConfirmModalProps) => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <p className="text-sm mb-4">say bye-bye to this comment?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-700 border rounded hover:bg-gray-100"
          >
            Nah
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            Bet
          </button>
        </div>
      </div>
    </div>
  );
  
  export default DeleteConfirmModal;