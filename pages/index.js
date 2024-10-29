import { Counter } from '../components/counter';
import { Link } from '../link';

export default function HomePage() {
  return (
    <section>
      <h1>My RSC frame work</h1>
      <Counter />
      <Link href='/test'>Test page </Link>
    </section>
  );
}
