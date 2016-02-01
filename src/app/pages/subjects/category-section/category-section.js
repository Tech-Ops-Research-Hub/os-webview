import BaseView from '~/helpers/backbone/view';
import {props} from '~/helpers/backbone/decorators';
import {template} from './category-section.hbs';
import Book from './book/book';

@props({
    template: template,
    regions: {
        books: '.row-of-covers'
    }
})
export default class CategorySection extends BaseView {

    constructor(data, model) {
        super();

        this.books = data.books;
        this.category = data.category;
        this.model = model;
        this.templateHelpers = {
            categoryName: data.category
        };

        this.model.on('change:selectedFilter', () => this.setState());
    }

    setState() {
        let value = this.model.get('selectedFilter');

        this.el.classList.toggle('hidden', value !== this.category && value !== 'View All');
    }

    onRender() {
        this.el.classList.add('book-category');

        for (let book of this.books) {
            this.regions.books.append(new Book(book, this.model));
        }

        this.setState();
    }

}
