import { useRouter } from './router/index.js';

export function Link({ href, children, ...rest }) {
  const router = useRouter();
  const handleClick = (e) => {
    e.preventDefault();
    if (!href) return;
    router.push(href);
  };
  return (
    <a href={href} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
