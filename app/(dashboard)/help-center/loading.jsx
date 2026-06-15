import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function HelpCenterLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <LoadingSpinner size="lg" text="Loading help center..." />
    </div>
  );
}