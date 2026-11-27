import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Store,
  Warehouse,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const STEPS: Step[] = [
  {
    id: 'identity',
    title: 'Identité de l\'entreprise',
    description: 'Nom, logo et devise principale de votre boutique/entrepôt.',
    icon: Store,
  },
  {
    id: 'warehouse',
    title: 'Votre entrepôt / boutique',
    description: 'Créez le premier entrepôt ou boutique sur le site.',
    icon: Warehouse,
  },
  {
    id: 'catalogue',
    title: 'Import du catalogue',
    description: 'Importez votre catalogue de produits depuis un fichier Excel.',
    icon: FileSpreadsheet,
  },
];

export function OnboardingStepper({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);

  const currentStep = STEPS[current];

  const goNext = () => {
    if (current < STEPS.length - 1) setCurrent((c) => c + 1);
    else onComplete();
  };

  const goPrev = () => setCurrent((c) => c - 1);

  return (
    <div className='max-w-md mx-auto'>
      <Card>
        <CardHeader className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <currentStep.icon className='size-6 text-primary' />
          </div>
          <h2 className='text-lg font-bold'>{currentStep.title}</h2>
          <p className='text-sm text-muted-foreground'>
            {currentStep.description}
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex justify-center gap-2'>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={
                  i === current
                    ? 'h-2 rounded-full bg-primary'
                    : i < current
                    ? 'h-2 rounded-full bg-primary/60'
                    : 'h-2 rounded-full bg-muted'
                }
              />
            ))}
          </div>

          <div className='space-y-2'>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={
                  i === current
                    ? 'flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm font-medium text-primary'
                    : i < current
                    ? 'flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700'
                    : 'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground'
                }
              >
                {i < current ? (
                  <CheckCircle className='size-3' />
                ) : (
                  <div className='size-3 rounded-full border-2 border-muted-foreground' />
                )}
                {s.title}
              </div>
            ))}
          </div>

          <div className='flex justify-between'>
            <Button variant='ghost' onClick={goPrev} disabled={current === 0}>
              <ArrowLeft className='size-3.5 mr-1.5' /> Précédent
            </Button>
            {current === STEPS.length - 1 ? (
              <Button onClick={onComplete}>
                Terminer
                <ArrowRight className='size-3.5 ml-1.5' />
              </Button>
            ) : (
              <Button onClick={goNext}>
                Suivant
                <ArrowRight className='size-3.5 ml-1.5' />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
