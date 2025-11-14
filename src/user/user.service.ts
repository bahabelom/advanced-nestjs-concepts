import { Injectable, NotFoundException } from '@nestjs/common';
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

  /**
   * CREATE - Add a new user
   */
  create(createUserDto: CreateUserDto): User {
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
    return newUser;
  }

  /**
   * READ - Get all users
   */
  findAll(): User[] {
    return this.users;
  }

  /**
   * READ - Get a single user by ID
   */
  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * UPDATE - Update a user by ID
   */
  update(id: number, updateUserDto: UpdateUserDto): User {
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
    return updatedUser;
  }

  /**
   * DELETE - Remove a user by ID
   */
  remove(id: number): { message: string; deletedUser: User } {
    const userIndex = this.users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    
    return {
      message: `User with ID ${id} has been deleted`,
      deletedUser,
    };
  }
}
