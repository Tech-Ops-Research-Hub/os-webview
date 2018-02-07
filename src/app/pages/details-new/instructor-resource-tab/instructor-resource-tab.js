import {Controller} from 'superb.js';
import ResourceBox from '../resource-box/resource-box';
import {description as template} from './instructor-resource-tab.html';

export default class InstructorResourceTab extends Controller {

    init(model) {
        this.template = template;
        this.model = model;
    }

    onLoaded() {
        const Region = this.regions.self.constructor;
        const resourceBoxes = this.el.querySelectorAll('resource-box');

        for (const index of this.model.resources.keys()) {
            const region = new Region(resourceBoxes[index]);
            const resourceBox = new ResourceBox(this.model.resources[index]);

            region.attach(resourceBox);
        }
    }

}
