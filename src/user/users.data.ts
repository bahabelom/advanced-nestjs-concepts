import { User } from './user.service';

/**
 * Dummy users data for practice
 * In a real application, this would come from a database
 */
export const DUMMY_USERS: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 28,
    role: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    age: 32,
    role: 'user',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    age: 45,
    role: 'user',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    age: 29,
    role: 'moderator',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    age: 35,
    role: 'user',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: 6,
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    age: 27,
    role: 'admin',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 7,
    name: 'Edward Norton',
    email: 'edward.norton@example.com',
    age: 38,
    role: 'user',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 8,
    name: 'Fiona Apple',
    email: 'fiona.apple@example.com',
    age: 31,
    role: 'user',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
];

