import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-2 rounded-full shadow-md">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CarDJ</h1>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome, {user?.username}!</CardTitle>
            <CardDescription>
              You're now logged in to CarDJ, your road trip's perfect soundtrack creator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is a protected page that only authenticated users can access.
              You've successfully logged in with your credentials.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
