import type { Collection, Db } from 'mongodb';
import type { User, UserCredentials } from '../../domain/entities/User.js';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository.js';

interface UserDocument {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  passwordHash: string;
}

const COLLECTION = 'users';

export class MongoAuthRepository implements IAuthRepository {
  private readonly collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection<UserDocument>(COLLECTION);
  }

  async ensureIndexes(): Promise<void> {
    await this.collection.createIndex({ email: 1 }, { unique: true });
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ email: email.toLowerCase() });
    return doc ? this.toPublicUser(doc) : null;
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const doc = await this.collection.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      role: doc.role,
      passwordHash: doc.passwordHash,
    };
  }

  async countUsers(): Promise<number> {
    return this.collection.countDocuments();
  }

  async createUser(user: UserCredentials): Promise<void> {
    await this.collection.insertOne({
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name,
      role: user.role,
      passwordHash: user.passwordHash,
    });
  }

  private toPublicUser(doc: UserDocument): User {
    return {
      id: doc.id,
      email: doc.email,
      name: doc.name,
      role: doc.role,
    };
  }
}
