import express from 'express';
import { body } from 'express-validator';

import jwtMiddleware from '../auth/middleware/jwt.middleware';
import { CommonRoutesConfig } from '../common/common.routes.config';
import bodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import permissionsMiddleware from '../common/middleware/common.permission.middleware';
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';

import UsersController from './controllers/users.controller';
import UsersMiddleware from './middlewares/users.middleware';

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'UsersRoutes');
  }

  configureRoutes() {
    this.app
      .route('/users')
      .get(
        jwtMiddleware.validJWTNeeded,
        permissionsMiddleware.permissionFlagRequired(
          PermissionFlag.ADMIN_PERMISSION
        ),
        UsersController.listUsers
      )
      .post([
        body('email').isEmail(),
        body('password')
          .isLength({ min: 8 })
          .withMessage(`Must include password (8+ characters)`),
        bodyValidationMiddleware.verifyBodyFieldsErrors,
        UsersMiddleware.validateSameEmailDoesntExist,
        UsersController.createUser,
      ]);

    this.app.param('userId', UsersMiddleware.extractUserId);
    this.app
      .route(`/users/:userId`)
      .all(
        UsersMiddleware.validateUserExists,
        jwtMiddleware.validJWTNeeded,
        permissionsMiddleware.onlySameUserOrAdminCanDoThisAction
      )
      .get(UsersController.getUserById)
      .delete(UsersController.removeUser);

    this.app.put('/users/:userId', [
      body('email').isEmail(),
      body('password')
        .isLength({ min: 8 })
        .withMessage(`Must include password (8+ characters)`),
      body('firstName').isString(),
      body('lastName').isString(),
      body('permissionFlags').isInt(),
      bodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validateSameEmailBelongToSameUser,
      UsersMiddleware.userCantChangePermission,
      permissionsMiddleware.permissionFlagRequired(
        PermissionFlag.PAID_PERMISSION
      ),
      UsersController.put,
    ]);

    this.app.patch('/users/:userId', [
      body('email').isEmail().optional(),
      body('password')
        .isLength({ min: 8 })
        .withMessage(`Must include password (8+ characters)`)
        .optional(),
      body('firstName').isString().optional(),
      body('lastName').isString().optional(),
      body('permissionFlags').isInt().optional(),
      bodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validatePatchEmail,
      UsersMiddleware.userCantChangePermission,
      permissionsMiddleware.permissionFlagRequired(
        PermissionFlag.PAID_PERMISSION
      ),
      UsersController.patch,
    ]);

    this.app.put(`/users/:userId/permissionFlags/:permissionFlags`, [
      jwtMiddleware.validJWTNeeded,
      permissionsMiddleware.onlySameUserOrAdminCanDoThisAction,

      // Note: The above two pieces of middleware are needed despite
      // the reference to them in the .all() call, because that only covers
      // /users/:userId, not anything beneath it in the hierarchy

      permissionsMiddleware.permissionFlagRequired(
        PermissionFlag.FREE_PERMISSION
      ),
      UsersController.updatePermissionFlags,
    ]);

    return this.app;
  }
}
