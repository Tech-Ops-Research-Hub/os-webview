import {useState, useEffect} from 'react';
import buildContext from '~/components/jsx-helpers/build-context';
import cmsFetch from '~/helpers/cms-fetch';

const adoptionName = '[name="Adoption_Status__c"]';

export const adoptionOptions = [{
    key: 'core',
    value: 'As the core textbook for my course',
    text: 'As the core textbook for my course'
}, {
    key: 'recommended',
    value: 'As an optional/recommended textbook for my course',
    text: 'As an optional/recommended textbook for my course'
}, {
    key: 'outside',
    value: 'To teach, tutor, or support students outside of a course setting',
    text: 'To teach, tutor, or support students outside of a course setting'
}, {
    key: 'self',
    value: 'For my own knowledge or other work',
    text: 'For my own knowledge or other work'
}];

const initialContextValue = {adoptionName};
const fetchPromise = cmsFetch('salesforce/forms/');

export function useContextValue() {
    const [value, setValue] = useState(initialContextValue);

    useEffect(() => {
        fetchPromise
            .then((sfData) => {
                const {
                    oid, debug, posting_url: webtoleadUrl,
                    adoption_form_posting_url: adoptionUrl,
                    interest_form_posting_url: interestUrl,
                    tech_scout_form_posting_url: techScoutUrl
                } = sfData[0];
                const webtocaseUrl = webtoleadUrl.replace('ToLead', 'ToCase');

                setValue({
                    ...initialContextValue,
                    oid, debug, webtoleadUrl, webtocaseUrl,
                    adoptionUrl, interestUrl, techScoutUrl
                });
            });
    }, []);

    return value;
}

const {useContext, ContextProvider} = buildContext({useContextValue});

export {
    useContext as default,
    ContextProvider as SalesforceContextProvider
};
