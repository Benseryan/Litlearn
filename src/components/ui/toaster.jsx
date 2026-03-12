import { Toaster as Sonner } from 'sonner';
export function Toaster(props) {
  return (
    <Sonner theme="light" className="toaster group"
      toastOptions={{ classNames: {
        toast: 'group toast bg-cream-dark text-olive-dark border border-neutral_tone/30 shadow-lg rounded-2xl',
        description: 'text-olive/60',
      }}}
      {...props} />
  );
}
