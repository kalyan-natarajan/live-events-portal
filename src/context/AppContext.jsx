import { createContext, useContext, useReducer, useEffect } from 'react';
import { myTickets as initialTickets } from '../data/mockData';

const AppContext = createContext();

const initialState = {
  favorites: {
    artists: ['a1', 'a3'],
    teams: ['t1'],
    venues: ['v2', 'v3'],
  },
  tickets: initialTickets,
  offlineTickets: {},
  searchQuery: '',
  selectedCategory: null,
  selectedCity: null,
  notifications: [],
};

function loadState() {
  try {
    const saved = localStorage.getItem('liveEventsState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed };
    }
  } catch {
    // ignore
  }
  return initialState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const { category, id } = action.payload;
      const list = state.favorites[category];
      const updated = list.includes(id)
        ? list.filter((x) => x !== id)
        : [...list, id];
      return { ...state, favorites: { ...state.favorites, [category]: updated } };
    }
    case 'ADD_TICKET': {
      return { ...state, tickets: [...state.tickets, action.payload] };
    }
    case 'UPDATE_TICKET': {
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    }
    case 'REMOVE_TICKET': {
      return {
        ...state,
        tickets: state.tickets.filter((t) => t.id !== action.payload),
      };
    }
    case 'SAVE_OFFLINE': {
      return {
        ...state,
        offlineTickets: { ...state.offlineTickets, [action.payload.id]: action.payload },
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id ? { ...t, offlineSaved: true } : t
        ),
      };
    }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_CITY':
      return { ...state, selectedCity: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 20) };
    case 'CLEAR_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    const toSave = { favorites: state.favorites, offlineTickets: state.offlineTickets };
    localStorage.setItem('liveEventsState', JSON.stringify(toSave));
  }, [state.favorites, state.offlineTickets]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
