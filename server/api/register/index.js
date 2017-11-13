'use strict';

import {Router} from 'express';
import * as controller from './register.controller';
import * as auth from '../../services/auth/auth.service';

let router = new Router();

router.post('/register-email', auth.hasRole('admin'), controller.registerEmail);
router.post('/register', controller.register);

module.exports = router;


