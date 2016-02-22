import Backbone from 'backbone';
import shell from '~/components/shell/shell';

class Router extends Backbone.Router {

    initialize() {
        this.route('*actions', 'default', () => {
            shell.load('404');
        });

        this.route('', 'home', () => {
            shell.load('home');
        });

        ['about', 'books', 'contact', 'news', 'license', 'subjects', 'details',
        'interest', 'adoption', 'adoption-confirmation', 'comp-copy', 'accessibility-statement']
        .forEach(this.standardRoute, this);

        this.route(/to[u|s]/, 'tos', () => {
            shell.load('tos');
        });
    }

    standardRoute(name) {
        this.route(name, name, () => {
            shell.load(name);
        });
    }

}

let router = new Router();

export default router;
