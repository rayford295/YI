// Stone and pen colours map to the two of us the same way in every game.
import { pick } from './i18n';
import { config } from './config';

export type Colour = 'purple' | 'green';   // purple = Jingyi, green = Yifan
export const nameOf = (c: Colour): string => pick(c === 'purple' ? config.her.name : config.him.name);
