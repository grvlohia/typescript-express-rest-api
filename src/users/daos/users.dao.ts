import { CreateUserDto, PatchUserDto, PutUserDto } from '../dto';
import shortid from 'shortid';
import debug from 'debug';

const log = debug('app:in-memory-dao');

class UsersDao {
  users: Array<CreateUserDto> = [];

  constructor() {
    log('Created new instance of UsersDao');
  }

  async addUser(user: CreateUserDto) {
    user.id = shortid.generate();
    this.users.push(user);
    return user.id;
  }

  async getUsers() {
    return this.users;
  }

  async getUserById(userId: string) {
    return this.users.find((user: { id: string }) => user.id === userId);
  }

  async putUserById(userId: string, user: PutUserDto) {
    const objIndex = this.users.findIndex((user) => user.id === userId);
    this.users.splice(objIndex, 1, user);
    return `${user.id} updated via put`;
  }

  async patchUserById(userId: string, user: PatchUserDto) {
    const objIndex = this.users.findIndex((user) => user.id === userId);
    const currentUser = this.users[objIndex];
    const allowedPatchFields = [
      'password',
      'firstName',
      'lastName',
      'permissionLevel',
    ];
    for (const field of allowedPatchFields) {
      if (field in user) {
        // @ts-ignore: have to modify patch fields
        currentUser[field] = user[field];
      }
    }
    this.users.splice(objIndex, 1, currentUser);
    return `${user.id} patched`;
  }

  async removeUserById(userId: string) {
    const objIndex = this.users.findIndex((user) => user.id === userId);

    this.users.splice(objIndex, 1);
    return `${userId} removed`;
  }

  async getUserByEmail(email: string) {
    const objIndex = this.users.findIndex((user) => user.email === email);
    const currentUser = this.users[objIndex];
    if (currentUser) {
      return currentUser;
    } else {
      return null;
    }
  }
}

export default new UsersDao();
