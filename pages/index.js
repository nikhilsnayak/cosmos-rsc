import { test } from '../actions/test';
import { Counter } from '../components/counter';
import { Link } from '../link';

export default function HomePage() {
  return (
    <section>
      <h1>My RSC frame work</h1>
      <Counter />
      <Link href='/test'>Test page </Link>
      <form action={test}>
        <input type='text' name='name' />
        <button type='submit'>submit</button>
      </form>
    </section>
  );
}
