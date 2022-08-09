import shortid from 'shortid';
import debug from 'debug';
import { CreateUserDto, PatchUserDto, PutUserDto } from '../dto';
import mongooseService from '../../common/services/mongoose.service';

const log = debug('app:in-memory-dao');

class UsersDao {
  Schema = mongooseService.getMongoose().Schema;
  userSchema = new this.Schema({
    email: String,
    password: { type: String, select: false },
    firstName: String,
    lastName: String,
    permissionFlags: Number,
  });
  User = mongooseService.getMongoose().model('Users', this.userSchema);

  constructor() {
    log('Created new instance of UsersDao');
  }

  async addUser(userFields: CreateUserDto) {
    const user = new this.User({
      ...userFields,
      permissionFlags: 1,
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
      { _id: userId },
      { ...userFields },
      { new: true }
    ).exec();

    return existingUser;
  }

  async removeUserById(userId: string) {
    return this.User.deleteOne({ _id: userId }).exec();
  }
}

export default new UsersDao();
