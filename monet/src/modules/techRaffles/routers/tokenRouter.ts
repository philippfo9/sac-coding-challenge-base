import _ from 'lodash';
import { z } from 'zod';
import {createRouter} from "../../../server/createRouter";
import { getBirdEyeUsdcRate } from '../../../utils/sacUtils';
import { userPlatformAdminMiddleware } from '../../common/auth/authService';
import {addProdToken, getTokenMetaFromSolscan, getTokens} from '../services/TokenService';

export const tokenRouter = createRouter()
  .query('getAll', {
    resolve: getTokens
  })