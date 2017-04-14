import settings from 'settings';
import CMSPageController from '~/controllers/cms';
import $ from '~/helpers/$';
import shell from '~/components/shell/shell';
import {description as template} from './higher-ed.html';
import ProductsBoxes from '~/components/products-boxes/products-boxes';
import Quotes from '~/components/quotes/quotes';
import Buckets from '~/components/buckets/buckets';
import userModel from '~/models/usermodel';

const loginLink = userModel.loginLink(settings.apiOrigin);

export default class HigherEd extends CMSPageController {

    static description = 'Our open, peer-reviewed college textbooks are free ' +
        'online and come with resources from us and our partners. See how you can ' +
        'adopt our books for your course.';

    init() {
        this.slug = 'pages/higher-education';
        this.template = template;
        this.css = '/app/pages/higher-ed/higher-ed.css';
        this.view = {
            classes: ['higher-ed-page', 'page']
        };
        this.regions = {
            quotes: '.quote-buckets > .boxed',
            products: '.products',
            buckets: '.buckets'
        };
        this.model = {
            'intro_heading': '',
            'get_started_heading': '',
            'get_started_step_1_heading': '',
            'get_started_step_1_description': '',
            'get_started_step_1_cta': '',
            'get_started_step_2_heading': '',
            'get_started_step_2_description': '',
            'get_started_step_3_heading': '',
            'get_started_step_3_description': '',
            'get_started_step_3_cta': '',
            'adopt_heading': '',
            'adopt_description': '',
            'adopt_cta': '',
            loginLink,
            loaded: ''
        };
        shell.showLoader();
    }

    onLoaded() {
        document.title = 'Higher-ed - OpenStax';
        userModel.load().then((user) => {
            this.model.loggedIn = user && user.username;
            this.update();
        });
    }

    onDataLoaded() {
        this.model = Object.assign(this.model, this.pageData);
        this.model.row_3[0].bucketClass = 'our-impact';
        this.model.row_3[1].bucketClass = 'partners';
        this.model.row_3[0].btnClass = 'btn-cyan';
        this.model.row_3[1].btnClass = 'btn-gold';

        this.model.loaded = 'loaded';
        this.update();
        $.insertHtml(this.el, this.model);

        this.regions.quotes.attach(new Quotes(this.model.row_1));
        this.regions.products.attach(new ProductsBoxes(this.model.row_2));
        this.regions.buckets.attach(new Buckets(this.model.row_3));

        shell.hideLoader();
    }

}
