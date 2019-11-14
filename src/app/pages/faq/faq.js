import componentType, {canonicalLinkMixin, insertHtmlMixin} from '~/helpers/controller/init-mixin';
import {makeDocModel} from '~/models/usermodel';
import {on} from '~/helpers/controller/decorators';
import $ from '~/helpers/$';
import {description as template} from './faq.html';
import css from './faq.css';

const spec = {
    template,
    css,
    view: {
        classes: ['faq-page', 'page'],
        tag: 'main'
    },
    model: {},
    slug: 'pages/faq'
};
const BaseClass = componentType(spec, canonicalLinkMixin, insertHtmlMixin);

export default class FAQ extends BaseClass {

    init() {
        super.init();
    }

    onDataLoaded() {
        const d = this.pageData;
        const slug = window.location.hash.substr(1);
        const item = d.questions.find((q) => q.slug === slug);

        if (item) {
            item.isOpen = true;
        }

        this.model = {
            heading: d.intro_heading,
            subhead: d.intro_description,
            questions: d.questions
        };
        this.update();


        if (item) {
            const targetEl = document.getElementById(slug);

            $.scrollTo(targetEl);
        }

        // Load documents
        for (const q of this.model.questions) {
            if (q.document) {
                makeDocModel(q.document).load().then((data) => {
                    q.documentUrl = data.file;
                    q.documentTitle = data.title;
                    this.update();
                });
            }
        }
    }

    @on('click .question')
    toggleQuestion(event) {
        const index = +event.delegateTarget.dataset.item;
        const q = this.model.questions[index];

        q.isOpen = !q.isOpen;
        this.update();
    }

}
