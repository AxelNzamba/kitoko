import { Button } from '@/components/ui/button';

/** Clavier numérique tactile pour le POS (montant reçu, quantités). */
export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}) {
  const insert = (digit: string) => {
    if (digit === '.' && value.includes('.')) return;
    onChange(value + digit);
  };
  const clear = () => onChange('');
  const back = () => onChange(value.slice(0, -1));

  const keys: Array<{ label: string; action: () => void; variant?: 'outline' }> = [
    { label: '7', action: () => insert('7') },
    { label: '8', action: () => insert('8') },
    { label: '9', action: () => insert('9') },
    { label: 'C', action: clear, variant: 'outline' },
    { label: '4', action: () => insert('4') },
    { label: '5', action: () => insert('5') },
    { label: '6', action: () => insert('6') },
    { label: '←', action: back, variant: 'outline' },
    { label: '1', action: () => insert('1') },
    { label: '2', action: () => insert('2') },
    { label: '3', action: () => insert('3') },
    { label: '.', action: () => insert('.'), variant: 'outline' },
    { label: '0', action: () => insert('0') },
    { label: '00', action: () => insert('00') },
    { label: 'Valider', action: () => onSubmit?.(), variant: 'outline' },
  ];

  return (
    <div className='grid grid-cols-4 gap-2'>
      {keys.map((k) => (
        <Button
          key={k.label}
          type='button'
          size='lg'
          variant={k.variant ?? 'default'}
          onClick={k.action}
          disabled={disabled}
          className={
            k.label === 'Valider' ? 'col-span-2 h-14 text-sm font-semibold' : 'h-14 text-xl font-bold'
          }
        >
          {k.label}
        </Button>
      ))}
    </div>
  );
}
