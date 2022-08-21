import debug from 'debug';
import shortid from 'shortid';

import { PermissionFlag } from '../../common/middleware/common.permissionflag.enum';
import mongooseService from '../../common/services/mongoose.service';
import { CreateUserDto, PatchUserDto, PutUserDto } from '../dto';

const log = debug('app:in-memory-dao');

class UsersDao {
  Schema = mongooseService.getMongoose().Schema;
  userSchema = new this.Schema(
    {
      _id: String,
      email: String,
      password: { type: String, select: false },
      firstName: String,
      lastName: String,
      permissionFlags: Number,
    },
    { id: false }
  );
  User = mongooseService.getMongoose().model('Users', this.userSchema);

  constructor() {
    log('Created new instance of UsersDao');
  }

  async addUser(userFields: CreateUserDto) {
    const userId = shortid.generate();
    const user = new this.User({
      _id: userId,
      ...userFields,
      permissionFlags: PermissionFlag.FREE_PERMISSION,
    });
    await user.save();

    return user._id;
  }

  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async getUserById(userId: string) {
    return this.User.findOne({ _id: userId }).exec();
  }

  async getUserByEmail(email: string) {
    return this.User.findOne({ email: email }).exec();
  }

  async updateUserById(userId: string, userFields: PutUserDto | PatchUserDto) {
    const existingUser = await this.User.findOneAndUpdate(
      { _id: userId }, // filter
      { ...userFields }, // update document
      { new: true } // options
    ).exec();

    return existingUser;
  }

  async removeUserById(userId: string) {
    return this.User.deleteOne({ _id: userId }).exec();
  }

  async getUserByEmailWithPassword(email: string) {
    return this.User.findOne({ email: email })
      .select('_id email permissionFlags +password')
      .exec();
  }
}

export default new UsersDao();
