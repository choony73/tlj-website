import {Suspense} from 'react';
import ConfirmationContent from '@/components/cart/ConfirmationContent';

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
