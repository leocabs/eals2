export default function DeleteConfirmationModal({   isOpen,
  onConfirm,
  onCancel,
  title = "Confirm Deletion",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h3 className="text-lg font-bold mb-4">{title}</h3>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
  );
}
