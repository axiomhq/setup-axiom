import * as main from './main';
import * as post from './post';
import * as stateHelper from './state-helper';

const TmpDir = '/tmp/setup-axiom';

if (!stateHelper.IsPost) {
  main.run(TmpDir);
} else {
  post.run(TmpDir);
}
