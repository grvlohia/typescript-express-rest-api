import crypto from 'crypto';
import debug from 'debug';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const log: debug.IDebugger = debug('app:auth-controller');

const jwtSecret: string = process.env.JWT_SECRET!;
const tokenExpirationInSeconds = 36000;

//We leave it as an exercise for the reader to ensure that the back end invalidates previous tokens and limits how often new ones can be requested.
class AuthController {
  async createJWT(req: Request, res: Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto
        .createHmac('sha512', salt)
        .update(refreshId)
        .digest('base64');
      req.body.refreshKey = salt.export();
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });

      return res.status(201).send({ accessToken: token, refreshToken: hash });
    } catch (err) {
      log('createJWT error: %O', err);

      return res.status(500).send();
    }
  }
}

export default new AuthController();
