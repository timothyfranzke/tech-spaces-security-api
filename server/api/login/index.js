'use strict';

import {Router} from 'express';
import * as controller from './login.controller';
import * as auth from '../../services/auth/auth.service';

let router = new Router();

router.post('/', controller.login);


module.exports = router;


