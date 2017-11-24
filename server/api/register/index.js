'use strict';

import {Router} from 'express';
import * as controller from './register.controller';
import * as auth from '../../services/auth/auth.service';

let router = new Router();

router.post('/:applicationID', auth.hasKey(), controller.registerByApplication);
router.post('/', controller.register);

module.exports = router;


