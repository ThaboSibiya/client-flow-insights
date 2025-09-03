import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SecureLinkProps extends ComponentProps<'a'> {
  /**
   * Security-hardened external link component
   * Automatically adds security attributes to prevent reverse tabnabbing
   */
  external?: boolean;
  /**
   * Custom security policy for referrer
   */
  referrerPolicy?: 'no-referrer' | 'strict-origin-when-cross-origin' | 'same-origin';
}

/**
 * Security-hardened link component that prevents reverse tabnabbing and other link-based attacks
 * Automatically applies security best practices for external links
 */
export const SecureLink = forwardRef<HTMLAnchorElement, SecureLinkProps>(
  ({ external = false, referrerPolicy = 'no-referrer', className, children, ...props }, ref) => {
    const securityProps = external ? {
      target: '_blank',
      rel: 'noopener noreferrer',
      referrerPolicy
    } : {};

    return (
      <a
        ref={ref}
        className={cn(
          "text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        {...securityProps}
        {...props}
      >
        {children}
      </a>
    );
  }
);

SecureLink.displayName = 'SecureLink';