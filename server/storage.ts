import { 
  users, platforms, playlists, tracks, playlistTracks, recommendations,
  type User, type InsertUser, type Platform, type InsertPlatform,
  type Playlist, type InsertPlaylist, type Track, type InsertTrack,
  type PlaylistTrack, type InsertPlaylistTrack, type Recommendation, 
  type InsertRecommendation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, sql, asc, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import * as dotenv from "dotenv";

dotenv.config();

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Music platform methods
  getPlatforms(): Promise<Platform[]>;
  getPlatformById(id: number): Promise<Platform | undefined>;
  
  // Playlist methods
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistById(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  getPlaylistsByPlatformId(platformId: number): Promise<Playlist[]>;
  
  // Track methods
  getTracks(): Promise<Track[]>;
  getTrackById(id: number): Promise<Track | undefined>;
  getTracksByPlaylistId(playlistId: number): Promise<Track[]>;
  
  // Recommendations
  getRecommendationsForUser(userId: number): Promise<Track[]>;
  
  sessionStore: session.Store;
}

// PostgreSQL Storage implementation
export class PostgresStorage implements IStorage {
  private db;
  sessionStore: session.Store;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const queryClient = postgres(connectionString, { max: 10 });
    this.db = drizzle(queryClient);
    
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString,
        ssl: process.env.NODE_ENV === 'production'
      },
      createTableIfMissing: true,
    });
    
    console.log("PostgreSQL database connection established");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Platform methods
  async getPlatforms(): Promise<Platform[]> {
    return await this.db.select().from(platforms).where(eq(platforms.active, true));
  }
  
  async getPlatformById(id: number): Promise<Platform | undefined> {
    const result = await this.db.select().from(platforms).where(eq(platforms.id, id));
    return result[0];
  }
  
  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    return await this.db.select().from(playlists);
  }
  
  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    const result = await this.db.select().from(playlists).where(eq(playlists.id, id));
    return result[0];
  }
  
  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return await this.db.select().from(playlists).where(eq(playlists.userId, userId));
  }
  
  async getPlaylistsByPlatformId(platformId: number): Promise<Playlist[]> {
    return await this.db.select().from(playlists).where(eq(playlists.platformId, platformId));
  }
  
  // Track methods
  async getTracks(): Promise<Track[]> {
    return await this.db.select().from(tracks);
  }
  
  async getTrackById(id: number): Promise<Track | undefined> {
    const result = await this.db.select().from(tracks).where(eq(tracks.id, id));
    return result[0];
  }
  
  async getTracksByPlaylistId(playlistId: number): Promise<Track[]> {
    // Dummy tracks based on playlist ID
    const dummyTracks: Track[] = [
      { id: playlistId * 100 + 1, title: "Blue Bird", artist: "IKIMONO-GAKARI", album: "Bleach OST", duration: 240, coverImage: "https://i.imgur.com/1.jpg" },
      { id: playlistId * 100 + 2, title: "Dynamite", artist: "BTS", album: "BE", duration: 199, coverImage: "https://i.imgur.com/2.jpg" },
      { id: playlistId * 100 + 3, title: "Butter", artist: "BTS", album: "Butter", duration: 164, coverImage: "https://i.imgur.com/3.jpg" },
      { id: playlistId * 100 + 4, title: "How You Like That", artist: "BLACKPINK", album: "THE ALBUM", duration: 182, coverImage: "https://i.imgur.com/4.jpg" },
      { id: playlistId * 100 + 5, title: "Spring Day", artist: "BTS", album: "You Never Walk Alone", duration: 285, coverImage: "https://i.imgur.com/5.jpg" }
    ];
    
    // For real implementation:
    // const query = this.db
    //   .select({
    //     track: tracks
    //   })
    //   .from(playlistTracks)
    //   .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
    //   .where(eq(playlistTracks.playlistId, playlistId))
    //   .orderBy(asc(playlistTracks.position));
    
    // const results = await query;
    // return results.map(r => r.track);
    
    return dummyTracks;
  }
  
  // Recommendations
  async getRecommendationsForUser(userId: number): Promise<Track[]> {
    // Get tracks from recommendations table
    const query = this.db
      .select({
        track: tracks
      })
      .from(recommendations)
      .innerJoin(tracks, eq(recommendations.trackId, tracks.id))
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.createdAt))
      .limit(5);
    
    const results = await query;
    
    // If not enough recommendations, fetch some popular tracks
    if (results.length < 5) {
      const additionalTracks = await this.db
        .select()
        .from(tracks)
        .limit(5 - results.length);
      
      return [...results.map(r => r.track), ...additionalTracks];
    }
    
    return results.map(r => r.track);
  }
}

// In-Memory Storage (fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private platforms: Map<number, Platform>;
  private playlists: Map<number, Playlist>;
  private tracks: Map<number, Track>;
  private playlistTracks: Map<number, PlaylistTrack>;
  private recommendations: Map<number, Recommendation>;
  
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.platforms = new Map();
    this.playlists = new Map();
    this.tracks = new Map();
    this.playlistTracks = new Map();
    this.recommendations = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    console.log("Using in-memory storage");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Platform methods
  async getPlatforms(): Promise<Platform[]> {
    return Array.from(this.platforms.values()).filter(platform => platform.active);
  }
  
  async getPlatformById(id: number): Promise<Platform | undefined> {
    return this.platforms.get(id);
  }
  
  // Playlist methods
  async getPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }
  
  async getPlaylistById(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }
  
  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      playlist => playlist.userId === userId
    );
  }
  
  async getPlaylistsByPlatformId(platformId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(
      playlist => playlist.platformId === platformId
    );
  }
  
  // Track methods
  async getTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values());
  }
  
  async getTrackById(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }
  
  async getTracksByPlaylistId(playlistId: number): Promise<Track[]> {
    const playlistTrackEntries = Array.from(this.playlistTracks.values())
      .filter(pt => pt.playlistId === playlistId)
      .sort((a, b) => a.position - b.position);
    
    return playlistTrackEntries
      .map(pt => this.tracks.get(pt.trackId))
      .filter((track): track is Track => track !== undefined);
  }
  
  // Recommendations
  async getRecommendationsForUser(userId: number): Promise<Track[]> {
    const userRecommendations = Array.from(this.recommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      })
      .slice(0, 5);
    
    const tracks = userRecommendations
      .map(rec => this.tracks.get(rec.trackId))
      .filter((track): track is Track => track !== undefined);
    
    // If not enough recommendations, add some popular tracks
    if (tracks.length < 5) {
      const additionalTracks = Array.from(this.tracks.values())
        .slice(0, 5 - tracks.length);
      
      return [...tracks, ...additionalTracks];
    }
    
    return tracks;
  }
}

// Select storage implementation based on environment
let storage: IStorage;

try {
  console.log("Attempting to connect to PostgreSQL database...");
  storage = new PostgresStorage();
} catch (error) {
  console.error("Failed to connect to PostgreSQL database:", error);
  console.log("Falling back to in-memory storage");
  storage = new MemStorage();
}

export { storage };
