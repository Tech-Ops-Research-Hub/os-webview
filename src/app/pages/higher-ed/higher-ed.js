import LoadingView from '~/helpers/backbone/loading-view';
import settings from 'settings';
import $ from '~/helpers/$';
import {on, props} from '~/helpers/backbone/decorators';
import {template} from './higher-ed.hbs';
import PageModel from '~/models/pagemodel';
import ImageModel from '~/models/imagemodel';
import ProductsBoxes from '~/components/products-boxes/products-boxes';
import Quotes from '~/components/quotes/quotes';
import Buckets from '~/components/buckets/buckets';

let detailPromise = new Promise((resolve) => {
    new PageModel().fetch({
        data: {
            type: 'pages.HigherEducation'
        }
    }).then((detailData) => {
        let detailUrl = detailData.pages[0].meta.detail_url;

        new PageModel().fetch({url: detailUrl}).then((data) => {
            resolve(data);
        });
    });
});

let quoteBoxHelper = (qbData) => {
    let orientationFromImageAlignment = {
            L: 'right',
            R: 'left'
        },
        result = {
            quoteHtml: qbData.content,
            orientation: orientationFromImageAlignment[qbData.image_alignment] || 'full'
        };

    if (qbData.link) {
        result.linkUrl = qbData.link;
        result.linkText = qbData.cta;
    }

    if (qbData.image) {
        result.imagePromise = new ImageModel({id: qbData.image.id}).fetch()
        .then((imageData) => {
            result.imageUrl = imageData.file;
        });
    } else {
        result.orientation = 'full';
    }

    return result;
};

let bucketHelper = (cmsData) => {
    let row2keys = Object.keys(cmsData).filter((key) => (/^row_2/).test(key)),
        rowData = [];

    for (let key of row2keys) {
        let [oneBasedIndex, subKey] = key.match(/row_2_box_(\d+)_(\w+)/).slice(1),
            index = oneBasedIndex - 1;

        if (!rowData[index]) {
            rowData[index] = {};
        }
        rowData[index][subKey] = cmsData[key];
    }
    return rowData;
};

@props({
    template: template,
    css: '/app/pages/higher-ed/higher-ed.css',
    templateHelpers: () => {
        let loginLink = `${settings.apiOrigin}/accounts/login/openstax/?next=`;
        let nextLink = `${settings.apiOrigin}/faculty-verification`;

        return {
            loginLink: `${loginLink}${nextLink}`
        };
    },
    regions: {
        quotes: '.quote-buckets',
        products: '.products',
        buckets: '.buckets'
    }
})
export default class HigherEd extends LoadingView {

    @on('click a[href^="#"]')
    hashClick(e) {
        $.hashClick(e, {doHistory: false});
    }

    static metaDescription = () => `Our open, peer-reviewed college textbooks are free
        online and come with resources from us and our allies. See how you can adopt our
        books for your course.`;

    onRender() {
        this.el.querySelector('.page').classList.add('hidden');
        let populateDataIdItems = (data) => {
            for (let el of this.el.querySelectorAll('[data-id]')) {
                let key = el.dataset.id;

                if (key in data) {
                    el.innerHTML = data[key];
                }
            }
        };

        detailPromise.then((data) => {
            populateDataIdItems(data);
            let quoteBoxData = [];

            for (let key of Object.keys(data)) {
                let m = key.match(/^row_0_box_(\d)_(\w+)/);

                if (m) {
                    let idx = m[1] - 1,
                        name = m[2];

                    if (!quoteBoxData[idx]) {
                        quoteBoxData[idx] = {};
                    }
                    quoteBoxData[idx][name] = data[key];
                }
            }

            let quoteBoxSpecs = quoteBoxData.filter((obj) => obj.content).map(quoteBoxHelper);

            let promises = quoteBoxSpecs
            .filter((spec) => spec.imagePromise)
            .map((spec) => spec.imagePromise);

            Promise.all(promises).then(() => {
                this.regions.quotes.show(new Quotes(quoteBoxSpecs));
            });

            this.regions.buckets.show(new Buckets(bucketHelper(data)));
        });
        this.otherPromises.push(detailPromise);
        this.regions.products.show(new ProductsBoxes({
            products: [
                'books',
                'Concept Coach',
                'OpenStax CNX'
            ]
        }));

        super.onRender();
    }

    onLoaded() {
        super.onLoaded();
        this.el.querySelector('.page').classList.remove('hidden');
    }
}
