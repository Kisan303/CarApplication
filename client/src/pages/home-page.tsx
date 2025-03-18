import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Music, LogOut, PlayCircle, PauseCircle, SkipBack, SkipForward, 
  Volume2, Repeat, Shuffle, Heart, ListMusic, Radio, Home, Search, Library, 
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { Track, Playlist } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Custom track item component for consistency across the app
const TrackItem = ({ 
  track, 
  isActive = false, 
  onSelect 
}: { 
  track: Track; 
  isActive?: boolean;
  onSelect?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-slate-100 ${isActive ? 'bg-slate-100' : ''}`}
      onClick={onSelect}
    >
      <Avatar className="h-10 w-10 rounded-md">
        <AvatarImage src={track.coverImage || ''} alt={track.title} />
        <AvatarFallback className="rounded-md bg-slate-300">
          {track.title ? track.title.substring(0, 2) : '♪'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{track.title}</div>
        <div className="text-xs text-slate-500 truncate">{track.artist}</div>
      </div>
      <div className="text-xs text-slate-500">
        {formatDuration(track.duration)}
      </div>
    </motion.div>
  );
};

// Custom playlist item for the sidebar
const PlaylistItem = ({ 
  playlist, 
  isActive = false, 
  onSelect 
}: { 
  playlist: Playlist; 
  isActive?: boolean;
  onSelect?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-slate-100 ${isActive ? 'bg-slate-100' : ''}`}
      onClick={onSelect}
    >
      <Avatar className="h-10 w-10 rounded-md">
        <AvatarImage src={playlist.coverImage || ''} alt={playlist.name} />
        <AvatarFallback className="rounded-md bg-primary/20">
          {playlist.name ? playlist.name.substring(0, 2) : 'PL'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{playlist.name}</div>
        <div className="text-xs text-slate-500 truncate">{playlist.songCount} songs</div>
      </div>
    </motion.div>
  );
};

