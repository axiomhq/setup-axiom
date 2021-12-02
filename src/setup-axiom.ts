import * as main from './main';
import * as post from './post';
import * as stateHelper from './state-helper';

if (!stateHelper.IsPost) {
  main.run();
} else {
  post.run();
}
