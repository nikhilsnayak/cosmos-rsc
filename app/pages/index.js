import { Counter } from '../components/counter';
import Link from '../../framework/client/link';
import { logOnServer } from '../functions/log-on-server';

export default function Page() {
  return (
    <div>
      <h1>COSMOS RSC</h1>
      <Counter />
      <Link href='/streaming'>Stremaing page</Link>
      <form action={logOnServer}>
        <input type='text' placeholder='Enter a message...' name='message' />
      </form>
    </div>
  );
}
