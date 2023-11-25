export function ErrorMessage({ message }: { message: string }) {
  return <div className="invalid-feedback">{message}</div>;
}
