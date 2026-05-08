import { type FC } from "react";
import { Loader2Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ThreadLoadingSpinner: FC = () => {
    return (
        <div className="flex h-full w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 px-8 py-6">

                <div className="relative">
                    <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                    <div className="absolute inset-0 rounded-full" />
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-sm font-medium">Loading your chat</p>
                </div>
            </div>
        </div>
    );
};

export const ThreadLoadingSkeleton: FC = () => {
    
    return (
        <div className="flex flex-col gap-y-8 w-full flex-1 py-4 px-2">
            {/* Assistant message */}
            {/* <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
            </div> */}
            {/* User message */}
            <div className="grid grid-cols-[minmax(72px,1fr)_auto]">
                <div className="col-start-2">
                    <Skeleton className="h-10 w-48 rounded-2xl" />
                </div>
            </div>
            {/* Assistant message */}
            <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3.5 w-1/2" />
            </div>
            {/* User message */}
            <div className="grid grid-cols-[minmax(72px,1fr)_auto]">
                <div className="col-start-2">
                    <Skeleton className="h-10 w-64 rounded-2xl" />
                </div>
            </div>
            {/* Assistant message */}
            <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-1/2" />
            </div>
        </div>
    );
};