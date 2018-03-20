import VERSION from '~/version';
import {Controller} from 'superb.js';
import $ from '~/helpers/$';
import ResourceBox from '../resource-box/resource-box';
import RequestCompCopy from '../request-comp-copy/request-comp-copy';
import {description as template} from './instructor-resource-tab.html';

export default class InstructorResourceTab extends Controller {

    init(model) {
        this.template = template;
        this.model = model;
        this.css = `/app/pages/details-new/instructor-resource-tab/instructor-resource-tab.css?${VERSION}`;
        this.view = {
            classes: ['instructor-resources']
        };
    }

    onLoaded() {
        $.insertHtml(this.el, this.model);

        const Region = this.regions.self.constructor;
        const resourceBoxes = this.el.querySelectorAll('resource-box');

        this.model.userStatusPromise.then((userStatus) => {
            for (const index of this.model.resources.keys()) {
                const region = new Region(resourceBoxes[index]);
                const resourceData = this.model.resources[index];
                const resourceBox = new ResourceBox(
                    Object.assign({
                        heading: resourceData.resource_heading,
                        description: resourceData.resource_description
                    }, ResourceBox.instructorResourceBoxPermissions(resourceData, userStatus))
                );

                region.attach(resourceBox);
            }
        });

        const region = new Region(this.el.querySelector('request-comp-copy'));
        const component = new RequestCompCopy(() => ({
            title: this.model.bookInfo.title,
            coverUrl: this.model.bookInfo.cover_url
        }));

        region.attach(component);
    }

}
