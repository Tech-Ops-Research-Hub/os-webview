import {useState, useEffect} from 'react';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';

const settings = window.SETTINGS;
const accountsUrl = `${settings.accountHref}/api/user`;

function cached(fn) {
    let valid = false;
    let cachedResult = null;
    const cachedFn = function () {
        if (!valid) {
            cachedResult = fn();
            valid = true;
        }
        return cachedResult;
    };

    cachedFn.invalidate = () => {
        valid = false;
    };
    return cachedFn;
}

const accountsModel = {
    load: cached(() => {
        // Uncomment ONLY to TEST
        // return Promise.resolve({
        //     id: 315605,
        //     name: 'Roy2 Johnson',
        //     first_name: 'Roy2',
        //     last_name: 'Johnson',
        //     full_name: 'Roy2 Johnson',
        //     uuid: 'fca73689-fc4d-4369-bc46-ad6e02b9a13b',
        //     support_identifier: 'cs_fce9a9e8',
        //     is_test: false,
        //     faculty_status: 'confirmed_faculty',
        //     is_instructor_verification_stale: false,
        //     is_profile_complete: false,
        //     is_newflow: true,
        //     self_reported_role: 'student',
        //     self_reported_school: 'Rice U',
        //     school_type: 'unknown_school_type',
        //     contact_infos: [
        //         {
        //             id: 312328,
        //             type: 'EmailAddress',
        //             value: 'rej2+2@rice.edu',
        //             is_verified: true,
        //             is_guessed_preferred: true
        //         }
        //     ],
        //     applications: [
        //         // {name: 'OpenStax Tutor'}
        //     ]
        // });
        // // eslint-disable-next-line no-unreachable
        return fetch(accountsUrl, {credentials: 'include'})
            .then(
                (response) => {
                    return response.json().then((result) => {
                        if (window.dataLayer) {
                            window.dataLayer.push({
                                faculty_status: result.faculty_status
                            });
                        }
                        return result;
                    });
                },
                (err) => {
                    console.warn('"Error fetching user info"');
                    return {err};
                }
            );
    })
};

// eslint-disable-next-line complexity
function oldUserModel(sfUserModel) {
    if (!('id' in sfUserModel)) {
        return {};
    }
    const findPreferredEmail = (contacts) => (contacts
        .filter((obj) => obj.type === 'EmailAddress')
        .reduce((a, b) => {
            if (b.is_guessed_preferred || (b.is_verified && !a.is_verified)) {
                return b;
            }
            return a;
        }) || {}).value;
    const isStudent = ['student', 'unknown_role'].includes(sfUserModel.self_reported_role);
    const isVerificationStale = !isStudent && sfUserModel.is_instructor_verification_stale;
    const isVerificationPending = !isStudent &&
        ['pending_faculty'].includes(sfUserModel.faculty_status) && !isVerificationStale;
    const groups = (function () {
        const result = (sfUserModel.applications || [])
            .map((obj) => obj.name)
            .filter((name) => name === 'OpenStax Tutor');

        if (isStudent) {
            result.push('Student');
        }
        if (sfUserModel.faculty_status === 'confirmed_faculty') {
            result.push('Faculty');
        }
        return result;
    })();

    /* eslint camelcase: 0 */
    return {
        id: sfUserModel.id,
        accounts_id: sfUserModel.id,
        email: (sfUserModel.contact_infos || []).length ? findPreferredEmail(sfUserModel.contact_infos) : null,
        first_name: sfUserModel.first_name,
        groups,
        last_name: sfUserModel.last_name,
        pending_verification: isVerificationPending,
        stale_verification: isVerificationStale,
        needs_profile_completed: sfUserModel.needs_complete_edu_profile,
        is_newflow: sfUserModel.is_newflow,
        username: sfUserModel.id,
        self_reported_role: sfUserModel.self_reported_role,
        self_reported_school: sfUserModel.self_reported_school,
        is_not_gdpr_location: sfUserModel.is_not_gdpr_location,
        salesforce_contact_id: sfUserModel.salesforce_contact_id
    };
}

const userModel = {
    load() {
        return accountsModel.load().then(oldUserModel);
    }
};

const throttledLoginCheck = throttle((setData) => {
    accountsModel.load().then((oldUser) => {
        accountsModel.load.invalidate();
        accountsModel.load().then((newUser) => {
            if (!isEqual(oldUser, newUser)) {
                userModel.load().then(setData);
            }
        });
    });
}, 30000);

function useUserModel() {
    const [data, setData] = useState();

    useEffect(() => {
        const check = () => throttledLoginCheck(setData);

        window.addEventListener('focus', check);
        userModel.load().then(setData);

        return () => window.removeEventListener('focus', check);
    }, []);

    return data;
}

export default userModel;
export {accountsModel, useUserModel};
