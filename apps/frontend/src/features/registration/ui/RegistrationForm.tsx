import { FormEvent, useState } from 'react';
import { Button, Chip, Input } from '@/shared/ui';
import type { TherapyModality } from '@/entities/session';
import { useTherapyFlow } from '@/features/session';

export function RegistrationForm() {
  const { register, loading, error } = useTherapyFlow();
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [modalidad, setModalidad] = useState<TherapyModality>('individual');
  const [validation, setValidation] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!alias.trim()) {
      setValidation('Elige un alias para participar de forma anónima.');
      return;
    }
    setValidation(null);
    await register({
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
        <p className="text-muted leading-relaxed">
          Elige cómo quieres continuar tu proceso. Usaremos un alias para proteger
          tu identidad; tus datos de contacto solo sirven para enviarte las
          convocatorias de tus sesiones.
        </p>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            className={`select-card ${modalidad === 'individual' ? 'is-active' : ''}`}
            onClick={() => setModalidad('individual')}
          >
            <strong className="font-display font-semibold">Terapia individual</strong>
            <span className="text-muted text-sm">Sesiones uno a uno enfocadas en ti.</span>
          </button>
          <button
            type="button"
            className={`select-card ${modalidad === 'grupal' ? 'is-active' : ''}`}
            onClick={() => setModalidad('grupal')}
          >
            <strong className="font-display font-semibold">Terapia grupal</strong>
            <span className="text-muted text-sm">Comparte con personas que viven algo similar.</span>
          </button>
        </div>

        <Input
          label="Alias anónimo"
          name="alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Ej. Colibrí"
          required
        />
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

        {(validation || error) && (
          <p className="text-pink font-medium text-sm" role="alert">
            {validation ?? error}
          </p>
        )}

        <Button type="submit" loading={loading} className="self-start">
          Confirmar
        </Button>
      </form>
    </div>
  );
}
