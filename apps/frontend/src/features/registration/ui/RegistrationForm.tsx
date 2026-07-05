import { FormEvent, useState } from 'react';
import { Button, Chip, IconArrowRight, IconCheck, IconLock, IconUser, IconUsers, Input } from '@/shared/ui';
import type { TherapyModality } from '@/entities/session';
import { useTherapyFlow } from '@/features/session';

const MODALITIES: {
  value: TherapyModality;
  icon: typeof IconUser;
  title: string;
  text: string;
}[] = [
  {
    value: 'individual',
    icon: IconUser,
    title: 'Terapia individual',
    text: 'Sesiones uno a uno enfocadas en ti.',
  },
  {
    value: 'grupal',
    icon: IconUsers,
    title: 'Terapia grupal',
    text: 'Comparte con personas que viven algo similar.',
  },
];

export function RegistrationForm() {
  const { goToScheduling, loading, error } = useTherapyFlow();
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [modalidad, setModalidad] = useState<TherapyModality>('individual');
  const [validation, setValidation] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!alias.trim()) {
      setValidation('Elige un alias para participar de forma anónima.');
      return;
    }
    setValidation(null);
    goToScheduling({
      aliasAnonimo: alias.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      modalidad,
    });
  }

  return (
    <div className="card flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Chip className="self-start">Último paso</Chip>
        <h1 className="font-display font-bold text-[clamp(24px,3.5vw,32px)] tracking-tight">
          Da el siguiente paso
        </h1>
        <p className="leading-relaxed text-muted">
          Elige cómo quieres continuar tu proceso. Usaremos un alias para proteger
          tu identidad; tus datos de contacto solo sirven para enviarte las
          convocatorias de tus sesiones.
        </p>
      </header>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2.5 text-sm font-medium text-ink">
            Modalidad de acompañamiento
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODALITIES.map(({ value, icon: Icon, title, text }) => {
              const active = modalidad === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  className={`select-card gap-1.5 pr-12 ${active ? 'is-active' : ''}`}
                  onClick={() => setModalidad(value)}
                >
                  <span
                    className={`absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border transition ${
                      active ? 'border-primary bg-primary text-white' : 'border-hairline bg-white text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className={`icon-tile mb-1 h-10 w-10 ${active ? 'bg-brand text-white' : 'bg-lavender text-primary-dark'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <strong className="font-display font-semibold">{title}</strong>
                  <span className="text-sm text-muted">{text}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Input
          label="Alias anónimo"
          name="alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Ej. Colibrí"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Correo electrónico (opcional)"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
          <Input
            label="Teléfono (opcional)"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+502 ..."
          />
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
          <IconLock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Tus datos de contacto se utilizan únicamente para coordinar tus sesiones;
          nunca se comparten con terceros.
        </p>

        {(validation || error) && (
          <p className="form-error" role="alert">
            {validation ?? error}
          </p>
        )}

        <Button type="submit" loading={loading} className="self-stretch sm:self-start">
          Continuar
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
