import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DUMMY_USERS } from './users.data';

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

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

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
    await this.cache.del(this.CACHE_KEY_ALL_USERS);

    return newUser;
  }

  async findAll(): Promise<User[]> {
    const cached = await this.cache.get<User[]>(this.CACHE_KEY_ALL_USERS);

    if (cached) {
      console.log('CACHE HIT');
      return cached;
    }

    console.log('CACHE MISS → Fetching DB');
    const users = this.users;

    await this.cache.set(this.CACHE_KEY_ALL_USERS, users, 300000); // TTL = 5 minutes

    return users;
  }

  async findOne(id: number): Promise<User> {
    const cacheKey = this.CACHE_KEY_USER(id);
    const cached = await this.cache.get<User>(cacheKey);

    if (cached) {
      console.log('CACHE HIT');
      return cached;
    }

    console.log('CACHE MISS → Fetching DB');
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.cache.set(cacheKey, user, 300000); // TTL = 5 minutes

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser: User = {
      ...this.users[userIndex],
      ...updateUserDto,
      id,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;

    await this.cache.del(this.CACHE_KEY_USER(id));
    await this.cache.del(this.CACHE_KEY_ALL_USERS);

    return updatedUser;
  }

  async remove(id: number): Promise<{ message: string; deletedUser: User }> {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);

    await this.cache.del(this.CACHE_KEY_USER(id));
    await this.cache.del(this.CACHE_KEY_ALL_USERS);

    return {
      message: `User with ID ${id} has been deleted`,
      deletedUser,
    };
  }
}
