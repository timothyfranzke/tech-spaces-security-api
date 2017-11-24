'use strict';

import {Router} from 'express';
import * as controller from './token.controller';
import * as auth from '../../services/auth/auth.service';

let router = new Router();

router.post('/:id', controller.getToken);

module.exports = router;


