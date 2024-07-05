type UpdateHistoryProps = {
  history: Date;
};
export default function UpdateHistory({ history }: UpdateHistoryProps) {
  return <>updated: {history}</>;
}
