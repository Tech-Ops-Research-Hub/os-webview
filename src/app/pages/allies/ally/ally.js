import BaseView from '~/helpers/backbone/view';
import $ from '~/helpers/$';
import {on, props} from '~/helpers/backbone/decorators';
import {template} from './ally.hbs';

@props({template})
export default class Ally extends BaseView {
    @on('click .to-top')
    returnToTop(e) {
        let filterSection = document.querySelector('.filter');

        $.scrollTo(filterSection);
        e.preventDefault();
    }

    constructor(templateHelpers, stateModel) {
        super();
        this.templateHelpers = templateHelpers;
        let matchesFilter = (subject) => (subject === 'View All' ||
            (subject === 'AP®' && templateHelpers.isAp) ||
            templateHelpers.subjects.indexOf(subject) >= 0);

        stateModel.on('change:selectedFilter', (what) => {
            let subject = what.changed.selectedFilter,
                visible = matchesFilter(subject);

            this.el.classList.toggle('hidden', !visible);
        });
    }

    onRender() {
        this.el.classList.add('text');
    }
}
