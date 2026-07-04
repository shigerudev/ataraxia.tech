# MongoDB — Scripts de inicialización (fuente de verdad)

Esta carpeta es la **única fuente de verdad** del estado inicial de la base de
datos de Ataraxia. Cualquier cambio en la estructura o en los datos base de la
instancia Mongo debe reflejarse aquí.

## Cómo se ejecutan

El servicio `mongo-seed` (definido en `docker-compose.yml`) ejecuta **todos** los
`.js` de `init/` en orden alfabético en **cada** `up`, una vez que MongoDB está
saludable. Los scripts son **idempotentes** (usan `updateOne` con `upsert`), por
lo que ejecutarlos repetidamente no duplica datos.

```
mongo/
└── init/
    ├── 01-users.js      # Usuarios por defecto (contraseñas bcrypt)
    └── 02-sessions.js   # Datos de ejemplo (sesiones)
```

## Convenciones

- Prefija los archivos con un número para controlar el orden (`01-`, `02-`, …).
- Usa `updateOne({ ... }, { $set: ... }, { upsert: true })` para mantener la idempotencia.
- Las contraseñas van **siempre** encriptadas con bcrypt; nunca en texto plano.

### Regenerar un hash de contraseña

```bash
node -e "console.log(require('bcryptjs').hashSync('NUEVA_PASS', 10))"
```

## Credenciales de ejemplo

Todos los usuarios usan la contraseña `Ataraxia2024!` (almacenada encriptada):

| Email | Rol |
|-------|-----|
| `psicologo@ataraxia.tech` | Psicólogo/a |
| `paciente@ataraxia.tech` | Paciente |
| `admin@ataraxia.tech` | Administrador |
