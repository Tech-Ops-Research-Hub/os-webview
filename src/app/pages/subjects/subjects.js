import React, {lazy, Suspense} from 'react';
import useSharedDataContext from '~/contexts/shared-data';
import {useLocation} from 'react-router-dom';

function useFeatureFlag() {
    const {flags: {new_subjects: flag}} = useSharedDataContext();

    return flag;
}

function useSelectedVersion(featureFlag) {
    const importFn = React.useCallback(
        () => {
            if (featureFlag === true) {
                return import('./new/subjects.js');
            }
            return import('./old/subjects.js');
        },
        [featureFlag]
    );
    const Component = React.useMemo(
        () => lazy(() => importFn()),
        [importFn]
    );

    return Component;
}

function SelectedComponent({featureFlag}) {
    const Component = useSelectedVersion(featureFlag);

    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <Component />
        </Suspense>
    );
}

export default function PickVersion() {
    const featureFlag = useFeatureFlag();
    const {pathname} = useLocation();
    const override = pathname.includes('-preview');

    if (featureFlag === null) {
        return null;
    }

    return (<SelectedComponent featureFlag={featureFlag || override} />);
}
