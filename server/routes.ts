import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Get all music platforms
  app.get("/api/platforms", async (_req, res) => {
    try {
      const platforms = await storage.getPlatforms();
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      res.status(500).json({ message: "Error fetching platforms" });
    }
  });

  // Get specific platform by ID
  app.get("/api/platforms/:id", async (req, res) => {
    try {
      const platformId = parseInt(req.params.id);
      const platform = await storage.getPlatformById(platformId);
      
      if (!platform) {
        return res.status(404).json({ message: "Platform not found" });
      }
      
      res.json(platform);
    } catch (error) {
      console.error("Error fetching platform:", error);
      res.status(500).json({ message: "Error fetching platform" });
    }
  });

  // Get all playlists (optionally filtered by platform)
  app.get("/api/playlists", async (req, res) => {
    try {
      const platformId = req.query.platformId ? parseInt(req.query.platformId as string) : undefined;
      
      if (platformId) {
        const playlists = await storage.getPlaylistsByPlatformId(platformId);
        return res.json(playlists);
      }
      
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Error fetching playlists" });
    }
  });

  // Get specific playlist by ID
  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      const playlist = await storage.getPlaylistById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ message: "Error fetching playlist" });
    }
  });

  // Get tracks for a specific playlist
  app.get("/api/playlists/:id/tracks", async (req, res) => {
    try {
      const playlistId = parseInt(req.params.id);
      const playlist = await storage.getPlaylistById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      const tracks = await storage.getTracksByPlaylistId(playlistId);
      res.json(tracks);
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
      res.status(500).json({ message: "Error fetching playlist tracks" });
    }
  });

  // Get track by ID
  app.get("/api/tracks/:id", async (req, res) => {
    try {
      const trackId = parseInt(req.params.id);
      const track = await storage.getTrackById(trackId);
      
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      res.json(track);
    } catch (error) {
      console.error("Error fetching track:", error);
      res.status(500).json({ message: "Error fetching track" });
    }
  });

  // Get recommendations for the current user
  app.get("/api/recommendations", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const recommendations = await storage.getRecommendationsForUser(req.user.id);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Error fetching recommendations" });
    }
  });

  // User specific playlists
  app.get("/api/user/playlists", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const playlists = await storage.getPlaylistsByUserId(req.user.id);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      res.status(500).json({ message: "Error fetching user playlists" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
