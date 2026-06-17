import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function SuccessStoriesLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <LoadingSpinner size="lg" text="Loading success stories..." />
    </div>
  );
}