import { FlashMessages } from './components/flash-messages';
import { flash } from '#cosmos-rsc/server';

export default function RootLayout({ children }) {
  flash({ message: 'Hello World From Server' });

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>COSMOS RSC</title>
        <link rel='stylesheet' href='/style.css' />
      </head>
      <body>
        {children}
        <FlashMessages />
      </body>
    </html>
  );
}
