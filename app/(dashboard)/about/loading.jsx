import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AboutLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <LoadingSpinner size="lg" text="Loading about items..." />
    </div>
  );
}