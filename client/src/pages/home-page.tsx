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
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-gray-800 ${isActive ? 'bg-gray-700' : ''}`}
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
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-gray-800 ${isActive ? 'bg-gray-700' : ''}`}
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
    <div className="flex flex-col h-screen bg-[#121212]">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-[#000000] border-b border-gray-700">
        <div className="flex-1 flex justify-center items-center space-x-12">
          {/* Spotify */}
          <div className="p-2">
            <svg className="h-8 w-8 text-green-500 hover:text-green-400 transition-colors" viewBox="0 0 496 512" fill="currentColor">
              <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
            </svg>
          </div>

          {/* Apple Music */}
          <div className="p-2">
            <svg className="h-8 w-8 text-white hover:text-gray-300 transition-colors" viewBox="0 0 384 512" fill="currentColor">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
          </div>

          {/* Amazon Music */}
          <div className="p-2">
            <svg className="h-8 w-8 text-blue-500 hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.052-.872-1.238-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.75 4.11-.881 5.942-1.087v-.41c0-.75.06-1.64-.384-2.292-.385-.577-1.127-.819-1.775-.819-1.205 0-2.277.619-2.54 1.903-.054.285-.261.567-.547.582l-3.065-.331c-.258-.056-.545-.259-.47-.644.701-3.694 4.04-4.807 7.03-4.807 1.527 0 3.525.406 4.73 1.568 1.527 1.426 1.381 3.327 1.381 5.397v4.88c0 1.471.613 2.116 1.188 2.911.202.276.247.607-.011.815-.637.529-1.773 1.506-2.396 2.059l-.009-.003zm4.856-15.227c-3.033-2.237-7.44-3.405-11.2-3.405-5.311 0-10.088 1.966-13.697 5.24-.283.258-.03.612.31.412 3.93-2.287 8.808-3.662 13.832-3.662 3.391 0 7.12.704 10.551 2.159.517.216.953-.339.204-.744z"/>
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
        <div className="w-64 bg-[#121212] border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="p-4 flex flex-col space-y-6">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800">
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
        <div className="flex-1 flex flex-col overflow-hidden bg-[#121212]">
          <div className="p-6 bg-gradient-to-b from-[#535353] to-[#121212]">
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
                  <div key={i} className="h-14 mx-2 my-1 rounded-md bg-gray-800 animate-pulse" />
                ))
              ) : playlistTracks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  This playlist is empty
                </div>
              ) : (
                playlistTracks.map((track, index) => (
                  <div 
                    key={track.id}
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-800 ${currentTrack?.id === track.id ? 'bg-gray-700' : ''}`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <div className="w-8 text-gray-400">{index + 1}</div>
                    <div className="flex-1 flex items-center space-x-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={track.coverImage || ''} alt={track.title} />
                        <AvatarFallback className="rounded-md bg-gray-800">
                          {track.title ? track.title.substring(0, 2) : '♪'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-200 truncate">{track.title}</div>
                        <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                      </div>
                      <div className="w-32 text-sm text-gray-400 truncate">{track.album}</div>
                      <div className="w-20 text-right text-sm text-gray-400">
                        {formatDuration(track.duration)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Column 3: Recommendations */}
        <div className="w-72 border-l border-gray-800 flex flex-col overflow-hidden bg-[#121212]">
          <div className="p-4 bg-[#181818]">
            <h2 className="text-lg font-semibold mb-1 text-white">Recommended For You</h2>
            <p className="text-xs text-gray-400">Based on what's in your playlists</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {isLoadingRecommendations ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-14 rounded-md bg-gray-800 animate-pulse" />
                ))
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No recommendations available
                </div>
              ) : (
                recommendations.filter(track => 
                  !currentPlaylist?.tracks?.some(pt => pt.id === track.id)
                ).map(track => (
                  <div 
                    key={track.id}
                    className={`flex items-center p-2 rounded-md hover:bg-gray-800 cursor-pointer ${
                      currentTrack?.id === track.id ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-200 font-medium truncate">{track.title}</div>
                      <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                    </div>
                    <div className="text-gray-400 text-sm ml-2">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
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
      <div className="h-20 border-t border-gray-800 bg-[#181818] flex items-center px-4">
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