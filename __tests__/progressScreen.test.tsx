import React from 'react';
import TestRenderer from 'react-test-renderer';

// Mock stores
jest.mock('../store/progressStore', () => {
    let state: any = {
        loading: false,
        error: undefined,
        weeklyTarget: 3,
        weeklyCount: 0,
        consistencyPct: 0,
        streak: 0,
        weeklyVolumeSeries: [],
        recentPRs: [],
        topExercises: [],
        load: jest.fn(),
    };
    const useProgressStore = (selector?: any) => (selector ? selector(state) : state);
    (useProgressStore as any).__setState = (s: any) => { state = { ...state, ...s }; };
    return { useProgressStore };
});

jest.mock('../store/settingsStore', () => ({
    useSettingsStore: (selector?: any) => selector ? selector({ unitPreference: 'kg' }) : { unitPreference: 'kg' },
}));

jest.mock('../components/Button', () => ({
    Button: ({ title, onPress }: any) => {
        const React = require('react');
        return React.createElement('button', { onClick: onPress }, title);
    },
}));

jest.mock('../components/feedback/EmptyState', () => ({
    EmptyState: ({ title, message, action }: any) => {
        const React = require('react');
        return React.createElement('div', null, [
            React.createElement('span', { key: 't' }, title),
            React.createElement('span', { key: 'm' }, message),
            action || null,
        ]);
    },
}));

// Import from index explicitly to avoid resolving the legacy progress.tsx file
import ProgressScreen from '../app/(tabs)/progress/index';
import { useProgressStore as _useProgressStore } from '../store/progressStore';

// Note: These UI smoke tests use a lightweight RN mock. For a full RN test env, enable babel-jest + transformIgnorePatterns.
describe.skip('ProgressScreen UI', () => {
    const useProgressStore: any = _useProgressStore as any;

    beforeEach(() => {
        useProgressStore.__setState({
            loading: false,
            error: undefined,
            weeklyTarget: 3,
            weeklyCount: 0,
            consistencyPct: 0,
            streak: 0,
            weeklyVolumeSeries: [],
            recentPRs: [],
            topExercises: [],
            load: jest.fn(),
        });
    });

    it('renders error state and retries', () => {
        const load = jest.fn();
        useProgressStore.__setState({ error: 'boom', load });
        const tr = TestRenderer.create(<ProgressScreen />);
        const errorNode = tr.root.findAll((n: any) => typeof n.props.children === 'string' && n.props.children.includes('Unable to load progress'));
        expect(errorNode.length).toBeGreaterThan(0);
        const buttons = tr.root.findAllByType('button' as any);
        if (buttons[0]) (buttons[0].props as any).onClick?.();
        expect(load).toHaveBeenCalled();
    });

    it('renders empty sections when no data', () => {
        const tr = TestRenderer.create(<ProgressScreen />);
        const texts = ['No data yet', 'No PRs yet', 'No exercises tracked'];
        texts.forEach((t) => {
            const nodes = tr.root.findAll((n: any) => typeof n.props.children === 'string' && n.props.children.includes(t));
            expect(nodes.length).toBeGreaterThan(0);
        });
    });
});
