import { createRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

const root = createRoot(document.getElementById('root'));

const { pathname } = new URL(window.location.href);

createFromFetch(fetch(`${pathname}?_rsc=true`), {
  callServer: () => {
    console.log('hello');
  },
}).then((Component) => {
  root.render(Component);
});
