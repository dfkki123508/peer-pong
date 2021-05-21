import * as React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import P2PService from './services/P2PService';

const rootEl = document.getElementById('root');

const p2pService = P2PService.getInstance();

render(<App />, rootEl);
