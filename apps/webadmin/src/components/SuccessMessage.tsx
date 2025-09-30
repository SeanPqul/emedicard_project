
type SuccessMessageProps = {
  message: string;
};

export default function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
