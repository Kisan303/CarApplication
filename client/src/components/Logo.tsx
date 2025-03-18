import { Music } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-white p-2 rounded-full shadow-md">
        <Music className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">CarDJ</h1>
    </div>
  );
}
