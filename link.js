'use client';
import { useRouter } from './router';

export function Link({ href, children, ...rest }) {
  const router = useRouter();
  const handleClick = (e) => {
    e.preventDefault();
    router.push(href);
  };
  return (
    <a href={href} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
