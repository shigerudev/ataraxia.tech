import { FormEvent, useState } from 'react';
import { Button, Input } from '@/shared/ui';
import type { TherapyModality } from '@/entities/session';
import { useTherapyFlow } from '@/features/session';
import './RegistrationForm.css';

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
    <div className="registration">
      <header className="registration__header">
        <h1>Da el siguiente paso</h1>
        <p>
          Elige cómo quieres continuar tu proceso. Usaremos un alias para proteger
          tu identidad; tus datos de contacto solo sirven para enviarte las
          convocatorias de tus sesiones.
        </p>
      </header>

      <form className="registration__form" onSubmit={handleSubmit} noValidate>
        <div className="registration__modalidad">
          <button
            type="button"
            className={`registration__option ${modalidad === 'individual' ? 'is-active' : ''}`}
            onClick={() => setModalidad('individual')}
          >
            <strong>Terapia individual</strong>
            <span>Sesiones uno a uno enfocadas en ti.</span>
          </button>
          <button
            type="button"
            className={`registration__option ${modalidad === 'grupal' ? 'is-active' : ''}`}
            onClick={() => setModalidad('grupal')}
          >
            <strong>Terapia grupal</strong>
            <span>Comparte con personas que viven algo similar.</span>
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
          <p className="registration__error" role="alert">
            {validation ?? error}
          </p>
        )}

        <Button type="submit" loading={loading} className="registration__submit">
          Confirmar
        </Button>
      </form>
    </div>
  );
}
