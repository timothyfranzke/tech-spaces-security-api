'use strict';

import {Router} from 'express';
import * as controller from './application.controller';
import * as auth from '../../services/auth/auth.service';

let router = new Router();

router.get('/:applicationId/redirect', controller.redirect);


module.exports = router;


