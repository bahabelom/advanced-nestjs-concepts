import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DUMMY_USERS } from './users.data';
import { listRedisKeys } from '../app.module';

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  // Dummy users data - in a real app, this would be in a database
  private users: User[] = [...DUMMY_USERS];

  private nextId = 9; // For generating new IDs

  // Cache keys
  private readonly CACHE_KEY_ALL_USERS = 'users:all';
  private readonly CACHE_KEY_USER = (id: number) => `user:${id}`;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * CREATE - Add a new user (invalidates Redis cache)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser: User = {
      id: this.nextId++,
      name: createUserDto.name,
      email: createUserDto.email,
      age: createUserDto.age,
      role: createUserDto.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    // Invalidate Redis cache since we added a new user
    await this.cacheManager.del(this.CACHE_KEY_ALL_USERS);
    console.log('Redis cache invalidated: users list updated');

    return newUser;
  }

  /**
   * READ - Get all users (with Redis caching)
   */
  async findAll(): Promise<User[]> {
    // Check Redis cache first
    const cached = await this.cacheManager.get<User[]>(this.CACHE_KEY_ALL_USERS);
    
    if (cached) {
      console.log('Redis Cache HIT: Returning cached users list');
      return cached;
    }

    // Cache miss - fetch from "database"
    console.log('Redis Cache MISS: Fetching users from database');
    const users = this.users;

    // Store in Redis cache for 5 minutes (300000 ms - cache-manager v7 uses milliseconds)
    await this.cacheManager.set(this.CACHE_KEY_ALL_USERS, users, 300000);
    console.log(`Redis key stored: ${this.CACHE_KEY_ALL_USERS}`);
    
    // Debug: Try to verify the key exists in Redis and check what keys are actually in Redis
    try {
      const verifyKey = await this.cacheManager.get(this.CACHE_KEY_ALL_USERS);
      console.log(`Verification: Key ${this.CACHE_KEY_ALL_USERS} exists: ${verifyKey ? 'YES' : 'NO'}`);
      
      // List all keys in Redis using the store instance
      const allKeys = await listRedisKeys();
      console.log(`All Redis keys:`, allKeys);
      console.log(`Total keys in Redis: ${allKeys.length}`);
      
      // Filter keys that match our patterns
      const userKeys = allKeys.filter((key: string) => key.includes('user'));
      console.log(`Keys containing 'user':`, userKeys);
    } catch (error) {
      console.error('Error verifying key or listing keys:', error);
    }
    
    return users;
  }

  /**
   * READ - Get a single user by ID (with Redis caching)
   */
  async findOne(id: number): Promise<User> {
    const cacheKey = this.CACHE_KEY_USER(id);
    
    // Check Redis cache first
    const cached = await this.cacheManager.get<User>(cacheKey);
    
    if (cached) {
      console.log(`Redis Cache HIT: Returning cached user ${id}`);
      return cached;
    }

    // Cache miss - fetch from "database"
    console.log(`Redis Cache MISS: Fetching user ${id} from database`);
    const user = this.users.find((u) => u.id === id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Store in Redis cache for 5 minutes (300000 ms - cache-manager v7 uses milliseconds)
    await this.cacheManager.set(cacheKey, user, 300000);
    console.log(`Redis key stored: ${cacheKey}`);
    
    return user;
  }

  /**
   * UPDATE - Update a user by ID (invalidates Redis cache)
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update only provided fields
    const updatedUser: User = {
      ...this.users[userIndex],
      ...updateUserDto,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;

    // Invalidate Redis cache for this specific user and the users list
    await this.cacheManager.del(this.CACHE_KEY_USER(id));
    await this.cacheManager.del(this.CACHE_KEY_ALL_USERS);
    console.log(`Redis cache invalidated: user ${id} and users list updated`);

    return updatedUser;
  }

  /**
   * DELETE - Remove a user by ID (invalidates Redis cache)
   */
  async remove(id: number): Promise<{ message: string; deletedUser: User }> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);

    // Invalidate Redis cache for this specific user and the users list
    await this.cacheManager.del(this.CACHE_KEY_USER(id));
    await this.cacheManager.del(this.CACHE_KEY_ALL_USERS);
    console.log(`Redis cache invalidated: user ${id} deleted and users list updated`);
    
    return {
      message: `User with ID ${id} has been deleted`,
      deletedUser,
    };
  }
}
