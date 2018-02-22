import {Controller} from 'superb.js';
import Quote from './quote/quote';

export default class Quotes extends Controller {

    init(quotes) {
        this.template = () => '';
        this.css = '/app/components/quotes/quotes.css?v2.6.0';
        this.view = {
            classes: ['quotes', `boxes-${quotes.length}`]
        };
        this.regions = {
            quotes: '.quotes'
        };
        this.quoteViews = quotes.map((quote) => new Quote(quote));
    }

    onLoaded() {
        for (const view of this.quoteViews) {
            this.regions.self.append(view);
        }
    }

}
