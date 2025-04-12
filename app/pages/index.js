import { Link } from '#cosmos-rsc/client';
import { cookies } from '#cosmos-rsc/server';
import { Counter } from '../components/counter';
import { logOnServer } from '../functions/log-on-server';

export default function Page() {
  const jar = cookies();
  console.log(jar.get('message'));
  jar.set('error-test', 'This is an error test', { httpOnly: true });
  return (
    <div>
      <h1>COSMOS RSC</h1>
      <Counter />
      <Link href='/streaming'>Streaming page</Link>
      <br />
      <Link href='/use-action-state-progressive-enhancement'>
        useActionState Progressive Enhancement
      </Link>
      <br />
      <Link href='/flash-messages'>Flash Messages</Link>
      <form action={logOnServer}>
        <input type='text' placeholder='Enter a message...' name='message' />
      </form>
    </div>
  );
}
