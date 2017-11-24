'use strict';

import {Router} from 'express';
import * as controller from './password.controller';
import * as auth from '../../services/auth/auth.service';

let router = new Router();

router.post('/reset', controller.resetPassword);


module.exports = router;