// Format seconds to mm:ss
const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Main component
export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // State for music player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  // Fetch playlists
  const { 
    data: playlists = [], 
    isLoading: isLoadingPlaylists 
  } = useQuery<Playlist[]>({
    queryKey: ['/api/playlists'],
    queryFn: getQueryFn({ on401: "throw" }),
    onError: (error: Error) => {
      toast({
        title: "Error loading playlists",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Fetch tracks for the selected playlist
  const { 
    data: playlistTracks = [], 
    isLoading: isLoadingTracks 
  } = useQuery<Track[]>({
    queryKey: ['/api/playlists', currentPlaylist?.id, 'tracks'],
    queryFn: currentPlaylist ? getQueryFn({ on401: "throw" }) : () => Promise.resolve([]),
    enabled: !!currentPlaylist,
    onError: (error: Error) => {
      toast({
        title: "Error loading tracks",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Fetch recommendations
  const { 
    data: recommendations = [], 
    isLoading: isLoadingRecommendations 
  } = useQuery<Track[]>({
    queryKey: ['/api/recommendations'],
    queryFn: getQueryFn({ on401: "throw" }),
    onError: (error: Error) => {
      console.error("Failed to load recommendations:", error);
      // Don't show error toast for recommendations as they're not critical
    }
  });
  
  // Set initial playlist when data loads
  useEffect(() => {
    if (playlists.length > 0 && !currentPlaylist) {
      setCurrentPlaylist(playlists[0]);
    }
  }, [playlists, currentPlaylist]);
  
  // Play/Pause handler
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    
    // In a real app, this would control actual audio playback
    if (!isPlaying && !currentTrack && playlistTracks.length > 0) {
      setCurrentTrack(playlistTracks[0]);
    }
  };
  
  // Track selection handler
  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setPlaybackProgress(0);
  };
  
  // Playlist selection handler
  const handlePlaylistSelect = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentTrack(null);
    setPlaybackProgress(0);
    setIsPlaying(false);
  };
  
  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            // Move to next track or stop
            clearInterval(interval);
            return 0;
          }
          return prev + 0.5;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);
  
  // Logout handler
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <div className="p-2">
            <svg className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.8-.179-.92-.601-.122-.418.18-.8.6-.92 4.56-1.021 8.52-.6 11.64 1.32.42.24.48.66.24 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div className="flex-1 flex justify-center">
            <svg className="h-8 w-24 text-white" viewBox="0 0 100 24" fill="currentColor">
              <path d="M11.57 0c-.97 0-2.21.26-3.27.87-1.69.97-2.49 2.47-2.49 4.09 0 2.08 1.3 3.31 2.73 4.02l1.95.97c1.3.65 2.47 1.3 2.47 2.73 0 1.43-1.17 2.34-2.73 2.34-1.56 0-2.47-.78-3.12-1.69l-1.95 1.17c.91 1.69 2.73 2.86 5.07 2.86 2.6 0 4.93-1.56 4.93-4.15 0-2.08-1.3-3.31-2.73-4.02l-1.95-.97c-1.3-.65-2.47-1.3-2.47-2.73 0-1.43 1.17-2.34 2.73-2.34 1.56 0 2.47.78 3.12 1.69l1.95-1.17C14.83 1.17 13.01 0 11.57 0zM24.7 0c-2.6 0-4.93 1.56-4.93 4.15 0 2.08 1.3 3.31 2.73 4.02l1.95.97c1.3.65 2.47 1.3 2.47 2.73 0 1.43-1.17 2.34-2.73 2.34-1.56 0-2.47-.78-3.12-1.69l-1.95 1.17c.91 1.69 2.73 2.86 5.07 2.86 2.6 0 4.93-1.56 4.93-4.15 0-2.08-1.3-3.31-2.73-4.02l-1.95-.97c-1.3-.65-2.47-1.3-2.47-2.73 0-1.43 1.17-2.34 2.73-2.34 1.56 0 2.47.78 3.12 1.69l1.95-1.17C27.96 1.17 26.14 0 24.7 0z"/>
            </svg>
          </div>
          <div className="p-2">
            <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.88 17.52c-.12.18-.36.24-.54.12-3.48-2.12-7.86-2.6-13.02-1.42-.18.06-.36-.06-.42-.24-.06-.18.06-.36.24-.42 5.64-1.28 10.38-.73 14.16 1.58.18.12.24.36.12.54zm1.56-3.48c-.12.24-.42.3-.66.18-3.98-2.44-10.02-3.16-14.76-1.72-.24.06-.48-.06-.54-.3-.06-.24.06-.48.3-.54 5.34-1.62 11.88-.84 16.38 1.86.24.12.3.42.18.66zm.18-3.6c-4.8-2.82-12.6-3.06-17.16-1.68-.36.12-.72-.06-.84-.42-.12-.36.06-.72.42-.84 5.22-1.56 13.86-1.26 19.26 1.98.3.18.42.6.24.9-.18.3-.6.42-.9.24z"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 ring-2 ring-primary">
              <AvatarFallback className="bg-gray-800 text-white">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white">{user?.username}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>
      
      {/* Main three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Playlists Navigation */}
        <div className="w-64 border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 flex flex-col space-y-6">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Library className="h-4 w-4 mr-2" />
                Your Library
              </Button>
            </div>
            
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Liked Songs
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="p-3 text-sm font-medium text-slate-700">Your Playlists</div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoadingPlaylists ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-14 rounded-md bg-slate-100 animate-pulse" />
                ))
              ) : (
                playlists.map(playlist => (
                  <PlaylistItem 
                    key={playlist.id} 
                    playlist={playlist}
                    isActive={currentPlaylist?.id === playlist.id}
                    onSelect={() => handlePlaylistSelect(playlist)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Column 2: Tracks Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 bg-gradient-to-b from-primary/10 to-white">
            {currentPlaylist && (
              <div className="flex items-start space-x-6">
                <div className="w-36 h-36 rounded-md overflow-hidden shadow-lg">
                  <img 
                    src={currentPlaylist.coverImage || '/images/default-playlist.jpg'} 
                    alt={currentPlaylist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm uppercase text-slate-500 font-medium">Playlist</div>
                  <h1 className="text-3xl font-bold mt-1 mb-2">{currentPlaylist.name}</h1>
                  <p className="text-slate-600 text-sm mb-4">{currentPlaylist.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span className="font-medium">{user?.username}</span>
                    <span>•</span>
                    <span>{currentPlaylist.songCount} songs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 flex items-center space-x-4">
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-primary"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <PauseCircle className="h-8 w-8 text-white" />
              ) : (
                <PlayCircle className="h-8 w-8 text-white" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex px-6 py-2 text-sm font-medium text-slate-500">
            <div className="w-8">#</div>
            <div className="flex-1">Title</div>
            <div className="w-32">Album</div>
            <div className="w-24 text-right">Duration</div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="px-2">
              {isLoadingTracks ? (
                Array(10).fill(0).map((_, i) => (
                  <div key={i} className="h-14 mx-2 my-1 rounded-md bg-slate-100 animate-pulse" />
                ))
              ) : playlistTracks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  This playlist is empty
                </div>
              ) : (
                playlistTracks.map((track, index) => (
                  <div 
                    key={track.id}
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-slate-100 ${currentTrack?.id === track.id ? 'bg-slate-100' : ''}`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <div className="w-8 text-slate-400">{index + 1}</div>
                    <div className="flex-1 flex items-center space-x-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={track.coverImage || ''} alt={track.title} />
                        <AvatarFallback className="rounded-md bg-slate-300">
                          {track.title ? track.title.substring(0, 2) : '♪'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-medium ${currentTrack?.id === track.id ? 'text-primary' : ''}`}>
                          {track.title}
                        </div>
                        <div className="text-sm text-slate-500">{track.artist}</div>
                      </div>
                    </div>
                    <div className="w-32 text-sm text-slate-500 truncate">{track.album}</div>
                    <div className="w-24 text-right text-sm text-slate-500">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Column 3: Recommendations */}
        <div className="w-72 border-l border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50">
            <h2 className="text-lg font-semibold mb-1">Recommended For You</h2>
            <p className="text-xs text-slate-500">Based on your listening history</p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {isLoadingRecommendations ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-14 rounded-md bg-slate-100 animate-pulse" />
                ))
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No recommendations available
                </div>
              ) : (
                recommendations.map(track => (
                  <TrackItem 
                    key={track.id} 
                    track={track}
                    isActive={currentTrack?.id === track.id}
                    onSelect={() => handleTrackSelect(track)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-slate-200">
            <Tabs defaultValue="discover">
              <TabsList className="w-full">
                <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
                <TabsTrigger value="friends" className="flex-1">Friends</TabsTrigger>
              </TabsList>
              <TabsContent value="discover" className="pt-3">
                <div className="text-sm text-slate-500">
                  Find new music by genre:
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">Pop</Badge>
                  <Badge variant="outline">Anime</Badge>
                  <Badge variant="outline">Soundtracks</Badge>
                  <Badge variant="outline">Jazz</Badge>
                  <Badge variant="outline">K-Pop</Badge>
                </div>
              </TabsContent>
              <TabsContent value="friends" className="pt-3">
                <div className="text-sm text-slate-500 text-center py-4">
                  Connect with friends to see what they're listening to.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Music Player Controls (Bottom) */}
      <div className="h-20 border-t border-slate-200 bg-white flex items-center px-4">
        {/* Track info */}
        <div className="flex items-center w-72">
          {currentTrack ? (
            <>
              <Avatar className="h-12 w-12 rounded-md mr-3">
                <AvatarImage src={currentTrack.coverImage || ''} alt={currentTrack.title} />
                <AvatarFallback className="rounded-md bg-slate-300">
                  {currentTrack.title ? currentTrack.title.substring(0, 2) : '♪'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{currentTrack.title}</div>
                <div className="text-xs text-slate-500">{currentTrack.artist}</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-2">
                <Heart className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="text-sm text-slate-500">No track selected</div>
          )}
        </div>
        
        {/* Playback controls */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" disabled={!currentTrack}>
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={!currentTrack}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              className={`h-10 w-10 rounded-full ${currentTrack ? 'bg-primary hover:bg-primary/90' : 'bg-slate-300'}`}
              disabled={!currentTrack}
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <PauseCircle className="h-6 w-6 text-white" />
              ) : (
                <PlayCircle className="h-6 w-6 text-white" />
              )}
            </Button>
            <Button variant="ghost" size="icon" disabled={!currentTrack}>
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled={!currentTrack}>
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          
          {currentTrack && (
            <div className="w-full max-w-md flex items-center space-x-2 mt-1">
              <span className="text-xs text-slate-500">
                {formatDuration((currentTrack.duration * playbackProgress) / 100)}
              </span>
              <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${playbackProgress}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500">{formatDuration(currentTrack.duration)}</span>
            </div>
          )}
        </div>
        
        {/* Volume controls */}
        <div className="w-64 flex items-center justify-end space-x-3">
          <Button variant="ghost" size="icon">
            <ListMusic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Radio className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-slate-500" />
            <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-500 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
