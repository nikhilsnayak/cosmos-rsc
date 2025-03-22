import { LoginForm } from '../components/login-form';
import { login } from '../functions/login';

export default function Page() {
  return (
    <div>
      <LoginForm action={login} />
    </div>
  );
}
