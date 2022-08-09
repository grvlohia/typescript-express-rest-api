import mongoose, { ConnectOptions } from 'mongoose';
import debug from 'debug';

const log = debug('app:mongoose-service');

class MongooseService {
  private count = 0;
  private mongooseConnectOptions: ConnectOptions = {
    // useNewUrlParser: true,
    serverSelectionTimeoutMS: 15000,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
  };

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry = () => {
    log('Attempting MongoDB connection (will retry if needed)');
    log(`Connection String: ${process.env.MONGO_CONNECTION_URI}`);
    mongoose
      .connect(
        process.env.MONGO_CONNECTION_URI || '',
        this.mongooseConnectOptions
      )
      .then(() => {
        log('MongoDB is connected');
      })
      .catch((err) => {
        const retrySeconds = 5;
        log(
          `MongoDB connection unsuccessful (will retry #${++this
            .count} after ${retrySeconds} seconds)`,
          err
        );
        setTimeout(this.connectWithRetry, retrySeconds * 1000);
      });
  };
}

export default new MongooseService();
