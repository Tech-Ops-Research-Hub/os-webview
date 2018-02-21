import {Controller} from 'superb.js';
import {description as template} from './order-print-copy.html';

export default class OrderPrintCopy extends Controller {

    init(model) {
        this.template = template;
        this.model = model;
        this.view = {
            tag: 'nav',
            classes: ['order-print-copy']
        };
        this.css = '/app/components/get-this-title/order-print-copy/order-print-copy.css';
    }

}
