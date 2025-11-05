import React from 'react';
import TestRenderer from 'react-test-renderer';

// Mock the store to return simple, controllable values
jest.mock('../store/historyStore', () => {
    let state: any = {
        items: [],
        isLoading: false,
        hasMore: false,
        error: undefined,
        loadInitial: jest.fn(),
        loadMore: jest.fn(),
    };
    const useHistoryStore = (selector?: any) => (selector ? selector(state) : state);
    // helper to update state in tests
    (useHistoryStore as any).__setState = (s: any) => {
        state = { ...state, ...s };
    };
    return { useHistoryStore };
});

jest.mock('../store/settingsStore', () => ({
    useSettingsStore: (selector?: any) => selector ? selector({ unitPreference: 'kg' }) : { unitPreference: 'kg' },
}));

// Mock complex child component to a simple stub
jest.mock('../components/lists/WorkoutCard', () => ({
    WorkoutCard: ({ workout }: any) => {
        const React = require('react');
        return React.createElement('Text', null, `Workout ${workout.id}`);
    },
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

import HistoryListScreen from '../app/(tabs)/history/index';
import { useHistoryStore as _useHistoryStore } from '../store/historyStore';

// Note: These UI smoke tests use a lightweight RN mock. For a full RN test env, enable babel-jest + transformIgnorePatterns.
describe.skip('HistoryListScreen UI', () => {
    const useHistoryStore: any = _useHistoryStore as any;

    beforeEach(() => {
        useHistoryStore.__setState({
            items: [],
            isLoading: false,
            hasMore: false,
            error: undefined,
            loadInitial: jest.fn(),
            loadMore: jest.fn(),
        });
    });

    it('renders empty state when no workouts', () => {
        const tr = TestRenderer.create(<HistoryListScreen />);
        const nodeText = tr.root.findAll((n: any) => typeof n.props.children === 'string' && n.props.children.includes('No Workouts Yet'));
        expect(nodeText.length).toBeGreaterThan(0);
    });

    it('renders error state with retry button', () => {
        const loadInitial = jest.fn();
        useHistoryStore.__setState({ error: 'oops', loadInitial });

        const tr = TestRenderer.create(<HistoryListScreen />);
        const errorNode = tr.root.findAll((n: any) => typeof n.props.children === 'string' && n.props.children.includes('Something went wrong'));
        expect(errorNode.length).toBeGreaterThan(0);
        // Press the first button we find
        const buttons = tr.root.findAllByType('button' as any);
        if (buttons[0]) (buttons[0].props as any).onClick?.();
        expect(loadInitial).toHaveBeenCalled();
    });
});
